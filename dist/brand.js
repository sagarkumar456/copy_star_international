const menu=document.getElementById('menu-toggle'),nav=document.getElementById('main-navigation');
function setMenu(open){nav.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');}
menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
nav.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){setMenu(false);menu.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('header'))setMenu(false)});
matchMedia('(min-width:701px)').addEventListener('change',e=>{if(e.matches)setMenu(false)});
// Highlight the current section without changing page history.
const links=[...nav.querySelectorAll('a')];
const observer=new IntersectionObserver(entries=>{
 for(const entry of entries)if(entry.isIntersecting){for(const link of links){const active=link.hash==='#'+entry.target.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}}
},{rootMargin:'-15% 0px -65% 0px'});
for(const link of links){const section=document.querySelector(link.hash);if(section)observer.observe(section);}
