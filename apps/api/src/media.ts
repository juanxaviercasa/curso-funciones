import {HttpError,json,type Env} from './types';
import {requireAdmin} from './admin';
import {requireEntitlement} from './auth';
type Actor={id:string;role:string};
type Asset={id:string;lesson_id:string;kind:'video'|'material';object_key:string;filename:string;size_bytes:number};
export function storage(env:Env){if(env.MEDIA_ENABLED!=='true'||!env.PRIVATE_MEDIA||!env.MEDIA_SIGNING_KEY||env.MEDIA_SIGNING_KEY.length<32)throw new HttpError(503,'Medios privados pendientes de activar');return env.PRIVATE_MEDIA;}
export async function lesson(env:Env,id:string){const row=await env.DB.prepare("SELECT l.id,l.video_key FROM lessons l JOIN modules m ON m.id=l.module_id WHERE l.id=? AND m.sku='MSV-FUN-001'").bind(id).first<{id:string;video_key:string|null}>();if(!row)throw new HttpError(404,'Lección no encontrada');return row;}
async function access(env:Env,actor:Actor){if(actor.role!=='admin')await requireEntitlement(env,actor.id);}
export async function listAssets(env:Env,actor:Actor,id:string){await access(env,actor);if(env.MEDIA_ENABLED!=='true')return {enabled:false,assets:[]};storage(env);const l=await lesson(env,id);const rows=await env.DB.prepare("SELECT id,kind,filename,size_bytes FROM lesson_assets WHERE lesson_id=? AND (kind='material' OR object_key=?) ORDER BY created_at,id").bind(id,l.video_key).all();return {enabled:true,assets:rows.results};}
export async function uploadAsset(request:Request,env:Env,actor:Actor,id:string){
 requireAdmin(actor);const bucket=storage(env),l=await lesson(env,id),url=new URL(request.url),kind=url.searchParams.get('kind'),name=url.searchParams.get('name')||'';
 if(!['video','material'].includes(kind||'')||!name||name.length>160||/[\x00-\x1f\/\\]/.test(name)||!(kind==='video'?/\.mp4$/i:/\.pdf$/i).test(name))throw new HttpError(400,'Selecciona un MP4 o un PDF con nombre válido');
 const max=kind==='video'?100000000:10*1024*1024;
 const length=Number(request.headers.get('Content-Length'));if(length>max)throw new HttpError(413,'Archivo demasiado grande');if(!Number.isSafeInteger(length)||length<12)throw new HttpError(411,'Se requiere el tamaño del archivo');
 if(kind==='material'){const count=await env.DB.prepare("SELECT COUNT(*) n FROM lesson_assets WHERE lesson_id=? AND kind='material'").bind(id).first<{n:number}>();if((count?.n||0)>=20)throw new HttpError(400,'Máximo 20 materiales por lección');}
 const reader=request.body?.getReader();if(!reader)throw new HttpError(400,'Falta el archivo');
 // Inspect only the header. Stream the remainder to R2 without buffering the video.
 const prefix:Uint8Array[]=[];let prefixSize=0;
 while(prefixSize<12){const r=await reader.read();if(r.done)throw new HttpError(400,'Archivo vacío o incompleto');prefix.push(r.value);prefixSize+=r.value.length;if(prefixSize>max){await reader.cancel();throw new HttpError(413,'Archivo demasiado grande');}}
 const header=new Uint8Array(12);let copied=0;for(const c of prefix){const take=Math.min(12-copied,c.length);header.set(c.subarray(0,take),copied);copied+=take;if(copied===12)break;}
 if(new TextDecoder().decode(header.slice(kind==='video'?4:0,kind==='video'?8:5))!==(kind==='video'?'ftyp':'%PDF-')){await reader.cancel();throw new HttpError(400,'El contenido no corresponde al formato indicado');}
 let size=prefixSize;let index=0;
 const stream=new ReadableStream<Uint8Array>({async pull(controller){try{if(index<prefix.length){controller.enqueue(prefix[index++]);return;}const r=await reader.read();if(r.done){controller.close();return;}size+=r.value.length;if(size>max){await reader.cancel();controller.error(new HttpError(413,'Archivo demasiado grande'));return;}controller.enqueue(r.value);}catch(e){controller.error(e);}},cancel:reason=>reader.cancel(reason)});
 const assetId=crypto.randomUUID(),key=`lessons/${id}/${assetId}`,audit=crypto.randomUUID(),created=new Date().toISOString();
 const fixed=new FixedLengthStream(length);await Promise.all([stream.pipeTo(fixed.writable),bucket.put(key,fixed.readable,{httpMetadata:{contentType:kind==='video'?'video/mp4':'application/pdf'}})]);
 try{
  await env.DB.batch([
   env.DB.prepare("INSERT INTO admin_audit_logs(id,actor_id,action,resource_id,context_json) SELECT ?,?,'lesson.asset.upload',?,? WHERE EXISTS(SELECT 1 FROM lessons WHERE id=? AND video_key IS ?) AND (?='video' OR (SELECT COUNT(*) FROM lesson_assets WHERE lesson_id=? AND kind='material')<20)").bind(audit,actor.id,id,JSON.stringify({assetId,kind,filename:name}),id,l.video_key,kind,id),
   env.DB.prepare('INSERT INTO lesson_assets(id,lesson_id,kind,object_key,filename,size_bytes,created_by,created_at) SELECT ?,?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM admin_audit_logs WHERE id=?)').bind(assetId,id,kind,key,name,size,actor.id,created,audit),
   env.DB.prepare("UPDATE lessons SET video_key=? WHERE id=? AND ?='video' AND EXISTS(SELECT 1 FROM admin_audit_logs WHERE id=?)").bind(key,id,kind,audit)
  ]);
 }catch(e){await bucket.delete(key);throw e;}
 if(!await env.DB.prepare('SELECT id FROM admin_audit_logs WHERE id=?').bind(audit).first()){await bucket.delete(key);throw new HttpError(409,'La lección cambió durante la carga. Vuelve a intentarlo');}
 return {id:assetId};
}
function encode(bytes:Uint8Array){return btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
function decode(text:string){if(!/^[\w-]+$/.test(text))throw Error();return Uint8Array.from(atob(text.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));}
export async function signingKey(env:Env){storage(env);return crypto.subtle.importKey('raw',new TextEncoder().encode(env.MEDIA_SIGNING_KEY!),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function asset(env:Env,id:string){const row=await env.DB.prepare("SELECT a.* FROM lesson_assets a JOIN lessons l ON l.id=a.lesson_id JOIN modules m ON m.id=l.module_id WHERE a.id=? AND m.sku='MSV-FUN-001' AND (a.kind='material' OR a.object_key=l.video_key)").bind(id).first<Asset>();if(!row)throw new HttpError(404,'Archivo no encontrado');return row;}
export async function assetTicket(env:Env,actor:Actor,id:string){storage(env);await access(env,actor);await asset(env,id);const payload=encode(new TextEncoder().encode(JSON.stringify({id,user:actor.id,exp:Math.floor(Date.now()/1000)+300})));const signature=encode(new Uint8Array(await crypto.subtle.sign('HMAC',await signingKey(env),new TextEncoder().encode(payload))));return {url:`/api/media/${id}?ticket=${payload}.${signature}`,expiresIn:300};}
export async function serveAsset(request:Request,env:Env,id:string){
 const bucket=storage(env),token=new URL(request.url).searchParams.get('ticket')||'';let claims:{id:string;user:string;exp:number};
 try{if(token.length>2000)throw Error();const [payload,signature,...rest]=token.split('.');if(rest.length||!await crypto.subtle.verify('HMAC',await signingKey(env),decode(signature),new TextEncoder().encode(payload)))throw Error();claims=JSON.parse(new TextDecoder().decode(decode(payload)));const now=Math.floor(Date.now()/1000);if(claims.id!==id||typeof claims.user!=='string'||!Number.isSafeInteger(claims.exp)||claims.exp<=now||claims.exp>now+300)throw Error();}catch{throw new HttpError(401,'Acceso al archivo caducado o inválido');}
 const actor=await env.DB.prepare('SELECT id,role FROM users WHERE id=?').bind(claims.user).first<Actor>();if(!actor)throw new HttpError(403,'Acceso revocado');await access(env,actor);const row=await asset(env,id),meta=await bucket.head(row.object_key);if(!meta)throw new HttpError(404,'Archivo no disponible');
 const headers=new Headers({'Content-Type':row.kind==='video'?'video/mp4':'application/pdf','Cache-Control':'private, no-store','Accept-Ranges':'bytes','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; sandbox",'Content-Disposition':`${row.kind==='video'?'inline':'attachment'}; filename*=UTF-8''${encodeURIComponent(row.filename)}`});
 let offset=0,end=meta.size-1,status=200;const range=request.headers.get('Range');
 if(range&&request.method!=='HEAD'){const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${meta.size}`,'Cache-Control':'no-store'}});if(!match[1])offset=Math.max(0,meta.size-Number(match[2]));else{offset=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}if(offset>end||!Number.isSafeInteger(offset)||!Number.isSafeInteger(end))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${meta.size}`,'Cache-Control':'no-store'}});status=206;headers.set('Content-Range',`bytes ${offset}-${end}/${meta.size}`);}
 headers.set('Content-Length',String(end-offset+1));if(request.method==='HEAD')return new Response(null,{headers});const object=await bucket.get(row.object_key,{range:{offset,length:end-offset+1}});if(!object)throw new HttpError(404,'Archivo no disponible');return new Response(object.body,{status,headers});
}
