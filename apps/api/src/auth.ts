import {createClerkClient} from '@clerk/backend';
import {HttpError,type Env} from './types';
export async function requireUser(request:Request,env:Env){
 // Solo bearer explícito; no se autentican mutaciones con cookies implícitas.
 if(!env.CLERK_SECRET_KEY||!env.CLERK_PUBLISHABLE_KEY||!env.APP_ORIGIN)throw new HttpError(401,'Acceso pendiente de configurar');
 if(!request.headers.get('Authorization')?.startsWith('Bearer '))throw new HttpError(401,'Inicia sesión');
 const client=createClerkClient({secretKey:env.CLERK_SECRET_KEY,publishableKey:env.CLERK_PUBLISHABLE_KEY});
 const state=await client.authenticateRequest(request,{authorizedParties:[env.APP_ORIGIN],acceptsToken:'session_token'});
 const auth=state.toAuth();if(!state.isAuthenticated || !auth?.userId)throw new HttpError(401,'Sesión inválida o caducada');
 let local=await env.DB.prepare('SELECT id,role FROM users WHERE auth_subject=?').bind(auth.userId).first<{id:string;role:string}>();
 if(!local){
  const profile=await client.users.getUser(auth.userId);const email=profile.emailAddresses.find(e=>e.id===profile.primaryEmailAddressId && e.verification?.status==='verified')?.emailAddress.toLowerCase();
  if(!email)throw new HttpError(403,'Verifica tu correo antes de continuar');
  const id=crypto.randomUUID();await env.DB.prepare('INSERT INTO users(id,auth_subject,email) VALUES(?,?,?) ON CONFLICT(auth_subject) DO NOTHING').bind(id,auth.userId,email).run();
  local=await env.DB.prepare('SELECT id,role FROM users WHERE auth_subject=?').bind(auth.userId).first<{id:string;role:string}>();
 }
 if(!local)throw new HttpError(401,'No se pudo verificar la cuenta');return local;
}
export async function requireEntitlement(env:Env,userId:string){
 const access=await env.DB.prepare("SELECT 1 FROM entitlements WHERE user_id=? AND sku='MSV-FUN-001' AND active=1 LIMIT 1").bind(userId).first();
 if(!access)throw new HttpError(403,'Necesitas una compra verificada');
}
