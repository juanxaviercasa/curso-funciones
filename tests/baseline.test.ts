import {describe,it,expect} from 'vitest';
import {exactNumber,evaluateSample} from '../packages/math-engine';
import worker from '../apps/api/src';
const handle=worker.fetch;
const env={APP_ENV:'development',PAYMENTS_ENABLED:'false'} as Parameters<typeof handle>[1];
describe('muestra matemática',()=>{
 it('evalúa y explica la sustitución',()=>expect(evaluateSample('11').correct).toBe(true));
 it.each(['11+0','Infinity','NaN','1e1','0x0b','',null,11,'<script>'])('rechaza expresión o formato inseguro %s',value=>expect(exactNumber(value,11)).toBe(false));
 it('acepta decimal con coma',()=>expect(exactNumber('1,5',1.5)).toBe(true));
});
describe('límites de acceso',()=>{
 it('mantiene precio fijo y compra desactivada',async()=>{const r=await handle(new Request('https://msv.test/api/product?price=1'),env);expect(await r.json()).toMatchObject({priceMinor:6700,purchasable:false});});
 it.each(['/api/checkout/mercadopago','/api/webhooks/mercadopago'])('no activa pagos sin configurar %s',async p=>expect((await handle(new Request('https://msv.test'+p,{method:'POST'}),env)).status).toBe(503));
 it('no concede acceso con retorno falso',async()=>expect((await handle(new Request('https://msv.test/api/entitlements?status=approved'),env)).status).toBe(401));
 it('rechaza respuestas de otro origen',async()=>expect((await handle(new Request('https://msv.test/api/demo/answer',{method:'POST',headers:{Origin:'https://evil.test'}}),env)).status).toBe(403));
 it('corrige una muestra desde el servidor',async()=>{const r=await handle(new Request('https://msv.test/api/demo/answer',{method:'POST',headers:{Origin:'https://msv.test','Content-Type':'application/json'},body:JSON.stringify({answer:'11'})}),env);expect(await r.json()).toMatchObject({correct:true});});
});
