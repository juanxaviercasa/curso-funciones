import {PRODUCT} from '../../../packages/shared/product';
import {HttpError,bodyJSON,type Env} from './types';
export interface Order {id:string;user_id:string;sku:string;amount_minor:number;currency:string;external_reference:string;provider:string;provider_order_id?:string|null;checkout_key?:string;payment_environment?:'sandbox'|'production';}
export interface Payment {id:number|string;status:string;transaction_amount:number;currency_id:string;collector_id:number|string;external_reference:string;live_mode:boolean;date_last_updated:string;transaction_amount_refunded?:number;additional_info?:{items?:{id?:string;quantity?:number|string}[]};}
export function testPaymentConfig(env:Env){
 // El checkout sandbox conserva sus credenciales y controles independientes.
 if(env.APP_ENV==='production'||env.PAYMENTS_ENABLED!=='sandbox'||!env.MERCADOPAGO_ACCESS_TOKEN||!env.MERCADOPAGO_WEBHOOK_SECRET||!env.MERCADOPAGO_COLLECTOR_ID||!env.MERCADOPAGO_APPLICATION_ID||!env.APP_ORIGIN?.startsWith('https://'))throw new HttpError(503,'Pagos de prueba pendientes de configuración');
}
export function validOrderId(value:unknown,live=false){
 return typeof value==='string'&&(live?/^ORD(?!TST)[A-Z0-9]{10,64}$/:/^ORDTST[A-Z0-9]{10,64}$/).test(value);
}
export function productionPaymentConfig(env:Env){
 if(env.PRODUCTION_WEBHOOKS_ENABLED!=='true'||!env.MERCADOPAGO_PRODUCTION_ACCESS_TOKEN||!env.MERCADOPAGO_PRODUCTION_WEBHOOK_SECRET||!env.APP_ORIGIN?.startsWith('https://'))throw new HttpError(503,'Confirmación de pagos reales pendiente de configuración');
 return {...env,MERCADOPAGO_ACCESS_TOKEN:env.MERCADOPAGO_PRODUCTION_ACCESS_TOKEN,MERCADOPAGO_WEBHOOK_SECRET:env.MERCADOPAGO_PRODUCTION_WEBHOOK_SECRET,MERCADOPAGO_COLLECTOR_ID:'291342046',MERCADOPAGO_APPLICATION_ID:'2136866391679868'};
}
export function validatePayment(payment:Payment,order:Order,collector:string){
 if(order.provider!=='mercadopago'||order.sku!==PRODUCT.sku||order.amount_minor!==6700||order.currency!=='PEN')throw new HttpError(422,'Orden incompatible');
 if(!validOrderId(String(payment.id),order.payment_environment==='production')||payment.live_mode!==(order.payment_environment==='production')||String(payment.collector_id)!==collector||payment.external_reference!==order.external_reference||payment.currency_id!=='PEN'||payment.transaction_amount!==67)throw new HttpError(422,'Pago no corresponde a la orden');
 const items=payment.additional_info?.items;
 if(items && (items.length!==1||items[0].id!==PRODUCT.sku||Number(items[0].quantity)!==1))throw new HttpError(422,'Producto incorrecto');
 const timestamp=Date.parse(payment.date_last_updated);if(!Number.isFinite(timestamp))throw new HttpError(422,'Fecha inválida');
 const status=['refunded','charged_back','cancelled'].includes(payment.status)||Number(payment.transaction_amount_refunded)>0?'revoked':payment.status==='approved'?'approved':'pending';
 return {status,updated:new Date(timestamp).toISOString()};
}
export async function verifySignature(request:Request,secret:string,now=Date.now(),live=false){
 const url=new URL(request.url);const id=url.searchParams.get('data.id');const rid=request.headers.get('x-request-id');const sig=request.headers.get('x-signature')||'';
 const parts=sig.split(',').map(p=>p.trim().split('='));
 const ts=parts.filter(p=>p[0]==='ts'),v1=parts.filter(p=>p[0]==='v1');
 const match=ts.length===1&&v1.length===1&&/^\d{10}(?:\d{3})?$/.test(ts[0][1])&&/^[a-fA-F0-9]{64}$/.test(v1[0][1])?['',ts[0][1],v1[0][1]]:null;
 if(!id||!validOrderId(id.toUpperCase(),live)||!rid||!/^[-a-zA-Z0-9]{1,128}$/.test(rid)||!match){console.warn('mp_signature_rejected',{reason:'format'});throw new HttpError(401,'Firma inválida');}
 const milliseconds=Number(match[1])*(match[1].length===10?1000:1);
 if(Math.abs(now-milliseconds)>300000){console.warn('mp_signature_rejected',{reason:'expired'});throw new HttpError(401,'Notificación expirada');}
 const encoder=new TextEncoder();const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 const bytes=new Uint8Array(match[2].match(/../g)!.map(v=>parseInt(v,16)));
 const valid=await crypto.subtle.verify('HMAC',key,bytes,encoder.encode('id:'+id+';request-id:'+rid+';ts:'+match[1]+';'));
 if(!valid){console.warn('mp_signature_rejected',{reason:'hmac'});throw new HttpError(401,'Firma inválida');}return {id,requestId:rid};
}
export async function mpFetch(env:Env,pathname:string,options:RequestInit={}){
 const headers=new Headers(options.headers);headers.set('Authorization','Bearer '+env.MERCADOPAGO_ACCESS_TOKEN);headers.set('Content-Type','application/json');
 let response:Response;
 try{response=await fetch('https://api.mercadopago.com'+pathname,{...options,headers,signal:AbortSignal.timeout(10000)});}catch{throw new HttpError(502,'No se pudo consultar Mercado Pago; reintenta con la misma solicitud');}
 if(!response.ok){
  // Solo códigos técnicos: nunca cuerpos, cabeceras ni credenciales del proveedor.
  let code='unknown';
  try{const error=await response.json() as {error?:unknown;errors?:{code?:unknown}[];cause?:{code?:unknown}[]};const value=error.error??error.errors?.[0]?.code??error.cause?.[0]?.code;if(typeof value==='string'&&/^[a-zA-Z0-9_.-]{1,80}$/.test(value))code=value;}catch{/* Respuesta no JSON. */}
  console.warn('mercadopago_request_rejected',{status:response.status,code});
  throw new HttpError(502,'Mercado Pago rechazó la solicitud (HTTP '+response.status+', código '+code+')');
 }
 try{return await response.json() as Record<string,unknown>;}catch{throw new HttpError(502,'Mercado Pago devolvió una respuesta no válida');}
}
export function orderBody(order:Order,origin:string){
 const result=origin+'/pago/resultado';
 return {type:'online',processing_mode:'manual',total_amount:'67.00',external_reference:order.external_reference,
 items:[{external_code:PRODUCT.sku,title:PRODUCT.name,quantity:1,unit_price:'67.00'}],
 config:{online:{success_url:result,failure_url:result,pending_url:result,auto_return:'approved'}}};
}
export function checkoutURL(value:unknown,id:string,live=false){
 if(typeof value!=='string')throw new HttpError(502,'Checkout no disponible');
 const url=new URL(value);
 if(!validOrderId(id,live)||url.protocol!=='https:'||url.hostname!=='www.mercadopago.com.pe'||url.port||url.username||url.password||url.pathname!=='/checkout/v1/redirect'||url.searchParams.get('order_id')!==id)throw new HttpError(502,'Checkout no válido');
 return url.href;
}
export async function allowedProductionBuyer(env:Env,userId:string){
 const user=await env.DB.prepare('SELECT email FROM users WHERE id=?').bind(userId).first<{email:string}>();
 return Boolean(user&&env.PRODUCTION_PAYMENT_EMAILS?.split(',').map(x=>x.trim().toLowerCase()).includes(user.email.toLowerCase()));
}
export async function checkout(env:Env,userId:string,key:unknown,live=false){
 if(live){
  env=productionPaymentConfig(env);
  if(env.PRODUCTION_CHECKOUT_ENABLED!=='restricted')throw new HttpError(503,'Compra real aún desactivada');
 }else testPaymentConfig(env);
 const allowed=live?env.PRODUCTION_PAYMENT_USER_IDS:env.PAYMENT_TEST_USER_IDS;
 if(!(allowed?.split(',').map(x=>x.trim()).includes(userId)||(live&&await allowedProductionBuyer(env,userId))))throw new HttpError(403,'Compra de prueba reservada a usuarios autorizados');
 if(typeof key!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key))throw new HttpError(400,'Se requiere Idempotency-Key UUID');
 const product=await env.DB.prepare('SELECT price_minor,currency,active FROM products WHERE sku=?').bind(PRODUCT.sku).first<{price_minor:number;currency:string;active:number}>();
 if(!product?.active||product.price_minor!==6700||product.currency!=='PEN')throw new HttpError(503,'Producto no disponible');
 await env.DB.prepare('INSERT INTO orders(id,user_id,sku,amount_minor,currency,provider,external_reference,checkout_key,payment_environment) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id,checkout_key) DO NOTHING').bind(crypto.randomUUID(),userId,PRODUCT.sku,6700,'PEN','mercadopago',crypto.randomUUID(),key,live?'production':'sandbox').run();
 const order=await env.DB.prepare('SELECT * FROM orders WHERE user_id=? AND checkout_key=?').bind(userId,key).first<Order>();
 if(!order)throw new HttpError(500,'No se pudo recuperar la orden');
 if((order.payment_environment||'sandbox')!==(live?'production':'sandbox'))throw new HttpError(409,'La solicitud pertenece a otro entorno de pagos');
 // El UUID interno se reutiliza como idempotencia del proveedor incluso después de un timeout.
 const buyer=await env.DB.prepare('SELECT email FROM users WHERE id=?').bind(userId).first<{email:string}>();
 if(!buyer?.email)throw new HttpError(422,'Correo verificado del estudiante no disponible');
 const body={...orderBody(order,env.APP_ORIGIN!),payer:{email:buyer.email}};
 const resource=await mpFetch(env,'/v1/orders',{method:'POST',headers:{'X-Idempotency-Key':order.id},body:JSON.stringify(body)});
 const id=String(resource.id||'');const target=checkoutURL(resource.checkout_url,id,live);
 normalizeOrder(resource as unknown as ProviderOrder,order,env);
 await env.DB.prepare('UPDATE orders SET provider_order_id=? WHERE id=? AND (provider_order_id IS NULL OR provider_order_id=?)').bind(id,order.id,id).run();
 return {orderId:order.id,checkoutUrl:target};
}
export interface ProviderOrder {
 id:string;type:string;processing_mode:string;status:string;status_detail:string;external_reference:string;
 total_amount:string;total_paid_amount:string;currency:string;country_code:string;user_id:string;last_updated_date:string;
 integration_data:{application_id:string};items:{external_code:string;quantity:number;unit_price:string}[];
 transactions?:{payments?:{status:string;status_detail:string;amount:string;paid_amount:string}[];refunds?:{status:string;amount:string}[];chargebacks?:unknown[]};
}
function isCourseAmount(value:unknown){return typeof value==='string' && /^67(?:\.0{1,2})?$/.test(value);}
export function normalizeOrder(r:ProviderOrder,order:Order,env:Env):Payment{
 if(!validOrderId(r.id,order.payment_environment==='production')||r.type!=='online'||r.processing_mode!=='manual'||r.currency!=='PEN'||r.country_code!=='PER'||String(r.user_id)!==env.MERCADOPAGO_COLLECTOR_ID||String(r.integration_data?.application_id)!==env.MERCADOPAGO_APPLICATION_ID||r.external_reference!==order.external_reference||!isCourseAmount(r.total_amount)||(order.provider_order_id&&order.provider_order_id!==r.id))throw new HttpError(422,'Order no corresponde a esta compra');
 if(!Array.isArray(r.items)||r.items.length!==1||r.items[0].external_code!==PRODUCT.sku||r.items[0].quantity!==1||!isCourseAmount(r.items[0].unit_price))throw new HttpError(422,'Producto incorrecto');
 const tx=r.transactions;const refunded=r.status==='refunded'||r.status_detail==='partially_refunded'||Boolean(tx?.refunds?.some(x=>x.status==='processed'))||Boolean(tx?.chargebacks?.length);
 const accredited=r.status==='processed'&&r.status_detail==='accredited'&&isCourseAmount(r.total_paid_amount)&&tx?.payments?.length===1&&tx.payments[0].status==='processed'&&tx.payments[0].status_detail==='accredited'&&isCourseAmount(tx.payments[0].amount)&&isCourseAmount(tx.payments[0].paid_amount);
 return {id:r.id,status:refunded?'refunded':r.status==='canceled'?'cancelled':accredited?'approved':'pending',transaction_amount:67,currency_id:r.currency,collector_id:r.user_id,external_reference:r.external_reference,live_mode:order.payment_environment==='production',date_last_updated:r.last_updated_date,additional_info:{items:[{id:PRODUCT.sku,quantity:1}]}};
}
export async function reconcile(env:Env,userId:string,localId:string){
 const order=await env.DB.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').bind(localId,userId).first<Order>();
 if(!order)throw new HttpError(404,'Orden no encontrada');
 if(order.payment_environment==='production')env=productionPaymentConfig(env);else testPaymentConfig(env);
 if(!order.provider_order_id)return {status:'pending'};
 const r=await mpFetch(env,'/v1/orders/'+encodeURIComponent(order.provider_order_id)) as unknown as ProviderOrder;
 // Recupera una confirmación ya firmada tras consultar nuevamente el recurso al proveedor.
 const p=normalizeOrder(r,order,env);
 const signedEvent=p.status==='approved'?await env.DB.prepare("SELECT 1 FROM payment_events WHERE provider='mercadopago' AND resource_id=? AND signature_valid=1 AND processed=1 LIMIT 1").bind(r.id).first():null;
 if(signedEvent||p.status==='refunded'||p.status==='cancelled')await applyPayment(env,p,'reconcile:'+r.id+':'+r.last_updated_date);
 return {status:p.status==='approved'&&!signedEvent?'awaiting_notification':p.status};
}
export async function applyPayment(env:Env,payment:Payment,eventKey:string){
 const order=await env.DB.prepare('SELECT * FROM orders WHERE external_reference=?').bind(payment.external_reference).first<Order>();
 if(!order)throw new HttpError(422,'Orden desconocida');
 const collector=order.payment_environment==='production'?productionPaymentConfig(env).MERCADOPAGO_COLLECTOR_ID:env.MERCADOPAGO_COLLECTOR_ID;
 const checked=validatePayment(payment,order,collector!);
 // batch es transaccional en D1. Cada acceso pertenece a una orden, de modo que una devolución no revoca otra compra válida.
 await env.DB.batch([
 env.DB.prepare("INSERT INTO payment_events(provider,event_key,resource_id,signature_valid,processed) VALUES('mercadopago',?,?,1,1) ON CONFLICT(provider,event_key) DO NOTHING").bind(eventKey,String(payment.id)),
 env.DB.prepare("INSERT INTO payments(provider_payment_id,order_id,provider_status,amount_minor,currency,provider_updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(provider_payment_id) DO UPDATE SET provider_status=excluded.provider_status,provider_updated_at=excluded.provider_updated_at,updated_at=CURRENT_TIMESTAMP WHERE payments.order_id=excluded.order_id AND excluded.provider_updated_at>=payments.provider_updated_at AND (payments.provider_status<>'revoked' OR excluded.provider_status='revoked') AND NOT(payments.provider_status='approved' AND excluded.provider_status='pending')").bind(String(payment.id),order.id,checked.status,6700,'PEN',checked.updated),
 env.DB.prepare("UPDATE orders SET status=CASE WHEN EXISTS(SELECT 1 FROM payments WHERE order_id=? AND provider_status='approved') THEN 'approved' WHEN EXISTS(SELECT 1 FROM payments WHERE order_id=? AND provider_status='revoked') THEN 'revoked' ELSE 'pending' END,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(order.id,order.id,order.id),
 env.DB.prepare("INSERT INTO entitlements(user_id,sku,source_order_id,active) SELECT user_id,sku,id,1 FROM orders WHERE id=? AND status='approved' ON CONFLICT(user_id,sku,source_order_id) DO UPDATE SET active=1,updated_at=CURRENT_TIMESTAMP").bind(order.id),
 env.DB.prepare("UPDATE entitlements SET active=0,updated_at=CURRENT_TIMESTAMP WHERE source_order_id=? AND NOT EXISTS(SELECT 1 FROM orders WHERE id=? AND status='approved')").bind(order.id,order.id)
 ]);
}
export async function webhook(request:Request,env:Env,live=false){
 if(live)env=productionPaymentConfig(env);else testPaymentConfig(env);
 const {id,requestId}=await verifySignature(request,env.MERCADOPAGO_WEBHOOK_SECRET!,Date.now(),live);
 if(new URL(request.url).searchParams.get('type')!=='order')throw new HttpError(400,'Tópico no soportado');
 const event=await bodyJSON(request,32768);
 if(event.type!=='order'||event.live_mode!==live||typeof event.data!=='object'||event.data===null||String((event.data as {id?:unknown}).id).toLowerCase()!==id.toLowerCase())throw new HttpError(422,'Evento incompatible con el entorno de pagos');
 const resource=await mpFetch(env,'/v1/orders/'+encodeURIComponent(id)) as unknown as ProviderOrder;
 if(resource.id.toLowerCase()!==id.toLowerCase())throw new HttpError(422,'Recurso incorrecto');
 const order=await env.DB.prepare('SELECT * FROM orders WHERE external_reference=?').bind(resource.external_reference).first<Order>();
 if(!order)throw new HttpError(422,'Orden desconocida');
 if((order.payment_environment||'sandbox')!==(live?'production':'sandbox'))throw new HttpError(422,'Entorno de pago incompatible');
 const payment=normalizeOrder(resource,order,env);
 await applyPayment(env,payment,requestId+':'+resource.id+':'+resource.last_updated_date);return {received:true};
}

// Diagnóstico de catálogo: no crea órdenes ni acredita disponibilidad comercial por sí solo.
export async function paymentMethodDiagnostic(env:Env,userId:string){
 if(!env.PAYMENT_TEST_USER_IDS?.split(',').map(x=>x.trim()).includes(userId))throw new HttpError(403,'No autorizado');
 if(!env.MERCADOPAGO_PRODUCTION_ACCESS_TOKEN)throw new HttpError(503,'Credencial de producción pendiente');
 let response:Response;
 try{response=await fetch('https://api.mercadopago.com/v1/payment_methods',{headers:{Authorization:'Bearer '+env.MERCADOPAGO_PRODUCTION_ACCESS_TOKEN},signal:AbortSignal.timeout(10000)});}catch{throw new HttpError(502,'No se pudo consultar el catálogo de Mercado Pago');}
 if(!response.ok)throw new HttpError(502,'Mercado Pago no autorizó la consulta de medios de pago');
 const methods=await response.json() as {id:string;status:string;payment_type_id:string;min_allowed_amount:number;max_allowed_amount:number}[];
 if(!Array.isArray(methods))throw new HttpError(502,'Catálogo no válido');
 const yape=methods.find(m=>m.id==='yape');
 return {yape:yape?{status:yape.status,type:yape.payment_type_id,min:yape.min_allowed_amount,max:yape.max_allowed_amount}:null,checkoutVerified:false};
}
// Inspección de checkout real: permanece desactivada hasta autorización del propietario.
// El registro de auditoría conserva la idempotencia incluso si el proveedor tarda en responder.
export async function productionCheckoutPreview(env:Env,userId:string,key:unknown){
 if(!env.PAYMENT_TEST_USER_IDS?.split(',').map(x=>x.trim()).includes(userId))throw new HttpError(403,'No autorizado');
 if(env.PRODUCTION_CHECKOUT_PREVIEW!=='enabled'||!env.MERCADOPAGO_PRODUCTION_ACCESS_TOKEN||!env.APP_ORIGIN)throw new HttpError(503,'Verificación de checkout real pendiente de autorización');
 if(typeof key!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key))throw new HttpError(400,'Se requiere Idempotency-Key UUID');
 const previous=await env.DB.prepare("SELECT id FROM admin_audit_logs WHERE actor_id=? AND action='production_checkout_preview' ORDER BY created_at LIMIT 1").bind(userId).first<{id:string}>();
 const auditId=previous?.id||'checkout-preview:'+userId+':'+key;
 await env.DB.prepare("INSERT INTO admin_audit_logs(id,actor_id,action,resource_id,context_json) VALUES(?,?,'production_checkout_preview',?,'{}') ON CONFLICT(id) DO NOTHING").bind(auditId,userId,crypto.randomUUID()).run();
 const audit=await env.DB.prepare('SELECT resource_id FROM admin_audit_logs WHERE id=? AND actor_id=?').bind(auditId,userId).first<{resource_id:string}>();
 if(!audit)throw new HttpError(500,'No se pudo registrar la verificación');
 const body=orderBody({id:audit.resource_id,user_id:userId,sku:PRODUCT.sku,amount_minor:6700,currency:'PEN',external_reference:'preview_'+audit.resource_id,provider:'mercadopago'},env.APP_ORIGIN);
 const r=await mpFetch({...env,MERCADOPAGO_ACCESS_TOKEN:env.MERCADOPAGO_PRODUCTION_ACCESS_TOKEN},'/v1/orders',{method:'POST',headers:{'X-Idempotency-Key':audit.resource_id+'-validref-v1'},body:JSON.stringify(body)}) as unknown as ProviderOrder & {checkout_url:string};
 if(!/^ORD[A-Z0-9]{10,64}$/.test(r.id)||r.id.startsWith('ORDTST')||r.type!=='online'||r.processing_mode!=='manual'||r.currency!=='PEN'||r.country_code!=='PER'||r.user_id!=='291342046'||String(r.integration_data?.application_id)!=='2136866391679868'||r.external_reference!==body.external_reference||!isCourseAmount(r.total_amount))throw new HttpError(422,'Checkout real incompatible');
 const url=new URL(r.checkout_url);
 if(url.origin!=='https://www.mercadopago.com.pe'||url.username||url.password||url.pathname!=='/checkout/v1/redirect'||url.searchParams.get('order_id')!==r.id)throw new HttpError(502,'URL de checkout no válida');
 await env.DB.prepare('UPDATE admin_audit_logs SET context_json=? WHERE id=?').bind(JSON.stringify({providerOrderId:r.id,purpose:'inspect_methods_only',amountMinor:6700}),auditId).run();
 return {checkoutUrl:url.href,inspectionOnly:true};
}
