export interface Env {
 ASSETS:Fetcher; DB:D1Database; APP_ENV:string; PAYMENTS_ENABLED:string;
 PAYMENT_TEST_USER_IDS?:string; APP_ORIGIN?:string; CLERK_SECRET_KEY?:string; CLERK_PUBLISHABLE_KEY?:string;
 MERCADOPAGO_PRODUCTION_ACCESS_TOKEN?:string; MERCADOPAGO_APPLICATION_ID?:string; MERCADOPAGO_ACCESS_TOKEN?:string; MERCADOPAGO_WEBHOOK_SECRET?:string; MERCADOPAGO_COLLECTOR_ID?:string;
}
export class HttpError extends Error {constructor(public status:number,message:string){super(message);}}
export const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function bodyJSON(request:Request,limit=2048):Promise<Record<string,unknown>>{
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))throw new HttpError(415,'Se requiere JSON');
 const reader=request.body?.getReader(); if(!reader)throw new HttpError(400,'Falta el cuerpo');
 let size=0;const chunks:Uint8Array[]=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw new HttpError(413,'Solicitud demasiado grande');}chunks.push(value);}
 const bytes=new Uint8Array(size);let pos=0;for(const c of chunks){bytes.set(c,pos);pos+=c.length;}
 try{const result=JSON.parse(new TextDecoder().decode(bytes));if(!result || typeof result!=='object'||Array.isArray(result))throw Error();return result;}catch{throw new HttpError(400,'JSON inválido');}
}
export function sameOrigin(request:Request,env:Env){if(request.headers.get('Origin')!==(env.APP_ORIGIN||new URL(request.url).origin))throw new HttpError(403,'Origen no permitido');}
