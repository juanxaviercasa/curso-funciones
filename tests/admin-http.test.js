import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
// Solo esta suite sustituye Clerk. El runtime productivo conserva requireUser real.
vi.mock('../apps/api/src/auth',()=>({requireUser:vi.fn(),requireEntitlement:vi.fn()}));
import {requireUser} from '../apps/api/src/auth';
import worker from '../apps/api/src/index';
let db,env;
class Statement{
 constructor(sql,args=[]){this.sql=sql;this.args=args;}
 bind(...args){return new Statement(this.sql,args);}
 async first(){return db.prepare(this.sql).get(...this.args)||null;}
 async all(){return {results:db.prepare(this.sql).all(...this.args)};}
 async run(){return db.prepare(this.sql).run(...this.args);}
}
beforeEach(()=>{
 db=new DatabaseSync(':memory:');
 for(const name of ['0001_initial.sql','0002_training.sql','0003_orders_api.sql','0004_payment_environment.sql','0005_question_drafts.sql','0006_course_structure_drafts.sql'])db.exec(readFileSync('database/migrations/'+name,'utf8'));
 db.exec("INSERT INTO users(id,auth_subject,email,role) VALUES('admin','fixture-admin','admin@example.test','admin'),('student','fixture-student','student@example.test','student')");
 env={APP_ORIGIN:'https://course.example.test',APP_ENV:'development',PAYMENTS_ENABLED:'false',DB:{prepare:sql=>new Statement(sql),batch:async statements=>{db.exec('BEGIN');try{for(const stmt of statements)await stmt.run();db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}}}};
 vi.mocked(requireUser).mockResolvedValue({id:'admin',role:'admin'});
});
afterEach(()=>{db.close();vi.resetAllMocks();});
function request(path,body,origin=env.APP_ORIGIN){return worker.fetch(new Request(env.APP_ORIGIN+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer fixture',...(body?{'Content-Type':'application/json',Origin:origin}:{})},...(body?{body:JSON.stringify(body)}:{})}),env);}
it('HTTP deniega alumnos en todos los editores y no escribe auditoría',async()=>{
 vi.mocked(requireUser).mockResolvedValue({id:'student',role:'student'});
 for(const path of ['/api/admin/course-structure','/api/admin/question-drafts','/api/admin/lessons'])expect((await request(path)).status).toBe(403);
 for(const path of ['/api/admin/course-structure','/api/admin/question-drafts','/api/admin/lessons/l1'])expect((await request(path,{})).status).toBe(403);
 expect(db.prepare('SELECT COUNT(*) n FROM admin_audit_logs').get().n).toBe(0);
});
it('HTTP rechaza sesión ausente y origen ajeno antes de guardar',async()=>{
 vi.mocked(requireUser).mockRejectedValueOnce(new (await import('../apps/api/src/types')).HttpError(401,'Inicia sesión'));
 expect((await request('/api/admin/course-structure')).status).toBe(401);
 expect((await request('/api/admin/course-structure',{},'https://other.example.test')).status).toBe(403);
 expect(db.prepare('SELECT COUNT(*) n FROM course_structure_drafts').get().n).toBe(0);
});
it('HTTP crea y reordena estructura; lectura posterior persiste; conflicto devuelve 409',async()=>{
 const first=await request('/api/admin/course-structure');expect(first.status).toBe(200);const state=await first.json();
 const before=db.prepare('SELECT * FROM lessons ORDER BY id').all();state.modules.reverse();state.modules[0].lessons.push({id:'new-lesson',title:'Nueva privada',body:''});
 const saved=await request('/api/admin/course-structure',state);expect(saved.status).toBe(200);expect(await saved.json()).toEqual({revision:1});
 const read=await request('/api/admin/course-structure');expect((await read.json()).modules).toEqual(state.modules);
 expect((await request('/api/admin/course-structure',state)).status).toBe(409);
 expect(db.prepare('SELECT * FROM lessons ORDER BY id').all()).toEqual(before);
 expect(read.headers.get('Cache-Control')).toBe('no-store');
});
it('HTTP guarda pregunta sin clave como privada y rechaza opción inexistente',async()=>{
 const body={lessonId:'l1',kind:'multiple_choice',prompt:'Borrador privado',options:['A','B'],expected:null,explanation:'',source:'Revisión pendiente',rights:'pending'};
 expect((await request('/api/admin/question-drafts',body)).status).toBe(200);
 const list=await request('/api/admin/question-drafts');expect((await list.json()).length).toBe(1);
 expect((await request('/api/admin/question-drafts',{...body,expected:'8'})).status).toBe(400);
 expect(db.prepare('SELECT COUNT(*) n FROM questions').get().n).toBe(6);
 expect(db.prepare('SELECT COUNT(*) n FROM admin_audit_logs').get().n).toBe(1);
});

it('publica estructura y conserva preguntas, progreso y videos; rechaza repetición obsoleta',async()=>{
 const state=await (await request('/api/admin/course-structure')).json();
 db.exec("INSERT INTO progress(user_id,lesson_id,completed) VALUES('student','l1',1); UPDATE lessons SET video_key='private-video' WHERE id='l1'");
 const fresh=await (await request('/api/admin/course-structure')).json();
 fresh.modules[0].title='Módulo actualizado';fresh.modules[0].lessons[0].title='Explicación actualizada';
 fresh.modules[0].lessons.push({id:'new-public',title:'Nueva lección',body:'Explicación original.'});
 expect((await request('/api/admin/course-structure',fresh)).status).toBe(200);
 expect((await request('/api/admin/course-structure/publish',{revision:1,publishedVersion:state.publishedVersion})).status).toBe(409);
 const publish=await request('/api/admin/course-structure/publish',{revision:1,publishedVersion:fresh.publishedVersion});expect(publish.status).toBe(200);
 expect(db.prepare("SELECT title,video_key FROM lessons WHERE id='l1'").get()).toEqual({title:'Explicación actualizada',video_key:'private-video'});
 expect(db.prepare("SELECT completed FROM progress WHERE user_id='student' AND lesson_id='l1'").get().completed).toBe(1);
 expect(db.prepare('SELECT COUNT(*) n FROM questions').get().n).toBe(6);
 expect(db.prepare("SELECT title FROM lessons WHERE id='new-public'").get().title).toBe('Nueva lección');
 expect(db.prepare("SELECT COUNT(*) n FROM admin_audit_logs WHERE action='course.structure.publish'").get().n).toBe(1);
 expect((await request('/api/admin/course-structure/publish',{revision:1,publishedVersion:fresh.publishedVersion})).status).toBe(409);
});
it('publicación rechaza borrador vacío, pérdida de lecciones y alumnos',async()=>{
 let state=await (await request('/api/admin/course-structure')).json();state.modules[0].lessons[0].body='';
 await request('/api/admin/course-structure',state);
 expect((await request('/api/admin/course-structure/publish',{revision:1,publishedVersion:state.publishedVersion})).status).toBe(400);
 state=await (await request('/api/admin/course-structure')).json();state.modules[0].lessons.shift();await request('/api/admin/course-structure',state);
 expect((await request('/api/admin/course-structure/publish',{revision:2,publishedVersion:state.publishedVersion})).status).toBe(400);
 vi.mocked(requireUser).mockResolvedValue({id:'student',role:'student'});
 expect((await request('/api/admin/course-structure/publish',{revision:2,publishedVersion:state.publishedVersion})).status).toBe(403);
 expect(db.prepare("SELECT COUNT(*) n FROM admin_audit_logs WHERE action='course.structure.publish'").get().n).toBe(0);
});
it('publicación detecta edición concurrente dentro del lote y no publica parcialmente',async()=>{
 const state=await (await request('/api/admin/course-structure')).json();state.modules[0].lessons[0].title='No debe publicarse';await request('/api/admin/course-structure',state);
 const batch=env.DB.batch;env.DB.batch=async statements=>{db.exec("UPDATE lessons SET body='Cambio concurrente' WHERE id='l1'");return batch(statements);};
 expect((await request('/api/admin/course-structure/publish',{revision:1,publishedVersion:state.publishedVersion})).status).toBe(409);
 expect(db.prepare("SELECT title FROM lessons WHERE id='l1'").get().title).not.toBe('No debe publicarse');
 expect(db.prepare("SELECT COUNT(*) n FROM admin_audit_logs WHERE action='course.structure.publish'").get().n).toBe(0);
});
it('un fallo al publicar revierte temario y auditoría juntos',async()=>{
 const state=await (await request('/api/admin/course-structure')).json();const before=db.prepare('SELECT * FROM lessons ORDER BY id').all();state.modules[0].lessons[0].title='Cambio fallido';await request('/api/admin/course-structure',state);
 const batch=env.DB.batch;env.DB.batch=statements=>batch([...statements,new Statement('INSERT INTO tabla_inexistente VALUES(1)')]);
 expect((await request('/api/admin/course-structure/publish',{revision:1,publishedVersion:state.publishedVersion})).status).toBe(500);
 expect(db.prepare('SELECT * FROM lessons ORDER BY id').all()).toEqual(before);
 expect(db.prepare("SELECT COUNT(*) n FROM admin_audit_logs WHERE action='course.structure.publish'").get().n).toBe(0);
});
