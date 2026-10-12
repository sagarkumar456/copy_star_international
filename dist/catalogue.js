import {sendEnquiry} from './email-config.js';
import {products,categories,selectProducts,priceLabel,stockLabel,makeRequest} from './catalogue-data.js';
const $=id=>document.getElementById(id),grid=$('product-grid'),form=$('request-form');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let sending=false;
let activeCategory='All products',lastFocus=null,requestText='';
const details=$('product-dialog'),request=$('request-dialog');
const params=new URLSearchParams(location.search);
function validOption(id,value){const select=$(id);if([...select.options].some(o=>o.value===value))select.value=value;}
$('search').value=(params.get('q')||'').slice(0,200);
if(categories.includes(params.get('category')))activeCategory=params.get('category');
for(const id of ['brand','availability','sort'])validOption(id,params.get(id));
function state(){return {query:$('search').value,category:activeCategory,brand:$('brand').value,availability:$('availability').value,sort:$('sort').value};}
function syncURL(product){const url=new URL(location.href),s=state();
 for(const [key,value,normal] of [['q',s.query,''],['category',s.category,'All products'],['brand',s.brand,'All brands'],['availability',s.availability,'all'],['sort',s.sort,'featured']]){if(value===normal)url.searchParams.delete(key);else url.searchParams.set(key,value);}
 if(product!==undefined){if(product)url.searchParams.set('product',product);else url.searchParams.delete('product');}
 history.replaceState(null,'',url);
}
function render(){
 $('category-bar').innerHTML=categories.map(c=>`<button type="button" data-category="${escape(c)}" aria-pressed="${c===activeCategory}">${escape(c)}<small>${c==='All products'?products.length:products.filter(p=>p.category===c).length}</small></button>`).join('');
 const list=selectProducts(state());
 $('result-count').textContent=`${list.length} ${list.length===1?'product':'products'}${activeCategory!=='All products'?' · '+activeCategory:''}`;
 grid.innerHTML=list.map(p=>`<article class="product-card"><button class="product-image" data-product="${p.id}" aria-label="View ${escape(p.name)}"><img src="./assets/${p.image}" alt="Illustration of ${escape(p.name)}" width="640" height="440" loading="lazy"><span class="view-label" aria-hidden="true">↗</span></button><p class="product-brand">${escape(p.brand)} · ${escape(p.category)}</p><h3><button data-product="${p.id}">${escape(p.name)}</button></h3><span class="stock">${stockLabel(p)}</span><p class="price">${priceLabel(p)}</p><div class="card-actions"><button class="button secondary" data-enquire="${p.id}">Enquire ↗</button><button class="detail-link" data-product="${p.id}">View details →</button></div></article>`).join('');
 $('empty-state').hidden=list.length>0;syncURL();
}
function category(value,jump=false){document.dispatchEvent(new Event('copystar:catalogue'));activeCategory=categories.includes(value)?value:'All products';render();if(jump)$('catalogue').scrollIntoView({block:'start'});}
function clear(){activeCategory='All products';$('filters').reset();render();$('search').focus();}
function close(dialog){if(dialog.open)dialog.close();}
function open(dialog){lastFocus=document.activeElement;document.body.classList.add('modal-open');dialog.showModal();}
for(const dialog of [details,request]){
 dialog.addEventListener('close',()=>{if(!details.open&&!request.open)document.body.classList.remove('modal-open');if(dialog===details)syncURL('');if(lastFocus?.isConnected)lastFocus.focus();});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close(dialog);});
}
function showProduct(id){
 const p=products.find(p=>p.id===id);if(!p)return;
 const related=products.filter(q=>q.id!==id&&(q.category===p.category||q.brand===p.brand)).slice(0,3);
 $('product-detail').innerHTML=`<div class="detail-layout"><div class="detail-art"><img src="./assets/${p.image}" alt="Illustration of ${escape(p.name)}"><p>Representative illustration. Actual item confirmed with quote.</p></div><div class="detail-content"><p class="product-brand">${escape(p.brand)} / ${escape(p.category)}</p><h2 id="product-title">${escape(p.name)}</h2><p>${escape(p.description)}</p><p class="price">${priceLabel(p)}</p><span class="stock">${stockLabel(p)}</span><dl>${p.details.map(([k,v])=>`<dt>${escape(k)}</dt><dd>${escape(v)}</dd>`).join('')}</dl><button class="button primary" data-enquire="${p.id}">Enquire about this product ↗</button></div></div><div class="related"><h3>Explore related products</h3>${related.map(q=>`<button data-product="${q.id}">${escape(q.name)} ↗</button>`).join('')}</div>`;
 if(!details.open)open(details);else details.scrollTop=0;
 syncURL(id);
}
function showRequest(kind,id='general',service='Repair & diagnosis'){
 if(sending)return;
 const p=products.find(p=>p.id===id);close(details);form.reset();form.elements.message.placeholder='Part code, quantities, machine symptoms or other details';
 $('request-kind').value=kind;$('request-product').value=p?.id||'';
 const isService=kind==='service',isBulk=kind==='bulk';
 for(const label of document.querySelectorAll('.bulk-field')){label.hidden=!isBulk;for(const input of label.querySelectorAll('input,select')){input.disabled=!isBulk;input.required=isBulk&&input.name!=='company';}}
 $('request-title').textContent=isService?'Request a service':isBulk?'Request an order quote':p?'Enquire about this product':'Find the right part';
 $('request-subtitle').textContent=isService?'Tell us about your machine and preferred date. The team will need to confirm the appointment.':isBulk?'Add your items, quantities and delivery area. Send the request to our team to confirm your order.':p?`${p.name} · ${priceLabel(p)} · ${stockLabel(p)}`:'Share your machine model, part code or requirements.';
 for(const label of document.querySelectorAll('.service-field')){label.hidden=!isService;for(const input of label.querySelectorAll('input,select')){input.disabled=!isService;input.required=isService;}}
 $('quantity-field').hidden=isService;form.elements.quantity.disabled=isService;
 form.elements.service.value=service;
 const d=new Date();form.elements.date.min=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 $('request-result').hidden=true;form.hidden=false;$('request-feedback').textContent='';open(request);
}
// Delegation also covers product cards created after filtering.
document.addEventListener('click',e=>{
 const button=e.target.closest('button');if(!button)return;
 if(button.hasAttribute('data-close')){close(button.closest('dialog'));return;}
 if(button.hasAttribute('data-category'))category(button.dataset.category,!button.closest('#category-bar'));
 if(button.hasAttribute('data-product'))showProduct(button.dataset.product);
 if(button.hasAttribute('data-enquire'))showRequest('product',button.dataset.enquire);
 if(button.hasAttribute('data-bulk')){showRequest('bulk');form.elements.orderCategory.value=button.dataset.bulk;form.elements.message.placeholder='List each item, model or part code, and quantity.';}
 if(button.hasAttribute('data-service'))showRequest('service','general',button.dataset.service);
});
$('filters').addEventListener('submit',e=>e.preventDefault());
$('search').addEventListener('input',render);
for(const id of ['brand','availability','sort'])$(id).addEventListener('change',render);
$('clear-filters').addEventListener('click',clear);$('empty-reset').addEventListener('click',clear);
document.addEventListener('keydown',e=>{if(e.key==='/'&&!details.open&&!request.open&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();document.dispatchEvent(new Event('copystar:catalogue'));$('catalogue').scrollIntoView();$('search').focus();}});
request.addEventListener('cancel',e=>{if(sending)e.preventDefault();});
form.addEventListener('submit',async e=>{
 if(sending){e.preventDefault();return;}
 e.preventDefault();for(const key of ['name','phone']){const field=form.elements.namedItem(key);field.value=field.value.trim();}if(!form.reportValidity())return;
 const data=Object.fromEntries(new FormData(form));
 if(!data.name.trim()||!data.phone.trim()){return;}
 requestText=makeRequest(data,products.find(p=>p.id===data.product));
 $('request-text').value=requestText;
 $('whatsapp-request').href='https://wa.me/9779851122595?text='+encodeURIComponent(requestText);
 $('email-request').href='mailto:Copystarnepal@hotmail.com?subject='+encodeURIComponent(data.kind==='service'?'COPYSTAR service request':data.kind==='bulk'?'COPYSTAR order quote':'COPYSTAR product enquiry')+'&body='+encodeURIComponent(requestText);
 sending=true;const submit=form.querySelector('[type=submit]');submit.disabled=true;submit.textContent='Sending…';request.querySelector('[data-close]').disabled=true;
 let sent=false;let failure='';
 try{await sendEnquiry(data,requestText);sent=true;}catch(e){failure=e.message;}
 finally{sending=false;submit.disabled=false;submit.textContent='Send message →';request.querySelector('[data-close]').disabled=false;}
 form.hidden=true;$('request-result').hidden=false;
 $('request-result-title').textContent=sent?'Your message has been sent.':'Your message could not be confirmed.';
 $('request-result-copy').textContent=sent?'Our team will contact you. Your order or appointment still needs confirmation.':failure+' Your details are saved below. Use WhatsApp or an email draft, or edit and try again.';
 $('request-result-icon').textContent=sent?'✓':'!';
 $('request-feedback').textContent='';
 $('share-request').hidden=!navigator.share;request.scrollTop=0;$('copy-request').focus();
});
$('edit-request').addEventListener('click',()=>{form.hidden=false;$('request-result').hidden=true;form.elements.name.focus();});
$('copy-request').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(requestText);$('request-feedback').textContent='Copied. Share this with COPYSTAR and call to confirm the next steps.';}
 catch{$('request-text').focus();$('request-text').select();$('request-feedback').textContent='Select and copy the request above, or use Download.';}
});
$('share-request').addEventListener('click',async()=>{
 try{await navigator.share({title:'COPYSTAR request',text:requestText});$('request-feedback').textContent='Share action completed. Confirm receipt with the team.';}
 catch(e){$('request-feedback').textContent=e.name==='AbortError'?'Sharing cancelled. Your request is still here.':'Sharing is unavailable. Use Copy or Download.';}
});
$('download-request').addEventListener('click',()=>{
 const url=URL.createObjectURL(new Blob([requestText],{type:'text/plain;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='copystar-request.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 $('request-feedback').textContent='A copy of your request has been downloaded.';
});
render();if(params.get('product'))showProduct(params.get('product'));
