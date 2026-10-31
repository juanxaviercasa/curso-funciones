import {PRODUCT} from '../../../packages/shared/product';
import {evaluateSample} from '../../../packages/math-engine';
import {HttpError,json,sameOrigin,bodyJSON,type Env} from './types';
import {requireUser,requireEntitlement} from './auth';
import {checkout,webhook,reconcile,paymentMethodDiagnostic,productionCheckoutPreview} from './payments';
import {outline,submit} from './training';
export async function handle(request:Request,env:Env):Promise<Response>{
 const url=new URL(request.url);const route=url.pathname;
 if(route==='/api/health'&&request.method==='GET')return json({ok:true,environment:env.APP_ENV,paymentsEnabled:false});
 if(route==='/api/product'&&request.method==='GET')return json({...PRODUCT,purchasable:false,yapeAvailable:false});
 if(route==='/api/webhooks/mercadopago'&&request.method==='POST')return json(await webhook(request,env));
 if(route.startsWith('/api/checkout')&&env.PAYMENTS_ENABLED!=='sandbox')throw new HttpError(503,'Integración de pagos pendiente');
 if(route==='/api/demo/answer'&&request.method==='POST'){sameOrigin(request,env);const body=await bodyJSON(request,512);return json(evaluateSample(body.answer));}
 if(route.startsWith('/api/')){
  if(!['GET','HEAD'].includes(request.method))sameOrigin(request,env);
  const user=await requireUser(request,env);
  if(route==='/api/production-checkout-preview'&&request.method==='POST')return json(await productionCheckoutPreview(env,user.id,request.headers.get('Idempotency-Key')));
  if(route==='/api/payment-method-diagnostic'&&request.method==='GET')return json(await paymentMethodDiagnostic(env,user.id));
  if(route==='/api/me'&&request.method==='GET'){
   const rights=await env.DB.prepare('SELECT sku FROM entitlements WHERE user_id=? AND active=1 GROUP BY sku').bind(user.id).all();
   const orders=await env.DB.prepare('SELECT id,status,amount_minor,currency,created_at FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 20').bind(user.id).all();
   return json({role:user.role,entitlements:rights.results,orders:orders.results,sandboxCheckout:env.APP_ENV!=='production'&&env.PAYMENTS_ENABLED==='sandbox'&&Boolean(env.PAYMENT_TEST_USER_IDS?.split(',').map(x=>x.trim()).includes(user.id))});
  }
  if(route==='/api/checkout/mercadopago'&&request.method==='POST')return json(await checkout(env,user.id,request.headers.get('Idempotency-Key')));
  if(route.startsWith('/api/orders/')&&route.endsWith('/reconcile')&&request.method==='POST'){
   const id=route.split('/')[3];return json(await reconcile(env,user.id,id));
  }
  if(route==='/api/training'&&request.method==='GET'){await requireEntitlement(env,user.id);return json(await outline(env,user.id));}
  if(route==='/api/attempts'&&request.method==='POST'){await requireEntitlement(env,user.id);const body=await bodyJSON(request);return json(await submit(env,user.id,body.questionId,body.answer));}
  if(route==='/api/admin/orders'&&request.method==='GET'){
   if(user.role!=='admin')throw new HttpError(403,'No autorizado');
   return json((await env.DB.prepare('SELECT id,status,sku,amount_minor,currency,created_at FROM orders ORDER BY created_at DESC LIMIT 100').all()).results);
  }
  throw new HttpError(404,'Ruta no encontrada');
 }
 return env.ASSETS.fetch(request);
}
export default {async fetch(request:Request,env:Env){
 let response:Response;try{response=await handle(request,env);}catch(error){response=error instanceof HttpError?json({error:error.message},error.status):json({error:'No se pudo completar la solicitud'},500);}
 const headers=new Headers(response.headers);headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','strict-origin-when-cross-origin');headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self' https://*.clerk.accounts.dev https://*.clerk.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://img.clerk.com; connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com; frame-src https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
 if(env.APP_ENV==='production')headers.set('Strict-Transport-Security','max-age=31536000');
 return new Response(response.body,{status:response.status,headers});
}};
