let firebaseModule;
const database=()=>firebaseModule??=import('./firebase-downloads.js').catch(e=>{firebaseModule=null;throw e;});
const brands = {xerox:'Xerox',canon:'Canon',konica:'Konica Minolta',ricoh:'Ricoh'};
const dialog=document.getElementById('download-dialog');
const form=document.getElementById('download-form');
const submit=document.getElementById('download-submit');
const error=document.getElementById('download-error');
const count=document.getElementById('download-count');
let selected='xerox',busy=false,requestId=null,requestEmail=null;
function uuid(){
 if(typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function')return crypto.randomUUID();
 if(typeof crypto!=='undefined'&&typeof crypto.getRandomValues==='function'){
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
 }
 return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{
  const r=Math.random()*16|0,v=c==='x'?r:(r&0x3|0x8);return v.toString(16);
 });
}
function showCount(n){
 if(!Number.isSafeInteger(n)||n<0)return;
 const numEl=count.querySelector('.badge-num');
 if(numEl){
  const prev=parseInt(numEl.textContent.replace(/,/g,''),10);
  numEl.textContent=n.toLocaleString();
  if(!isNaN(prev)&&prev!==n){
   count.classList.remove('count-pop');
   void count.offsetWidth;
   count.classList.add('count-pop');
  }
 }else{
  count.innerHTML=`<svg class="badge-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg><span class="badge-text"><b class="badge-num">${n.toLocaleString()}</b> People Downloaded</span>`;
 }
 count.hidden=selected!=='xerox';
}
async function refreshCount(){try{const db=await database();db.watchDownloadCount(showCount,()=>{});}catch(e){}}
for(const button of document.querySelectorAll('[data-driver]'))button.addEventListener('click',()=>{
 selected=button.dataset.driver;
 document.querySelectorAll('[data-driver]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.getElementById('driver-title').textContent=brands[selected]+' software';
 document.getElementById('driver-description').textContent=selected==='xerox'?'ZIP file · 33.2 MB':'';
 document.getElementById('software-status').textContent='';count.hidden=selected!=='xerox';
});
document.getElementById('driver-download').addEventListener('click',()=>{
 if(selected!=='xerox'){document.getElementById('software-status').textContent='Software is not available yet.';return;}
 error.textContent='';dialog.showModal();document.getElementById('download-email').focus();
});
document.getElementById('download-close').addEventListener('click',()=>{if(!busy)dialog.close();});
dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy||!form.reportValidity())return;
 const email=document.getElementById('download-email').value.trim().toLowerCase();
 if(email!==requestEmail||!requestId){requestId=uuid();requestEmail=email;}
 busy=true;submit.disabled=true;submit.textContent='Preparing download…';error.textContent='';
 try{
  const db=await database();
  const data=await db.recordDownload({brand:'xerox',email,requestId});
  showCount(data.count);
  const link=document.createElement('a');link.href=data.url;link.download='xerox-software.zip';document.body.append(link);link.click();link.remove();
  dialog.close();form.reset();requestId=null;requestEmail=null;
 }catch(e){error.textContent=e.message||'Unable to save your download. Please try again.';}
 finally{busy=false;submit.disabled=false;submit.textContent='Download ZIP';}
});
refreshCount();
