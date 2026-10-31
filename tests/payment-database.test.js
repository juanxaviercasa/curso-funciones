import {outline,submit} from '../apps/api/src/training';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {applyPayment,checkout,webhook,reconcile} from '../apps/api/src/payments';
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
 sqlite.exec(readFileSync('database/migrations/0004_payment_environment.sql','utf8'));
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

function productionEnv(){return {...checkoutEnv(),PRODUCTION_WEBHOOKS_ENABLED:'true',MERCADOPAGO_PRODUCTION_ACCESS_TOKEN:'production-fixture',MERCADOPAGO_PRODUCTION_WEBHOOK_SECRET:'production-signature-fixture',PRODUCTION_PAYMENT_USER_IDS:'alice'};}
function productionResource(patch={}){return {id:'ORD0000000000123',type:'online',processing_mode:'manual',status:'processed',status_detail:'accredited',external_reference:'r1',total_amount:'67.00',total_paid_amount:'67.00',currency:'PEN',country_code:'PER',user_id:'291342046',integration_data:{application_id:'2136866391679868'},last_updated_date:'2026-10-31T12:00:00Z',items:[{external_code:'MSV-FUN-001',quantity:1,unit_price:'67.00'}],transactions:{payments:[{status:'processed',status_detail:'accredited',amount:'67',paid_amount:'67'}]},...patch};}
async function productionNotification(live=true,secret='production-signature-fixture',id='ORD0000000000123'){
 const ts=String(Date.now()),encoder=new TextEncoder(),key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const digest=new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode('id:'+id+';request-id:real-event-1;ts:'+ts+';')));
 const hex=Array.from(digest,b=>b.toString(16).padStart(2,'0')).join('');
 return new Request('https://example.test/api/webhooks/mercadopago-production?type=order&data.id='+id,{method:'POST',headers:{'Content-Type':'application/json','x-request-id':'real-event-1','x-signature':'ts='+ts+',v1='+hex},body:JSON.stringify({type:'order',live_mode:live,data:{id}})});
}
function realLocalOrder(){sqlite.exec("UPDATE orders SET payment_environment='production',provider_order_id='ORD0000000000123' WHERE id='o1'");}
it('producción permanece cerrada antes de autorizar la compra real',async()=>{const mock=vi.fn();vi.stubGlobal('fetch',mock);await expect(checkout(productionEnv(),'alice',crypto.randomUUID(),true)).rejects.toThrow('desactivada');expect(mock).not.toHaveBeenCalled();});
it('webhook real concede un solo acceso al alumno correcto sin retorno del navegador',async()=>{realLocalOrder();const mock=vi.fn().mockImplementation(async()=>Response.json(productionResource()));vi.stubGlobal('fetch',mock);await webhook(await productionNotification(),productionEnv(),true);await webhook(await productionNotification(),productionEnv(),true);expect(active()).toBe(1);expect(sqlite.prepare("SELECT user_id FROM entitlements WHERE active=1").get().user_id).toBe('alice');expect(sqlite.prepare('SELECT COUNT(*) n FROM payments').get().n).toBe(1);expect(mock.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer production-fixture');});
it.each([{total_amount:'66.99'},{currency:'USD'},{user_id:'789'},{integration_data:{application_id:'other'}},{external_reference:'r2'},{items:[{external_code:'other',quantity:1,unit_price:'67.00'}]}])('producción rechaza un recurso incompatible %s',async patch=>{realLocalOrder();vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json(productionResource(patch))));await expect(webhook(await productionNotification(),productionEnv(),true)).rejects.toThrow();expect(active()).toBe(0);});
it('producción rechaza firma falsa antes de consultar el proveedor',async()=>{const mock=vi.fn();vi.stubGlobal('fetch',mock);await expect(webhook(await productionNotification(true,'wrong'),productionEnv(),true)).rejects.toThrow('Firma');expect(mock).not.toHaveBeenCalled();});
it('producción rechaza evento de prueba aunque la firma sea válida',async()=>{const mock=vi.fn();vi.stubGlobal('fetch',mock);await expect(webhook(await productionNotification(false),productionEnv(),true)).rejects.toThrow();expect(mock).not.toHaveBeenCalled();});
it('un webhook real no convierte una orden sandbox en real',async()=>{vi.stubGlobal('fetch',vi.fn().mockImplementation(async()=>Response.json(productionResource())));await expect(webhook(await productionNotification(),productionEnv(),true)).rejects.toThrow('Entorno');expect(active()).toBe(0);});
it('un pago real pendiente no entrega acceso',async()=>{realLocalOrder();vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json(productionResource({status:'action_required',total_paid_amount:'0'}))));await webhook(await productionNotification(),productionEnv(),true);expect(active()).toBe(0);});
it('una devolución real revoca y un evento antiguo no restaura acceso',async()=>{realLocalOrder();const mock=vi.fn().mockImplementation(async()=>Response.json(productionResource()));vi.stubGlobal('fetch',mock);await webhook(await productionNotification(),productionEnv(),true);mock.mockImplementation(async()=>Response.json(productionResource({status:'refunded',last_updated_date:'2026-10-31T13:00:00Z'})));await webhook(await productionNotification(),productionEnv(),true);expect(active()).toBe(0);mock.mockImplementation(async()=>Response.json(productionResource()));await webhook(await productionNotification(),productionEnv(),true);expect(active()).toBe(0);});
it('reconciliación real exige notificación firmada previa para conceder',async()=>{realLocalOrder();vi.stubGlobal('fetch',vi.fn().mockImplementation(async()=>Response.json(productionResource())));expect((await reconcile(productionEnv(),'alice','o1')).status).toBe('awaiting_notification');expect(active()).toBe(0);await webhook(await productionNotification(),productionEnv(),true);expect((await reconcile(productionEnv(),'alice','o1')).status).toBe('approved');});

it('checkout real restringido persiste entorno y no concede acceso antes de pagar',async()=>{sqlite.exec('UPDATE products SET active=1');const mock=vi.fn(async(_url,init)=>{const body=JSON.parse(init.body);return Response.json(productionResource({external_reference:body.external_reference,status:'created',total_paid_amount:'0',checkout_url:'https://www.mercadopago.com.pe/checkout/v1/redirect?order_id=ORD0000000000123'}));});vi.stubGlobal('fetch',mock);const config={...productionEnv(),PRODUCTION_CHECKOUT_ENABLED:'restricted'};const key=crypto.randomUUID();const first=await checkout(config,'alice',key,true);await checkout(config,'alice',key,true);expect(sqlite.prepare('SELECT payment_environment FROM orders WHERE id=?').get(first.orderId).payment_environment).toBe('production');expect(mock.mock.calls[0][1].body).toBe(mock.mock.calls[1][1].body);expect(active()).toBe(0);await expect(checkout(config,'bob',crypto.randomUUID(),true)).rejects.toThrow('autorizados');});
it('una clave de checkout de sandbox no se reutiliza en producción',async()=>{sqlite.exec('UPDATE products SET active=1');const key=crypto.randomUUID();vi.stubGlobal('fetch',mockOrders());await checkout(checkoutEnv(),'alice',key);const mock=vi.fn();vi.stubGlobal('fetch',mock);await expect(checkout({...productionEnv(),PRODUCTION_CHECKOUT_ENABLED:'restricted'},'alice',key,true)).rejects.toThrow('otro entorno');expect(mock).not.toHaveBeenCalled();});

it('autorización por correo se limita a la cuenta local verificada elegida',async()=>{sqlite.exec('UPDATE products SET active=1');const config={...productionEnv(),PRODUCTION_CHECKOUT_ENABLED:'restricted',PRODUCTION_PAYMENT_USER_IDS:'',PRODUCTION_PAYMENT_EMAILS:'alice@example.test'};const mock=vi.fn(async(_url,init)=>{const body=JSON.parse(init.body);return Response.json(productionResource({external_reference:body.external_reference,status:'created',total_paid_amount:'0',checkout_url:'https://www.mercadopago.com.pe/checkout/v1/redirect?order_id=ORD0000000000123'}));});vi.stubGlobal('fetch',mock);await expect(checkout(config,'bob',crypto.randomUUID(),true)).rejects.toThrow('autorizados');expect(mock).not.toHaveBeenCalled();await checkout(config,'alice',crypto.randomUUID(),true);expect(mock).toHaveBeenCalledTimes(1);expect(JSON.parse(mock.mock.calls[0][1].body).payer).toEqual({email:'alice@example.test'});expect(active()).toBe(0);});

it('avance educativo conserva intentos por alumno y no expone soluciones privadas',async()=>{
 sqlite.exec(readFileSync('database/migrations/0002_training.sql','utf8'));
 const initial=await outline(env,'alice');expect(initial.activity.attempts).toBe(0);
 const q=sqlite.prepare('SELECT * FROM questions LIMIT 1').get();
 const expected=String(JSON.parse(q.private_rule_json).expected);
 await submit(env,'alice',q.id,expected);
 const own=await outline(env,'alice');const other=await outline(env,'bob');
 expect(own.activity).toEqual({attempts:1,correctAttempts:1,solvedQuestions:1});
 expect(other.activity).toEqual({attempts:0,correctAttempts:0,solvedQuestions:0});
 expect(other.lessons.every(l=>l.completed===0)).toBe(true);
 expect(own.questions.every(q=>!('private_rule_json' in q)&&!('explanation' in q))).toBe(true);
 await submit(env,'alice',q.id,expected);
 expect((await outline(env,'alice')).activity).toEqual({attempts:2,correctAttempts:2,solvedQuestions:1});
});

it('editor rechaza alumnos, audita cambios y detecta ediciones concurrentes',async()=>{
 const {adminLessons,saveLesson}=await import('../apps/api/src/admin');
 sqlite.exec(readFileSync('database/migrations/0002_training.sql','utf8'));
 await expect(adminLessons(env,{id:'alice',role:'student'})).rejects.toThrow('No autorizado');
 await expect(saveLesson(env,{id:'alice',role:'student'},'l1',{})).rejects.toThrow('No autorizado');
 const actor={id:'alice',role:'admin'};const before=(await adminLessons(env,actor))[0];
 const input={title:'Título revisado',body:'Explicación revisada',previousTitle:before.title,previousBody:before.body};
 await saveLesson(env,actor,before.id,input);
 expect(sqlite.prepare('SELECT title FROM lessons WHERE id=?').get(before.id).title).toBe(input.title);
 expect(sqlite.prepare('SELECT COUNT(*) n FROM admin_audit_logs').get().n).toBe(1);
 await expect(saveLesson(env,actor,before.id,input)).rejects.toThrow('cambió');
 expect(sqlite.prepare('SELECT COUNT(*) n FROM admin_audit_logs').get().n).toBe(1);
 await expect(saveLesson(env,actor,before.id,{...input,title:' '})).rejects.toThrow('Revisa');
});
it('editor y bitácora se revierten juntos si falla la escritura',async()=>{
 const {adminLessons,saveLesson}=await import('../apps/api/src/admin');
 sqlite.exec(readFileSync('database/migrations/0002_training.sql','utf8'));
 const actor={id:'alice',role:'admin'};const before=(await adminLessons(env,actor))[0];
 sqlite.exec("CREATE TRIGGER fail_audit BEFORE INSERT ON admin_audit_logs BEGIN SELECT RAISE(ABORT,'audit_failure'); END;");
 await expect(saveLesson(env,actor,before.id,{title:'Nuevo',body:'Nuevo texto',previousTitle:before.title,previousBody:before.body})).rejects.toThrow();
 expect(sqlite.prepare('SELECT body FROM lessons WHERE id=?').get(before.id).body).toBe(before.body);
});
