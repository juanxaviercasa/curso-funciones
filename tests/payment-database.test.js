import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {applyPayment,checkout} from '../apps/api/src/payments';
let sqlite,env;
class Statement {
 constructor(sql,args=[]){this.sql=sql;this.args=args;}
 bind(...args){return new Statement(this.sql,args);}
 async first(){return sqlite.prepare(this.sql).get(...this.args)||null;}
 async all(){return {results:sqlite.prepare(this.sql).all(...this.args)};}
 async run(){return sqlite.prepare(this.sql).run(...this.args);}
}
beforeEach(()=>{
 sqlite=new DatabaseSync(':memory:');
 sqlite.exec(readFileSync('database/migrations/0001_initial.sql','utf8'));
 sqlite.exec(readFileSync('database/migrations/0003_orders_api.sql','utf8'));
 sqlite.exec("INSERT INTO users(id,auth_subject,email) VALUES('alice','a','alice@example.test'),('bob','b','bob@example.test'); INSERT INTO orders(id,user_id,sku,amount_minor,currency,provider,external_reference) VALUES('o1','alice','MSV-FUN-001',6700,'PEN','mercadopago','r1'),('o2','bob','MSV-FUN-001',6700,'PEN','mercadopago','r2');");
 env={MERCADOPAGO_COLLECTOR_ID:'789',DB:{prepare:sql=>new Statement(sql),batch:async stmts=>{sqlite.exec('BEGIN');try{for(const s of stmts)await s.run();sqlite.exec('COMMIT');}catch(e){sqlite.exec('ROLLBACK');throw e;}}}};
});
const base={id:'ORDTST0000000000123',status:'approved',transaction_amount:67,currency_id:'PEN',collector_id:789,external_reference:'r1',live_mode:false,date_last_updated:'2026-10-30T12:00:00Z',additional_info:{items:[{id:'MSV-FUN-001',quantity:1}]}};
const active=()=>Number(sqlite.prepare('SELECT COUNT(*) n FROM entitlements WHERE active=1').get().n);
it('eventos duplicados conceden exactamente un derecho',async()=>{await applyPayment(env,base,'event1');await applyPayment(env,base,'event1');expect(active()).toBe(1);expect(sqlite.prepare('SELECT COUNT(*) n FROM payment_events').get().n).toBe(1);});
it('un pago nunca concede acceso al otro alumno',async()=>{await applyPayment(env,base,'event1');expect(sqlite.prepare("SELECT COUNT(*) n FROM entitlements WHERE user_id='bob'").get().n).toBe(0);});
it('un pendiente no concede acceso',async()=>{await applyPayment(env,{...base,status:'pending'},'event1');expect(active()).toBe(0);});
it('un evento pendiente atrasado no revierte aprobación',async()=>{await applyPayment(env,base,'event1');await applyPayment(env,{...base,status:'pending',date_last_updated:'2026-10-30T11:00:00Z'},'event2');expect(active()).toBe(1);});
it('un pendiente posterior tampoco reemplaza aprobación',async()=>{await applyPayment(env,base,'event1');await applyPayment(env,{...base,status:'pending',date_last_updated:'2026-10-30T13:00:00Z'},'event2');expect(active()).toBe(1);});
it('una devolución revoca y una aprobación vieja no reactiva',async()=>{await applyPayment(env,base,'event1');await applyPayment(env,{...base,status:'refunded',date_last_updated:'2026-10-30T13:00:00Z'},'event2');expect(active()).toBe(0);await applyPayment(env,base,'event3');expect(active()).toBe(0);});
it('un fallo parcial hace rollback de evento, pago y acceso',async()=>{sqlite.exec("CREATE TRIGGER fail_grant BEFORE INSERT ON entitlements BEGIN SELECT RAISE(ABORT,'test_failure'); END;");await expect(applyPayment(env,base,'event1')).rejects.toThrow();expect(sqlite.prepare('SELECT COUNT(*) n FROM payments').get().n).toBe(0);expect(sqlite.prepare('SELECT COUNT(*) n FROM payment_events').get().n).toBe(0);});
it('no reasigna un mismo pago a otra orden',async()=>{await applyPayment(env,base,'event1');await applyPayment(env,{...base,external_reference:'r2'},'event2');expect(sqlite.prepare("SELECT COUNT(*) n FROM entitlements WHERE user_id='bob'").get().n).toBe(0);});
it('una devolución conserva acceso por otra compra aprobada',async()=>{sqlite.exec("INSERT INTO orders(id,user_id,sku,amount_minor,currency,provider,external_reference) VALUES('o3','alice','MSV-FUN-001',6700,'PEN','mercadopago','r3')");await applyPayment(env,base,'event1');await applyPayment(env,{...base,id:'ORDTST0000000000456',external_reference:'r3'},'event2');await applyPayment(env,{...base,status:'refunded',date_last_updated:'2026-10-30T13:00:00Z'},'event3');expect(active()).toBe(1);});

afterEach(()=>vi.unstubAllGlobals());
function checkoutEnv(){return {...env,PAYMENT_TEST_USER_IDS:'alice',APP_ENV:'staging',PAYMENTS_ENABLED:'sandbox',APP_ORIGIN:'https://example.test',MERCADOPAGO_ACCESS_TOKEN:'fixture',MERCADOPAGO_WEBHOOK_SECRET:'fixture',MERCADOPAGO_APPLICATION_ID:'app1'};}
function mockOrders(){return vi.fn(async(_url,init)=>{const body=JSON.parse(init.body);return Response.json({id:'ORDTST0000000000123',type:'online',processing_mode:'manual',status:'created',status_detail:'created',external_reference:body.external_reference,total_amount:'67.00',total_paid_amount:'0.00',currency:'PEN',country_code:'PER',user_id:'789',integration_data:{application_id:'app1'},last_updated_date:'2026-10-31T12:00:00Z',items:body.items,checkout_url:'https://www.mercadopago.com.pe/checkout/v1/redirect?order_id=ORDTST0000000000123'});});}
it('reintentar checkout conserva una orden y la clave de idempotencia',async()=>{sqlite.exec('UPDATE products SET active=1');const mock=mockOrders();vi.stubGlobal('fetch',mock);const key='11111111-1111-4111-8111-111111111111';const first=await checkout(checkoutEnv(),'alice',key);const second=await checkout(checkoutEnv(),'alice',key);expect(second.orderId).toBe(first.orderId);expect(mock.mock.calls[0][1].headers.get('X-Idempotency-Key')).toBe(first.orderId);expect(mock.mock.calls[1][1].body).toBe(mock.mock.calls[0][1].body);expect(active()).toBe(0);});
it('un timeout conserva la orden y reutiliza la misma solicitud',async()=>{sqlite.exec('UPDATE products SET active=1');const key='22222222-2222-4222-8222-222222222222';const mock=vi.fn().mockRejectedValueOnce(Error('timeout'));vi.stubGlobal('fetch',mock);await expect(checkout(checkoutEnv(),'alice',key)).rejects.toThrow();const saved=sqlite.prepare('SELECT id FROM orders WHERE checkout_key=?').get(key).id;mock.mockImplementation(mockOrders());expect((await checkout(checkoutEnv(),'alice',key)).orderId).toBe(saved);expect(active()).toBe(0);});
it('no crea órdenes si el producto no está habilitado',async()=>{const mock=mockOrders();vi.stubGlobal('fetch',mock);await expect(checkout(checkoutEnv(),'alice','33333333-3333-4333-8333-333333333333')).rejects.toThrow('disponible');expect(mock).not.toHaveBeenCalled();});
