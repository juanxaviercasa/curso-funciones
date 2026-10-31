import {PRODUCT} from '../../../packages/shared/product';
import {HttpError,type Env} from './types';
export interface Order {id:string;user_id:string;sku:string;amount_minor:number;currency:string;external_reference:string;provider:string;}
export interface Payment {id:number|string;status:string;transaction_amount:number;currency_id:string;collector_id:number|string;external_reference:string;live_mode:boolean;date_last_updated:string;transaction_amount_refunded?:number;additional_info?:{items?:{id?:string;quantity?:number|string}[]};}
export function testPaymentConfig(env:Env){
 // La primera versión solo permite sandbox. Producción requiere una revisión explícita del código y GO del propietario.
 if(env.APP_ENV==='production'||env.PAYMENTS_ENABLED!=='sandbox'||!env.MERCADOPAGO_ACCESS_TOKEN||!env.MERCADOPAGO_WEBHOOK_SECRET||!env.MERCADOPAGO_COLLECTOR_ID||!env.APP_ORIGIN?.startsWith('https://'))throw new HttpError(503,'Pagos de prueba pendientes de configuración');
}
export function validatePayment(payment:Payment,order:Order,collector:string){
 if(order.provider!=='mercadopago'||order.sku!==PRODUCT.sku||order.amount_minor!==6700||order.currency!=='PEN')throw new HttpError(422,'Orden incompatible');
 if(!/^[0-9]+$/.test(String(payment.id))||payment.live_mode!==false||String(payment.collector_id)!==collector||payment.external_reference!==order.external_reference||payment.currency_id!=='PEN'||payment.transaction_amount!==67)throw new HttpError(422,'Pago no corresponde a la orden');
 const items=payment.additional_info?.items;
 if(items && (items.length!==1||items[0].id!==PRODUCT.sku||Number(items[0].quantity)!==1))throw new HttpError(422,'Producto incorrecto');
 const timestamp=Date.parse(payment.date_last_updated);if(!Number.isFinite(timestamp))throw new HttpError(422,'Fecha inválida');
 const status=['refunded','charged_back','cancelled'].includes(payment.status)||Number(payment.transaction_amount_refunded)>0?'revoked':payment.status==='approved'?'approved':'pending';
 return {status,updated:new Date(timestamp).toISOString()};
}
export async function verifySignature(request:Request,secret:string,now=Date.now()){
 const url=new URL(request.url);const id=url.searchParams.get('data.id');const rid=request.headers.get('x-request-id');const sig=request.headers.get('x-signature')||'';
 const match=/^ts=(\d{10}|\d{13}),v1=([a-fA-F0-9]{64})$/.exec(sig);
 if(!id||!/^\d+$/.test(id)||!rid||!/^[-a-zA-Z0-9]{1,128}$/.test(rid)||!match)throw new HttpError(401,'Firma inválida');
 const milliseconds=Number(match[1])*(match[1].length===10?1000:1);
 if(Math.abs(now-milliseconds)>300000)throw new HttpError(401,'Notificación expirada');
 const encoder=new TextEncoder();const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 const bytes=new Uint8Array(match[2].match(/../g)!.map(v=>parseInt(v,16)));
 const valid=await crypto.subtle.verify('HMAC',key,bytes,encoder.encode('id:'+id.toLowerCase()+';request-id:'+rid+';ts:'+match[1]+';'));
 if(!valid)throw new HttpError(401,'Firma inválida');return {id,requestId:rid};
}
export async function mpFetch(env:Env,pathname:string,options:RequestInit={}){
 const response=await fetch('https://api.mercadopago.com'+pathname,{...options,headers:{Authorization:'Bearer '+env.MERCADOPAGO_ACCESS_TOKEN,'Content-Type':'application/json'},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new HttpError(502,'Mercado Pago no respondió correctamente');return response.json() as Promise<Record<string,unknown>>;
}
export function preferenceBody(order:Order,origin:string){return {items:[{id:PRODUCT.sku,title:PRODUCT.name,quantity:1,currency_id:'PEN',unit_price:order.amount_minor/100}],external_reference:order.external_reference,back_urls:{success:origin+'/pago/resultado',failure:origin+'/pago/resultado',pending:origin+'/pago/resultado'},notification_url:origin+'/api/webhooks/mercadopago',auto_return:'approved'};}
export async function checkout(env:Env,userId:string){
 testPaymentConfig(env);
 const product=await env.DB.prepare('SELECT price_minor,currency,active FROM products WHERE sku=?').bind(PRODUCT.sku).first<{price_minor:number;currency:string;active:number}>();
 if(!product?.active||product.price_minor!==6700||product.currency!=='PEN')throw new HttpError(503,'Producto no disponible');
 const order:Order={id:crypto.randomUUID(),user_id:userId,sku:PRODUCT.sku,amount_minor:product.price_minor,currency:product.currency,external_reference:crypto.randomUUID(),provider:'mercadopago'};
 await env.DB.prepare('INSERT INTO orders(id,user_id,sku,amount_minor,currency,provider,external_reference) VALUES(?,?,?,?,?,?,?)').bind(order.id,userId,order.sku,order.amount_minor,order.currency,order.provider,order.external_reference).run();
 // Una preferencia por orden; no se reintenta su creación automáticamente ante timeout.
 const preference=await mpFetch(env,'/checkout/preferences',{method:'POST',body:JSON.stringify(preferenceBody(order,env.APP_ORIGIN!))});
 const target=typeof preference.sandbox_init_point==='string'?new URL(preference.sandbox_init_point):null;
 if(!target||target.protocol!=='https:'||!['sandbox.mercadopago.com.pe','www.mercadopago.com.pe'].includes(target.hostname))throw new HttpError(502,'Checkout de prueba no disponible');
 return {orderId:order.id,checkoutUrl:target.href};
}
export async function applyPayment(env:Env,payment:Payment,eventKey:string){
 const order=await env.DB.prepare('SELECT * FROM orders WHERE external_reference=?').bind(payment.external_reference).first<Order>();
 if(!order)throw new HttpError(422,'Orden desconocida');
 const checked=validatePayment(payment,order,env.MERCADOPAGO_COLLECTOR_ID!);
 // batch es transaccional en D1. Cada acceso pertenece a una orden, de modo que una devolución no revoca otra compra válida.
 await env.DB.batch([
 env.DB.prepare("INSERT INTO payment_events(provider,event_key,resource_id,signature_valid,processed) VALUES('mercadopago',?,?,1,1) ON CONFLICT(provider,event_key) DO NOTHING").bind(eventKey,String(payment.id)),
 env.DB.prepare("INSERT INTO payments(provider_payment_id,order_id,provider_status,amount_minor,currency,provider_updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(provider_payment_id) DO UPDATE SET provider_status=excluded.provider_status,provider_updated_at=excluded.provider_updated_at,updated_at=CURRENT_TIMESTAMP WHERE payments.order_id=excluded.order_id AND excluded.provider_updated_at>=payments.provider_updated_at AND (payments.provider_status<>'revoked' OR excluded.provider_status='revoked') AND NOT(payments.provider_status='approved' AND excluded.provider_status='pending')").bind(String(payment.id),order.id,checked.status,6700,'PEN',checked.updated),
 env.DB.prepare("UPDATE orders SET status=CASE WHEN EXISTS(SELECT 1 FROM payments WHERE order_id=? AND provider_status='approved') THEN 'approved' WHEN EXISTS(SELECT 1 FROM payments WHERE order_id=? AND provider_status='revoked') THEN 'revoked' ELSE 'pending' END,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(order.id,order.id,order.id),
 env.DB.prepare("INSERT INTO entitlements(user_id,sku,source_order_id,active) SELECT user_id,sku,id,1 FROM orders WHERE id=? AND status='approved' ON CONFLICT(user_id,sku,source_order_id) DO UPDATE SET active=1,updated_at=CURRENT_TIMESTAMP").bind(order.id),
 env.DB.prepare("UPDATE entitlements SET active=0,updated_at=CURRENT_TIMESTAMP WHERE source_order_id=? AND NOT EXISTS(SELECT 1 FROM orders WHERE id=? AND status='approved')").bind(order.id,order.id)
 ]);
}
export async function webhook(request:Request,env:Env){
 testPaymentConfig(env);const {id,requestId}=await verifySignature(request,env.MERCADOPAGO_WEBHOOK_SECRET!);
 if(new URL(request.url).searchParams.get('type')!=='payment')throw new HttpError(400,'Tópico no soportado');
 const payment=await mpFetch(env,'/v1/payments/'+encodeURIComponent(id)) as unknown as Payment;
 if(String(payment.id)!==id)throw new HttpError(422,'Recurso incorrecto');
 await applyPayment(env,payment,requestId+':'+id+':'+payment.date_last_updated);return {received:true};
}
