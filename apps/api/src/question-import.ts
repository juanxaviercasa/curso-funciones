import {HttpError,type Env} from './types';
import {requireAdmin} from './admin';
import {validateDraft} from './question-drafts';
type Actor={id:string;role:string};
type Row={index:number;externalId:string;status:'ready'|'duplicate'|'invalid';warnings:string[];error?:string;payload?:ReturnType<typeof validateDraft>};
function object(v:unknown):v is Record<string,unknown>{return Boolean(v)&&typeof v==='object'&&!Array.isArray(v);}
export async function previewImport(env:Env,actor:Actor,input:Record<string,unknown>){
 requireAdmin(actor);
 if(typeof input.namespace!=='string'||!/^[-a-zA-Z0-9_.]{1,80}$/.test(input.namespace)||!Array.isArray(input.items)||input.items.length<1||input.items.length>20)throw new HttpError(400,'Indica una fuente y entre 1 y 20 preguntas');
 const namespace=input.namespace,seen=new Set<string>(),rows:Row[]=[];
 for(const [index,item] of input.items.entries()){
  const row:Row={index,externalId:'',status:'invalid',warnings:[]};rows.push(row);
  try{
   if(!object(item)||typeof item.externalId!=='string'||!/^[-a-zA-Z0-9_.]{1,100}$/.test(item.externalId))throw new HttpError(400,'ID externo inválido');
   row.externalId=item.externalId;
   if(seen.has(item.externalId)){row.status='duplicate';continue;}seen.add(item.externalId);
   row.payload=validateDraft(item);
   if(!await env.DB.prepare('SELECT id FROM lessons WHERE id=?').bind(row.payload.lessonId).first())throw new HttpError(400,'Lección no encontrada');
   if(await env.DB.prepare('SELECT draft_id FROM question_import_keys WHERE source_namespace=? AND external_id=?').bind(namespace,item.externalId).first()){row.status='duplicate';continue;}
   if(row.payload.expected===null)row.warnings.push('Sin clave: requiere revisión');
   if(!(row.payload.explanation as string).trim())row.warnings.push('Sin explicación');
   if(row.payload.rights==='pending')row.warnings.push('Permisos pendientes');
   if(!(row.payload.source as string).trim())row.warnings.push('Referencia pendiente');
   row.status='ready';
  }catch(e){row.error=e instanceof HttpError?e.message:'Registro inválido';if(!(e instanceof HttpError))throw e;}
 }
 return {namespace,rows};
}
export async function commitImport(env:Env,actor:Actor,input:Record<string,unknown>){
 const preview=await previewImport(env,actor,input);
 if(preview.rows.some(r=>r.status==='invalid'))throw new HttpError(400,'Corrige los registros inválidos antes de importar');
 const ready=preview.rows.filter(r=>r.status==='ready');if(!ready.length)return {imported:0,skipped:preview.rows.length};
 const statements: D1PreparedStatement[]=[];
 for(const row of ready){const id=crypto.randomUUID();statements.push(
  env.DB.prepare('INSERT INTO question_drafts(id,lesson_id,payload_json,created_by) VALUES(?,?,?,?)').bind(id,row.payload!.lessonId,JSON.stringify(row.payload),actor.id),
  env.DB.prepare('INSERT INTO question_import_keys(source_namespace,external_id,draft_id) VALUES(?,?,?)').bind(preview.namespace,row.externalId,id),
  env.DB.prepare("INSERT INTO admin_audit_logs(id,actor_id,action,resource_id,context_json) VALUES(?,?,'question.draft.import',?,'{}')").bind(crypto.randomUUID(),actor.id,id));
 }
 // La clave única revierte todo el lote si otra sesión importó el mismo ID a la vez.
 await env.DB.batch(statements);
 return {imported:ready.length,skipped:preview.rows.length-ready.length};
}
