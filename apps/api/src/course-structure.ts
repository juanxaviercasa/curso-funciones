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
 if(draft)return {publishedVersion:await publicationVersion(env),modules:JSON.parse(draft.payload_json) as StructureModule[],revision:draft.revision};
 const modules=await env.DB.prepare('SELECT id,title FROM modules WHERE sku=? ORDER BY position,id').bind(sku).all<{id:string;title:string}>();
 const lessons=await env.DB.prepare('SELECT l.id,l.module_id,l.title,l.body FROM lessons l JOIN modules m ON m.id=l.module_id WHERE m.sku=? ORDER BY l.position,l.id').bind(sku).all<{id:string;module_id:string;title:string;body:string}>();
 return {publishedVersion:await publicationVersion(env),revision:0,modules:modules.results.map(m=>({...m,lessons:lessons.results.filter(l=>l.module_id===m.id).map(l=>({id:l.id,title:l.title,body:l.body}))}))};
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

// A deterministic snapshot also protects publication against concurrent text edits.
const liveSql="SELECT json_group_array(json_object('id',id,'title',title,'position',position,'lessons',json(lesson_json))) AS payload FROM (SELECT m.id,m.title,m.position,(SELECT json_group_array(json_object('id',id,'title',title,'body',body,'position',position,'video_key',video_key)) FROM (SELECT id,title,body,position,video_key FROM lessons WHERE module_id=m.id ORDER BY position,id)) AS lesson_json FROM modules m WHERE sku='MSV-FUN-001' ORDER BY position,id)";
async function liveSnapshot(env:Env){const row=await env.DB.prepare(liveSql).first<{payload:string}>();return row?.payload||'[]';}
async function fingerprint(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('');}
export async function publicationVersion(env:Env){return fingerprint(await liveSnapshot(env));}
export async function publishStructure(env:Env,actor:Actor,input:Record<string,unknown>){
 requireAdmin(actor);
 if(!Number.isSafeInteger(input.revision)||Number(input.revision)<1||typeof input.publishedVersion!=='string')throw new HttpError(400,'Guarda el borrador y revisa el aula antes de publicar');
 const draft=await env.DB.prepare('SELECT payload_json,revision FROM course_structure_drafts WHERE sku=?').bind(sku).first<{payload_json:string;revision:number}>();
 if(!draft||draft.revision!==input.revision)throw new HttpError(409,'El borrador cambió. Recarga antes de publicar');
 const modules=validateStructure(JSON.parse(draft.payload_json));
 if(modules.some(m=>!m.lessons.length||m.lessons.some(l=>!l.body.trim())))throw new HttpError(400,'Cada módulo necesita lecciones y cada lección una explicación antes de publicar');
 const before=await liveSnapshot(env);
 if(await fingerprint(before)!==input.publishedVersion)throw new HttpError(409,'El contenido publicado cambió. Recarga y revisa el borrador');
 const existing=JSON.parse(before) as {id:string;lessons:{id:string}[]}[];
 // This first publishing flow never removes content or its progress/questions.
 if(existing.some(m=>!modules.some(n=>n.id===m.id)||m.lessons.some(l=>!modules.some(n=>n.lessons.some(v=>v.id===l.id)))))throw new HttpError(400,'Este borrador omite contenido publicado. No se permite eliminar lecciones o módulos');
 const allModules=await env.DB.prepare('SELECT id,sku FROM modules').all<{id:string;sku:string}>();
 const allLessons=await env.DB.prepare('SELECT l.id,m.sku FROM lessons l JOIN modules m ON m.id=l.module_id').all<{id:string;sku:string}>();
 if(modules.some(m=>allLessons.results.some(l=>l.id===m.id)||allModules.results.some(v=>v.id===m.id&&v.sku!==sku)||m.lessons.some(l=>allModules.results.some(v=>v.id===l.id)||allLessons.results.some(v=>v.id===l.id&&v.sku!==sku))))throw new HttpError(400,'Identificadores reservados por otro contenido');
 const auditId=crypto.randomUUID();
 const guard=env.DB.prepare(`INSERT INTO admin_audit_logs(id,actor_id,action,resource_id,context_json) SELECT ?,?,'course.structure.publish',?,? WHERE EXISTS(SELECT 1 FROM course_structure_drafts WHERE sku=? AND revision=? AND payload_json=?) AND (${liveSql})=?`).bind(auditId,actor.id,sku,JSON.stringify({revision:draft.revision,previous:JSON.parse(before)}),sku,draft.revision,draft.payload_json,before);
 const statements=[guard];
 for(const [i,m] of modules.entries()){
  statements.push(env.DB.prepare('INSERT INTO modules(id,sku,title,position) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM admin_audit_logs WHERE id=?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,position=excluded.position').bind(m.id,sku,m.title,i+1,auditId));
  for(const [j,l] of m.lessons.entries())statements.push(env.DB.prepare('INSERT INTO lessons(id,module_id,title,body,position) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM admin_audit_logs WHERE id=?) ON CONFLICT(id) DO UPDATE SET module_id=excluded.module_id,title=excluded.title,body=excluded.body,position=excluded.position').bind(l.id,m.id,l.title,l.body,j+1,auditId));
 }
 await env.DB.batch(statements);
 if(!await env.DB.prepare('SELECT id FROM admin_audit_logs WHERE id=?').bind(auditId).first())throw new HttpError(409,'El curso cambió. Recarga y revisa antes de publicar');
 return {revision:draft.revision,publishedVersion:await publicationVersion(env)};
}
