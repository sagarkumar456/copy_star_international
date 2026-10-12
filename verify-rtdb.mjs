import assert from 'node:assert/strict';
import fs from 'node:fs';
const base='http://127.0.0.1:9000';
const ns='demo-copystar-default-rtdb';
async function db(method,path,body,token){
 const u=new URL(base+'/'+path+'.json');u.searchParams.set('ns',ns);if(token&&token!=='owner')u.searchParams.set('auth',token);
 const response=await fetch(u,{method,headers:{'Content-Type':'application/json',...(token==='owner'?{Authorization:'Bearer owner'}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
 return {status:response.status,data:await response.json()};
}
async function account(){const r=await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({returnSecureToken:true})});assert(r.ok);return r.json();}
const rules=JSON.parse(fs.readFileSync('database.rules.test.json','utf8'));
assert.equal((await db('PUT','.settings/rules',rules,'owner')).status,200);
assert.equal((await db('PUT','',{software_downloads:52,cod_orders:{existing:'keep'}},'owner')).status,200);
const a=await account(),b=await account();
const id='12345678-1234-4234-8234-123456789abc';
function payload(user,key=id,email='buyer@example.com'){
 return {['software_emails/'+user.localId+'/'+key]:{email,brand:'xerox',createdAt:{'.sv':'timestamp'}},software_downloads:{'.sv':{increment:1}},software_download_meta:{uid:user.localId,requestId:key,createdAt:{'.sv':'timestamp'}},['software_download_limits/'+user.localId]:{'.sv':'timestamp'}};
}
assert.equal((await db('PATCH','',payload(a),a.idToken)).status,200,'paired request accepted');
assert.equal((await db('GET','software_downloads')).data,53,'existing 52 continues');
assert.equal((await db('GET','software_emails/'+a.localId+'/'+id,undefined,a.idToken)).status,200,'own exact request readable');
assert.notEqual((await db('GET','software_emails/'+a.localId+'/'+id,undefined,b.idToken)).status,200,'another visitor cannot read email');
assert.notEqual((await db('GET','software_emails')).status,200,'email collection private');
assert.notEqual((await db('PATCH','',payload(a),a.idToken)).status,200,'duplicate cannot increment');
assert.notEqual((await db('PUT','software_downloads',99,b.idToken)).status,200,'standalone count cannot increment');
assert.notEqual((await db('PATCH','',payload(b,id,'bad'),b.idToken)).status,200,'invalid email rejected');
assert.notEqual((await db('PATCH','',payload(a,'22345678-1234-4234-8234-123456789abc'),a.idToken)).status,200,'cooldown enforced');
assert.equal((await db('GET','software_downloads')).data,53,'failed requests do not count');
assert.notEqual((await db('DELETE','software_downloads',undefined,a.idToken)).status,200,'cannot delete count');
assert.notEqual((await db('PATCH','',payload(b))).status,200,'anonymous unauthenticated write rejected');
const c=await account();
const concurrent=await Promise.all([db('PATCH','',payload(b),b.idToken),db('PATCH','',payload(c),c.idToken)]);
assert(concurrent.every(x=>x.status===200),JSON.stringify(concurrent));
assert.equal((await db('GET','software_downloads')).data,55,'concurrent increments preserved');
assert.deepEqual((await db('GET','cod_orders',undefined,'owner')).data,{existing:'keep'});
console.log('PASS: 52 preserved; atomic email/count; private emails; duplicate/invalid/unauthenticated writes rejected; cooldown; concurrent increments; existing data retained. Local emulators only.');
