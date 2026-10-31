import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {beforeEach,it,expect} from 'vitest';
import {applyPayment} from '../apps/api/src/payments';
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
 sqlite.exec("INSERT INTO users(id,auth_subject,email) VALUES('alice','a','alice@example.test'),('bob','b','bob@example.test'); INSERT INTO orders(id,user_id,sku,amount_minor,currency,provider,external_reference) VALUES('o1','alice','MSV-FUN-001',6700,'PEN','mercadopago','r1'),('o2','bob','MSV-FUN-001',6700,'PEN','mercadopago','r2');");
 env={MERCADOPAGO_COLLECTOR_ID:'789',DB:{prepare:sql=>new Statement(sql),batch:async stmts=>{sqlite.exec('BEGIN');try{for(const s of stmts)await s.run();sqlite.exec('COMMIT');}catch(e){sqlite.exec('ROLLBACK');throw e;}}}};
});
const base={id:123,status:'approved',transaction_amount:67,currency_id:'PEN',collector_id:789,external_reference:'r1',live_mode:false,date_last_updated:'2026-10-30T12:00:00Z',additional_info:{items:[{id:'MSV-FUN-001',quantity:1}]}};
const active=()=>Number(sqlite.prepare('SELECT COUNT(*) n FROM entitlements WHERE active=1').get().n);
it('eventos duplicados conceden exactamente un derecho',async()=>{await applyPayment(env,base,'event1');await applyPayment(env,base,'event1');expect(active()).toBe(1);expect(sqlite.prepare('SELECT COUNT(*) n FROM payment_events').get().n).toBe(1);});
it('un pago nunca concede acceso al otro alumno',async()=>{await applyPayment(env,base,'event1');expect(sqlite.prepare("SELECT COUNT(*) n FROM entitlements WHERE user_id='bob'").get().n).toBe(0);});
it('un pendiente no concede acceso',async()=>{await applyPayment(env,{...base,status:'pending'},'event1');expect(active()).toBe(0);});
it('un evento pendiente atrasado no revierte aprobación',async()=>{await applyPayment(env,base,'event1');await applyPayment(env,{...base,status:'pending',date_last_updated:'2026-10-30T11:00:00Z'},'event2');expect(active()).toBe(1);});
it('un pendiente posterior tampoco reemplaza aprobación',async()=>{await applyPayment(env,base,'event1');await applyPayment(env,{...base,status:'pending',date_last_updated:'2026-10-30T13:00:00Z'},'event2');expect(active()).toBe(1);});
it('una devolución revoca y una aprobación vieja no reactiva',async()=>{await applyPayment(env,base,'event1');await applyPayment(env,{...base,status:'refunded',date_last_updated:'2026-10-30T13:00:00Z'},'event2');expect(active()).toBe(0);await applyPayment(env,base,'event3');expect(active()).toBe(0);});
it('un fallo parcial hace rollback de evento, pago y acceso',async()=>{sqlite.exec("CREATE TRIGGER fail_grant BEFORE INSERT ON entitlements BEGIN SELECT RAISE(ABORT,'test_failure'); END;");await expect(applyPayment(env,base,'event1')).rejects.toThrow();expect(sqlite.prepare('SELECT COUNT(*) n FROM payments').get().n).toBe(0);expect(sqlite.prepare('SELECT COUNT(*) n FROM payment_events').get().n).toBe(0);});
it('no reasigna un mismo pago a otra orden',async()=>{await applyPayment(env,base,'event1');await applyPayment(env,{...base,external_reference:'r2'},'event2');expect(sqlite.prepare("SELECT COUNT(*) n FROM entitlements WHERE user_id='bob'").get().n).toBe(0);});
it('una devolución conserva acceso por otra compra aprobada',async()=>{sqlite.exec("INSERT INTO orders(id,user_id,sku,amount_minor,currency,provider,external_reference) VALUES('o3','alice','MSV-FUN-001',6700,'PEN','mercadopago','r3')");await applyPayment(env,base,'event1');await applyPayment(env,{...base,id:456,external_reference:'r3'},'event2');await applyPayment(env,{...base,status:'refunded',date_last_updated:'2026-10-30T13:00:00Z'},'event3');expect(active()).toBe(1);});
