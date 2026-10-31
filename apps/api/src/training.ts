import {exactNumber} from '../../../packages/math-engine';
import {HttpError,type Env} from './types';
export async function outline(env:Env,userId:string){
 const lessons=await env.DB.prepare('SELECT l.id,l.title,l.body,l.video_key,m.title module_title,m.position module_position,COALESCE(p.completed,0) completed FROM lessons l JOIN modules m ON m.id=l.module_id LEFT JOIN progress p ON p.lesson_id=l.id AND p.user_id=? ORDER BY m.position,l.position').bind(userId).all();
 const questions=await env.DB.prepare('SELECT id,lesson_id,kind,prompt,options_json FROM questions ORDER BY id').all();
 const activity=await env.DB.prepare('SELECT COUNT(*) attempts,COALESCE(SUM(correct),0) correctAttempts,COUNT(DISTINCT CASE WHEN correct=1 THEN question_id END) solvedQuestions FROM attempts WHERE user_id=?').bind(userId).first();
 return {activity,lessons:lessons.results.map(l=>({...l,video_key:undefined,videoAvailable:false})),questions:questions.results};
}
export async function submit(env:Env,userId:string,questionId:unknown,answer:unknown){
 if(typeof questionId!=='string'||typeof answer!=='string'||answer.length>40)throw new HttpError(400,'Respuesta inválida');
 const q=await env.DB.prepare('SELECT id,lesson_id,kind,private_rule_json,explanation FROM questions WHERE id=?').bind(questionId).first<{id:string;lesson_id:string;kind:string;private_rule_json:string;explanation:string}>();
 if(!q)throw new HttpError(404,'Ejercicio no encontrado');const rule=JSON.parse(q.private_rule_json) as {expected:number|string};
 const correct=q.kind==='exact_number'?exactNumber(answer,Number(rule.expected)):answer===rule.expected;
 await env.DB.batch([
  env.DB.prepare('INSERT INTO attempts(id,user_id,question_id,answer_json,correct) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),userId,q.id,JSON.stringify(answer),Number(correct)),
  env.DB.prepare('INSERT INTO progress(user_id,lesson_id,completed) VALUES(?,?,0) ON CONFLICT(user_id,lesson_id) DO NOTHING').bind(userId,q.lesson_id)
 ]);
 await env.DB.prepare('UPDATE progress SET completed=NOT EXISTS(SELECT 1 FROM questions q WHERE q.lesson_id=? AND NOT EXISTS(SELECT 1 FROM attempts a WHERE a.user_id=? AND a.question_id=q.id AND a.correct=1)),updated_at=CURRENT_TIMESTAMP WHERE user_id=? AND lesson_id=?').bind(q.lesson_id,userId,userId,q.lesson_id).run();
 return {correct,explanation:q.explanation};
}
