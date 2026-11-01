// Fixed-length stream adapter for the Node test runtime; production uses Workers' native implementation.
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
// Solo esta suite sustituye Clerk. El runtime productivo conserva requireUser real.
vi.mock('../apps/api/src/auth',()=>({requireUser:vi.fn(),requireEntitlement:vi.fn()}));
import {requireUser,requireEntitlement} from '../apps/api/src/auth';
import worker from '../apps/api/src/index';
let db,env;
class TestFixedLengthStream extends TransformStream{constructor(size){let total=0;super({transform(chunk,c){total+=chunk.length;if(total>size)throw Error('length');c.enqueue(chunk);},flush(){if(total!==size)throw Error('length');}});}}

class Statement{
 constructor(sql,args=[]){this.sql=sql;this.args=args;}
 bind(...args){return new Statement(this.sql,args);}
 async first(){return db.prepare(this.sql).get(...this.args)||null;}
 async all(){return {results:db.prepare(this.sql).all(...this.args)};}
 async run(){return db.prepare(this.sql).run(...this.args);}
}
beforeEach(()=>{
 vi.stubGlobal('FixedLengthStream',TestFixedLengthStream);
 db=new DatabaseSync(':memory:');
 for(const name of ['0001_initial.sql','0002_training.sql','0003_orders_api.sql','0004_payment_environment.sql','0005_question_drafts.sql','0006_course_structure_drafts.sql','0008_lesson_assets.sql'])db.exec(readFileSync('database/migrations/'+name,'utf8'));
 db.exec("INSERT INTO users(id,auth_subject,email,role) VALUES('admin','fixture-admin','admin@example.test','admin'),('student','fixture-student','student@example.test','student')");
 env={APP_ORIGIN:'https://course.example.test',APP_ENV:'development',PAYMENTS_ENABLED:'false',DB:{prepare:sql=>new Statement(sql),batch:async statements=>{db.exec('BEGIN');try{for(const stmt of statements)await stmt.run();db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}}}};
 vi.mocked(requireUser).mockResolvedValue({id:'admin',role:'admin'});
});
afterEach(()=>{db.close();vi.resetAllMocks();vi.restoreAllMocks();});
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
function mediaStorage(){const objects=new Map();env.MEDIA_ENABLED='true';env.MEDIA_SIGNING_KEY='fixture-only-signing-key-with-more-than-32-bytes';env.PRIVATE_MEDIA={put:async(key,value)=>{objects.set(key,value instanceof ReadableStream?new Uint8Array(await new Response(value).arrayBuffer()):new Uint8Array(value));},delete:async key=>objects.delete(key),head:async key=>objects.has(key)?{size:objects.get(key).length}:null,get:async(key,options)=>{const b=objects.get(key);if(!b)return null;return {body:new Blob([b.slice(options.range.offset,options.range.offset+options.range.length)]).stream(),arrayBuffer:async()=>b.slice(options.range.offset,options.range.offset+options.range.length).buffer};}};return objects;}
function uploadFixture(kind='video',name='clase.mp4',bytes=new Uint8Array([0,0,0,16,102,116,121,112,105,115,111,109,0,0,0,0])){return worker.fetch(new Request(env.APP_ORIGIN+'/api/admin/lessons/l1/assets?kind='+kind+'&name='+encodeURIComponent(name),{method:'POST',headers:{Origin:env.APP_ORIGIN,Authorization:'Bearer fixture','Content-Length':String(bytes.length)},body:bytes}),env);}
it('medios desactivados no consultan almacenamiento; alumnos no pueden subir',async()=>{
 expect(await (await request('/api/lessons/l1/assets')).json()).toEqual({enabled:false,assets:[]});
 expect((await uploadFixture()).status).toBe(503);
 vi.mocked(requireUser).mockResolvedValue({id:'student',role:'student'});expect((await uploadFixture()).status).toBe(403);
});
it('carga MP4 privado y sirve rangos, HEAD y tickets sin exponer claves',async()=>{
 const objects=mediaStorage();const upload=await uploadFixture();expect(upload.status).toBe(200);const {id}=await upload.json();expect(objects.size).toBe(1);
 const list=await (await request('/api/lessons/l1/assets')).json();expect(list.assets[0].object_key).toBeUndefined();expect(list.assets[0].filename).toBe('clase.mp4');
 const {url}=await (await request('/api/assets/'+id+'/ticket',{})).json();
 const full=await worker.fetch(new Request(env.APP_ORIGIN+url),env);expect(full.status).toBe(200);expect(full.headers.get('Cache-Control')).toBe('private, no-store');expect(full.headers.get('Referrer-Policy')).toBe('no-referrer');expect(full.headers.get('Content-Type')).toBe('video/mp4');expect((await full.arrayBuffer()).byteLength).toBe(16);
 const partial=await worker.fetch(new Request(env.APP_ORIGIN+url,{headers:{Range:'bytes=4-7'}}),env);expect(partial.status).toBe(206);expect(partial.headers.get('Content-Range')).toBe('bytes 4-7/16');expect(await partial.text()).toBe('ftyp');
 expect((await worker.fetch(new Request(env.APP_ORIGIN+url,{headers:{Range:'bytes=30-40'}}),env)).status).toBe(416);
 const head=await worker.fetch(new Request(env.APP_ORIGIN+url,{method:'HEAD'}),env);expect(head.status).toBe(200);expect(await head.text()).toBe('');
 expect((await worker.fetch(new Request(env.APP_ORIGIN+url+'bad'),env)).status).toBe(401);
 const now=Date.now();vi.spyOn(Date,'now').mockReturnValue(now+301000);expect((await worker.fetch(new Request(env.APP_ORIGIN+url),env)).status).toBe(401);
});
it('revoca ticket si pierde acceso y rechaza contenido o nombre no permitido',async()=>{
 mediaStorage();expect((await uploadFixture('video','fake.mp4',new Uint8Array(16))).status).toBe(400);expect((await uploadFixture('material','../file.pdf')).status).toBe(400);
 const pdf=new TextEncoder().encode('%PDF-1.7\nfixture-original');const upload=await uploadFixture('material','guia.pdf',pdf);expect(upload.status).toBe(200);const {id}=await upload.json();
 vi.mocked(requireUser).mockResolvedValue({id:'student',role:'student'});const {url}=await (await request('/api/assets/'+id+'/ticket',{})).json();
 vi.mocked(requireEntitlement).mockRejectedValue(new (await import('../apps/api/src/types')).HttpError(403,'Acceso revocado'));
 expect((await worker.fetch(new Request(env.APP_ORIGIN+url),env)).status).toBe(403);
 expect((await request('/api/assets/'+id+'/ticket',{})).status).toBe(403);
});
it('una carga fallida elimina su objeto y revierte metadatos',async()=>{
 const objects=mediaStorage();env.DB.batch=async()=>{throw Error('failure');};expect((await uploadFixture()).status).toBe(500);expect(objects.size).toBe(0);expect(db.prepare('SELECT COUNT(*) n FROM lesson_assets').get().n).toBe(0);
});
it('sustituir video invalida enlaces previos y no cambia la explicación',async()=>{
 mediaStorage();const {id}=await (await uploadFixture()).json();const {url}=await (await request('/api/assets/'+id+'/ticket',{})).json();const before=db.prepare("SELECT body FROM lessons WHERE id='l1'").get().body;
 expect((await uploadFixture('video','otra-clase.mp4')).status).toBe(200);
 expect((await worker.fetch(new Request(env.APP_ORIGIN+url),env)).status).toBe(404);
 const listed=await (await request('/api/lessons/l1/assets')).json();expect(listed.assets).toHaveLength(1);expect(listed.assets[0].filename).toBe('otra-clase.mp4');expect(db.prepare("SELECT body FROM lessons WHERE id='l1'").get().body).toBe(before);
});
function multipartStorage(){const objects=mediaStorage(),uploads=new Map();let completed=0;const oldHead=env.PRIVATE_MEDIA.head;env.PRIVATE_MEDIA.head=async key=>{const h=await oldHead(key);return h?{...h,etag:'etag-'+key}:null;};env.PRIVATE_MEDIA.list=async()=>({objects:[...objects].filter(([key])=>key.startsWith('incoming/')).map(([key,b])=>({key,size:b.length,etag:'etag-'+key})),truncated:false});env.PRIVATE_MEDIA.createMultipartUpload=async key=>{const uploadId=crypto.randomUUID();uploads.set(uploadId,{key,parts:new Map()});return {key,uploadId};};env.PRIVATE_MEDIA.resumeMultipartUpload=(key,id)=>({uploadPart:async(n,bytes)=>{const u=uploads.get(id);if(!u||u.key!==key)throw Error('missing');u.parts.set(n,new Uint8Array(bytes));return {partNumber:n,etag:'part-'+n};},complete:async parts=>{const u=uploads.get(id);const size=parts.reduce((n,p)=>n+u.parts.get(p.partNumber).length,0),bytes=new Uint8Array(size);let o=0;for(const p of parts){const b=u.parts.get(p.partNumber);bytes.set(b,o);o+=b.length;}objects.set(key,bytes);uploads.delete(id);completed++;return {size};},abort:async()=>uploads.delete(id)});return {objects,uploads,completed:()=>completed};}
function partRequest(token,number,bytes){return worker.fetch(new Request(env.APP_ORIGIN+'/api/admin/media/part?part='+number,{method:'POST',headers:{Origin:env.APP_ORIGIN,Authorization:'Bearer fixture','X-Upload-Session':token},body:bytes}),env);}
it('multipart valida límite, partes y finalización idempotente sin memoria de archivo completo',async()=>{
 const storage=multipartStorage();const size=8*1024*1024+16;
 expect((await request('/api/admin/lessons/l1/upload',{name:'large.mp4',size:5*1024**3})).status).toBe(400);
 const start=await request('/api/admin/lessons/l1/upload',{name:'large.mp4',size});expect(start.status).toBe(200);const {token,partSize}=await start.json();expect(partSize).toBe(8*1024*1024);
 const first=new Uint8Array(partSize);first.set(new TextEncoder().encode('ftyp'),4);
 expect((await partRequest(token,1,new Uint8Array(12))).status).toBe(400);
 expect((await partRequest(token,3,new Uint8Array(16))).status).toBe(400);
 const receipt1=(await (await partRequest(token,1,first)).json()).receipt;
 const receipt2=(await (await partRequest(token,2,new Uint8Array(16))).json()).receipt;
 expect((await request('/api/admin/media/complete',{token,receipts:[receipt1]})).status).toBe(400);
 expect((await request('/api/admin/media/complete',{token,receipts:[receipt2,receipt1]})).status).toBe(400);
 const result=await request('/api/admin/media/complete',{token,receipts:[receipt1,receipt2]});expect(result.status).toBe(200);const saved=await result.json();expect((await request('/api/admin/media/complete',{token,receipts:[receipt1,receipt2]})).status).toBe(200);expect(storage.completed()).toBe(1);
 expect(db.prepare('SELECT size_bytes FROM lesson_assets WHERE id=?').get(saved.id).size_bytes).toBe(size);
 expect((await (await request('/api/lessons/l1/assets')).json()).assets).toHaveLength(1);
});
it('multipart exige admin, sesión firmada y permite abortar',async()=>{
 const storage=multipartStorage();const {token}=await (await request('/api/admin/lessons/l1/upload',{name:'video.mp4',size:16})).json();expect(storage.uploads.size).toBe(1);
 expect((await partRequest(token+'bad',1,new Uint8Array(16))).status).toBe(400);
 vi.mocked(requireUser).mockResolvedValue({id:'student',role:'student'});expect((await partRequest(token,1,new Uint8Array(16))).status).toBe(403);expect((await request('/api/admin/media/files')).status).toBe(403);
 vi.mocked(requireUser).mockResolvedValue({id:'admin',role:'admin'});expect((await request('/api/admin/media/abort',{token})).status).toBe(200);expect(storage.uploads.size).toBe(0);
});
it('Cyberduck lista solo incoming y asocia MP4 existente con etag verificado',async()=>{
 const storage=multipartStorage();const bytes=new Uint8Array(16);bytes.set(new TextEncoder().encode('ftyp'),4);storage.objects.set('incoming/clase.mp4',bytes);storage.objects.set('private/oculto.mp4',bytes);
 const list=await (await request('/api/admin/media/files')).json();expect(list.files.map(f=>f.key)).toEqual(['incoming/clase.mp4']);
 expect((await request('/api/admin/lessons/l1/external',{key:'private/oculto.mp4',etag:'etag-private/oculto.mp4'})).status).toBe(400);
 expect((await request('/api/admin/lessons/l1/external',{key:'incoming/clase.mp4',etag:'obsolete'})).status).toBe(409);
 expect((await request('/api/admin/lessons/l1/external',{key:'incoming/clase.mp4',etag:'etag-incoming/clase.mp4'})).status).toBe(200);
 expect(db.prepare("SELECT video_key FROM lessons WHERE id='l1'").get().video_key).toBe('incoming/clase.mp4');
 expect((await request('/api/admin/lessons/l2/external',{key:'incoming/clase.mp4',etag:'etag-incoming/clase.mp4'})).status).toBe(409);
 expect(storage.objects.size).toBe(2);
});
it('subida normal acepta más de32MiB y rechaza sobre100MB antes de guardar',async()=>{
 const objects=mediaStorage();const bytes=new Uint8Array(33*1024*1024);bytes.set(new TextEncoder().encode('ftyp'),4);
 const uploaded=await uploadFixture('video','clase-grande.mp4',bytes);expect(uploaded.status).toBe(200);expect([...objects.values()][0].length).toBe(bytes.length);
 const oversized=await worker.fetch(new Request(env.APP_ORIGIN+'/api/admin/lessons/l1/assets?kind=video&name=grande.mp4',{method:'POST',headers:{Origin:env.APP_ORIGIN,Authorization:'Bearer fixture','Content-Length':'100000001'},body:new Uint8Array(16)}),env);expect(oversized.status).toBe(413);expect(objects.size).toBe(1);
});
