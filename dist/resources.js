const track=document.getElementById('review-track'),cards=[...track.children],prev=document.getElementById('review-prev'),next=document.getElementById('review-next'),play=document.getElementById('review-play');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let playing=false,visible=false;
function stepSize(){return cards[1].offsetLeft-cards[0].offsetLeft}
function atEnd(){return track.scrollLeft>=track.scrollWidth-track.clientWidth-3}
function move(direction){const amount=stepSize();track.scrollTo({left:Math.max(0,Math.min(track.scrollWidth-track.clientWidth,track.scrollLeft+direction*amount)),behavior:reduced.matches?'instant':'smooth'});}
function status(){prev.disabled=track.scrollLeft<3;next.disabled=atEnd();const n=Math.min(cards.length,Math.round(track.scrollLeft/stepSize())+1);document.getElementById('review-position').textContent=n+' / '+cards.length;}
function setPlaying(on){playing=on;play.setAttribute('aria-pressed',String(on));play.textContent=on?'Pause slideshow':'Play slideshow';}
prev.addEventListener('click',()=>{setPlaying(false);move(-1)});next.addEventListener('click',()=>{setPlaying(false);move(1)});
play.addEventListener('click',()=>setPlaying(!playing));
track.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();setPlaying(false);move(e.key==='ArrowLeft'?-1:1)}});
track.addEventListener('pointerdown',()=>setPlaying(false));track.addEventListener('scroll',status,{passive:true});
new ResizeObserver(status).observe(track);
new IntersectionObserver(e=>{visible=e[0].isIntersecting}).observe(track);
reduced.addEventListener('change',e=>{if(e.matches)setPlaying(false)});
setInterval(()=>{if(!playing||!visible||document.hidden||track.matches(':hover')||track.contains(document.activeElement))return;if(atEnd())track.scrollTo({left:0,behavior:reduced.matches?'instant':'smooth'});else move(1)},5500);
status();
