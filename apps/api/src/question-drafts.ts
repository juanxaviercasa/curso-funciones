import {HttpError,type Env} from './types';
import {requireAdmin} from './admin';
type Actor={id:string;role:string};
export function validateDraft(input:Record<string,unknown>){
 const {lessonId,kind,prompt,options,expected,explanation,source,rights}=input;
 if(typeof lessonId!=='string'||lessonId.length>100||!['multiple_choice','exact_number','set'].includes(String(kind)))throw new HttpError(400,'Lección o tipo inválido');
 for(const [value,max] of [[prompt,2000],[explanation,6000],[source,500]] as const)if(typeof value!=='string'||value.length>max)throw new HttpError(400,'Texto inválido o demasiado largo');
 if(!(prompt as string).trim()||!['pending','original','authorized'].includes(String(rights)))throw new HttpError(400,'Enunciado o procedencia inválidos');
 if(!Array.isArray(options)||options.length>8||options.some(o=>typeof o!=='string'||!o.trim()||o.length>500))throw new HttpError(400,'Alternativas inválidas');
 if(expected!==null&&(typeof expected!=='string'||expected.length>40))throw new HttpError(400,'Respuesta inválida');
 if(kind==='exact_number'){
  if(options.length)throw new HttpError(400,'La respuesta numérica no usa alternativas');
  if(expected!==null&&(!/^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(expected as string)||!Number.isFinite(Number((expected as string).replace(',','.')))))throw new HttpError(400,'Respuesta numérica inválida');
 }else if(options.length<2||(expected!==null&&!options.some((_,i)=>String(i)===expected)))throw new HttpError(400,'Selecciona una alternativa válida');
 return {lessonId,kind,prompt:(prompt as string).trim(),options,expected,explanation,source,rights};
}
export async function listDrafts(env:Env,actor:Actor){requireAdmin(actor);return (await env.DB.prepare('SELECT id,lesson_id,payload_json,revision,updated_at FROM question_drafts ORDER BY updated_at DESC,id LIMIT 100').all()).results;}
export async function saveDraft(env:Env,actor:Actor,input:Record<string,unknown>){
 requireAdmin(actor);const payload=validateDraft(input);
 if(!await env.DB.prepare('SELECT id FROM lessons WHERE id=?').bind(payload.lessonId).first())throw new HttpError(404,'Lección no encontrada');
 const creating=input.id===undefined;
 if(!creating&&(typeof input.id!=='string'||!Number.isSafeInteger(input.revision)||Number(input.revision)<1))throw new HttpError(400,'Revisión inválida');
 const id=creating?crypto.randomUUID():input.id as string;
 const auditId=crypto.randomUUID();
 const stmt=creating?env.DB.prepare('INSERT INTO question_drafts(id,lesson_id,payload_json,created_by) VALUES(?,?,?,?)').bind(id,payload.lessonId,JSON.stringify(payload),actor.id):env.DB.prepare('UPDATE question_drafts SET lesson_id=?,payload_json=?,revision=revision+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND revision=?').bind(payload.lessonId,JSON.stringify(payload),id,input.revision);
 await env.DB.batch([stmt,env.DB.prepare("INSERT INTO admin_audit_logs(id,actor_id,action,resource_id,context_json) SELECT ?,?,'question.draft.save',?,'{}' WHERE changes()=1").bind(auditId,actor.id,id)]);
 if(!await env.DB.prepare('SELECT id FROM admin_audit_logs WHERE id=?').bind(auditId).first())throw new HttpError(409,'Borrador modificado por otra edición. Recarga la lista');
 return {id,revision:creating?1:Number(input.revision)+1};
}
