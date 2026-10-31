import {HttpError,type Env} from './types';
import {requireAdmin} from './admin';
const sku='MSV-FUN-001';
type Actor={id:string;role:string};
export type StructureModule={id:string;title:string;lessons:{id:string;title:string;body:string}[]};
function record(value:unknown):value is Record<string,unknown>{return Boolean(value)&&typeof value==='object'&&!Array.isArray(value);}
export function validateStructure(value:unknown):StructureModule[]{
 if(!Array.isArray(value)||!value.length||value.length>30)throw new HttpError(400,'Usa entre 1 y 30 módulos');
 if(new TextEncoder().encode(JSON.stringify(value)).length>1000000)throw new HttpError(400,'Estructura demasiado grande');
 const ids=new Set<string>();let lessonCount=0;
 function id(v:unknown){if(typeof v!=='string'||!/^[-a-zA-Z0-9_]{1,100}$/.test(v)||ids.has(v))throw new HttpError(400,'Identificador inválido o repetido');ids.add(v);return v;}
 function title(v:unknown){if(typeof v!=='string'||!v.trim()||v.length>160)throw new HttpError(400,'Revisa los títulos (máximo 160 caracteres)');return v.trim();}
 return value.map(m=>{
  if(!record(m)||!Array.isArray(m.lessons)||m.lessons.length>50)throw new HttpError(400,'Módulo inválido');
  return {id:id(m.id),title:title(m.title),lessons:m.lessons.map(l=>{
   if(!record(l)||typeof l.body!=='string'||l.body.length>12000||++lessonCount>200)throw new HttpError(400,'Lección inválida o límite de 200 lecciones excedido');
   return {id:id(l.id),title:title(l.title),body:l.body};
  })};
 });
}
export async function getStructure(env:Env,actor:Actor){
 requireAdmin(actor);
 const draft=await env.DB.prepare('SELECT payload_json,revision FROM course_structure_drafts WHERE sku=?').bind(sku).first<{payload_json:string;revision:number}>();
 if(draft)return {modules:JSON.parse(draft.payload_json) as StructureModule[],revision:draft.revision};
 const modules=await env.DB.prepare('SELECT id,title FROM modules WHERE sku=? ORDER BY position,id').bind(sku).all<{id:string;title:string}>();
 const lessons=await env.DB.prepare('SELECT l.id,l.module_id,l.title,l.body FROM lessons l JOIN modules m ON m.id=l.module_id WHERE m.sku=? ORDER BY l.position,l.id').bind(sku).all<{id:string;module_id:string;title:string;body:string}>();
 return {revision:0,modules:modules.results.map(m=>({...m,lessons:lessons.results.filter(l=>l.module_id===m.id).map(l=>({id:l.id,title:l.title,body:l.body}))}))};
}
export async function saveStructure(env:Env,actor:Actor,input:Record<string,unknown>){
 requireAdmin(actor);const modules=validateStructure(input.modules);
 if(!Number.isSafeInteger(input.revision)||Number(input.revision)<0)throw new HttpError(400,'Revisión inválida');
 const revision=Number(input.revision),auditId=crypto.randomUUID();
 const statement=revision===0?env.DB.prepare('INSERT INTO course_structure_drafts(sku,payload_json,revision,updated_by) VALUES(?,?,1,?) ON CONFLICT(sku) DO NOTHING').bind(sku,JSON.stringify(modules),actor.id):env.DB.prepare('UPDATE course_structure_drafts SET payload_json=?,revision=revision+1,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE sku=? AND revision=?').bind(JSON.stringify(modules),actor.id,sku,revision);
 await env.DB.batch([statement,env.DB.prepare("INSERT INTO admin_audit_logs(id,actor_id,action,resource_id,context_json) SELECT ?,?,'course.structure.draft.save',?,'{}' WHERE changes()=1").bind(auditId,actor.id,sku)]);
 if(!await env.DB.prepare('SELECT id FROM admin_audit_logs WHERE id=?').bind(auditId).first())throw new HttpError(409,'Otra edición guardó cambios. Recarga el borrador antes de continuar');
 return {revision:revision+1};
}
