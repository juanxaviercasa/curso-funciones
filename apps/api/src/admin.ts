import {HttpError,type Env} from './types';
type Actor={id:string;role:string};
export function requireAdmin(actor:Actor){if(actor.role!=='admin')throw new HttpError(403,'No autorizado');}
export async function adminLessons(env:Env,actor:Actor){
 requireAdmin(actor);
 return (await env.DB.prepare('SELECT l.id,l.title,l.body,m.title module_title FROM lessons l JOIN modules m ON m.id=l.module_id ORDER BY m.position,l.position').all()).results;
}
export async function saveLesson(env:Env,actor:Actor,id:string,input:Record<string,unknown>){
 requireAdmin(actor);
 const {title,body,previousTitle,previousBody}=input;
 if(typeof title!=='string'||!title.trim()||title.length>160||typeof body!=='string'||!body.trim()||body.length>12000||typeof previousTitle!=='string'||previousTitle.length>160||typeof previousBody!=='string'||previousBody.length>12000)throw new HttpError(400,'Revisa el título y la explicación');
 const lesson=await env.DB.prepare('SELECT id FROM lessons WHERE id=?').bind(id).first();
 if(!lesson)throw new HttpError(404,'Lección no encontrada');
 const auditId=crypto.randomUUID();
 await env.DB.batch([
  env.DB.prepare('UPDATE lessons SET title=?,body=? WHERE id=? AND title=? AND body=?').bind(title.trim(),body.trim(),id,previousTitle,previousBody),
  env.DB.prepare("INSERT INTO admin_audit_logs(id,actor_id,action,resource_id,context_json) SELECT ?,?,'lesson.update',?,? WHERE changes()=1").bind(auditId,actor.id,id,JSON.stringify({fields:['title','body']}))
 ]);
 const saved=await env.DB.prepare('SELECT id FROM admin_audit_logs WHERE id=?').bind(auditId).first();
 if(!saved)throw new HttpError(409,'La lección cambió. Recarga antes de volver a editar');
 return {saved:true};
}
