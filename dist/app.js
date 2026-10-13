import * as T from './vendor/three.module.js';
import {buildCopier,poseParts,explosionAt} from './model.js';
import {buildTechnician,animateTechnicianService,SERVICE_ACTIONS} from './technician.js';

const $=id=>document.getElementById(id), stage=$('stage'), section=$('experience'), range=$('progress');
let renderer,scene,camera,copier,technician,shadow,ground,p=0,target=0,last=0,visible=true,yaw=0,yawTarget=0,pitch=0,pitchTarget=0,chapter=-1;
let currentMode='explode'; // 'explode' | 'technician'
let techAction='toner'; // 'toner' | 'roller' | 'cassette'
let techProgress=0.0;
let techPlaying=true;
let techZoom=false;
let techLastStepIdx=-1;
let screenCanvas, screenCtx, screenTex;

const mq=matchMedia('(prefers-reduced-motion: reduce)');let reduced=mq.matches;
function motionUI(){$('motion').textContent='Motion: '+(reduced?'reduced':'full');$('motion').setAttribute('aria-pressed',String(reduced));}
function readScroll(){target=T.MathUtils.clamp((scrollY-section.offsetTop)/(section.offsetHeight-innerHeight),0,1)}

const chapters=[
  ['Photocopier Machines.<br>Sales, Parts & Service.','Discover premium Xerox, Canon & digital copiers with trusted support from Sandeep Das at COPYSTAR International.','COMPLETE COPIER MACHINES','Heavy-duty multifunction printers for commercial & office printing.','STAGE 01 · ASSEMBLED MACHINE',['Xerox & Canon Copiers','Heavy-Duty Print & Scan','Sales & AMC by Sandeep Das']],
  ['Genuine Spare Parts.<br>Toner & Drive Gears.','From toner cartridges and drums to fuser rollers and gears, explore the parts that keep every machine printing.','PARTS & CONSUMABLES','Toners, drums, fuser rollers & precision gears.','STAGE 02 · EXPLODED PARTS VIEW',['CMYK & Black Toners','Rollers, Drums & Gears','Verified Compatible Fit']],
  ['Expert Repair & AMC.<br>Ready for Work.','Fast diagnosis, certified technician service and bulk delivery across Nepal. Complete print solutions ready for you.','REPAIR & AMC SUPPORT','Trusted maintenance and bulk delivery by Sandeep Das & team.','STAGE 03 · REASSEMBLED & READY',['On-site Diagnostics','Preventive Maintenance','Pan-Nepal Delivery']]
];

function ui(){
  if(currentMode==='technician')return;
  let n=p<.25?0:p<.66?1:2;
  if(n!==chapter){
    chapter=n;
    $('chapter-title').innerHTML=chapters[n][0];
    $('chapter-copy').textContent=chapters[n][1];
    $('chapter-number').textContent='0'+(n+1);
    $('detail-label').textContent=chapters[n][2];
    $('detail-copy').textContent=chapters[n][3];
    const pill=$('stage-pill');if(pill)pill.textContent=chapters[n][4];
    const tags=$('stage-tags');if(tags&&chapters[n][5])tags.innerHTML=chapters[n][5].map(t=>`<span>${t}</span>`).join('');
    document.querySelectorAll('[data-progress]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===n)));
  }
  range.value=Math.round(p*1000);
  const pc=Math.round(p*100);
  $('percent').textContent=String(pc).padStart(2,'0')+'%';
  const state=p<.08?'Assembled':p<.43?'Separating':p<.61?'Exploded view':p<.94?'Reassembling':'Complete';
  range.setAttribute('aria-valuetext',state+', '+pc+' percent');
  $('state-caption').textContent=reduced?'Reduced motion / assembled view':state+' / '+(p<.08?'ready to explore':pc+'% explored');
  $('annotations').style.opacity=!reduced&&explosionAt(p)>.9?'1':'0';
}

function initCopierScreen(){
  screenCanvas=document.createElement('canvas');
  screenCanvas.width=512;
  screenCanvas.height=320;
  screenCtx=screenCanvas.getContext('2d');
  screenTex=new T.CanvasTexture(screenCanvas);
  screenTex.colorSpace=T.SRGBColorSpace;
  drawCopierScreen('Ready to print','System ready','#8eb8b9','100%');
  return screenTex;
}

function drawCopierScreen(title,statusMsg,statusColor='#8eb8b9',tonerPct='100%'){
  if(!screenCtx)return;
  screenCtx.fillStyle='#10252c';
  screenCtx.fillRect(0,0,512,320);
  screenCtx.fillStyle='#f3f8f5';
  screenCtx.font='500 28px Arial';
  screenCtx.fillText(title,26,47);
  screenCtx.fillStyle='#718d93';
  screenCtx.font='16px Arial';
  screenCtx.fillText('COPYSTAR · SANDEEP DAS',26,76);
  ['Copy','Scan','Print'].forEach((s,i)=>{
    screenCtx.fillStyle=['#df252e','#2e807d','#506b7c'][i];
    screenCtx.fillRect(26+i*158,110,144,137);
    screenCtx.fillStyle='white';
    screenCtx.strokeStyle='white';
    screenCtx.lineWidth=3;
    screenCtx.strokeRect(72+i*158,134,41,49);
    screenCtx.fillRect(81+i*158,146,25,3);
    screenCtx.fillRect(81+i*158,156,25,3);
    screenCtx.font='20px Arial';
    screenCtx.fillText(s,73+i*158,223);
  });
  screenCtx.fillStyle=statusColor;
  screenCtx.font='bold 16px Arial';
  screenCtx.fillText('●  '+statusMsg+' ('+tonerPct+')',26,292);
  if(screenTex)screenTex.needsUpdate=true;
}

function updatePlayButtonUI(){
  const btn=$('tech-btn-play');
  if(btn){
    btn.textContent=techPlaying?'⏸ Pause':'⏵ Play';
    btn.setAttribute('aria-label',techPlaying?'Pause simulation':'Play simulation');
    btn.title=techPlaying?'Pause simulation':'Play simulation';
  }
}

function renderStepDots(){
  const container=$('tech-step-dots');
  if(!container)return;
  const action=SERVICE_ACTIONS[techAction];
  if(!action)return;
  container.innerHTML=action.steps.map((st,i)=>`
    <button type="button" class="tech-dot" data-step="${i}" title="${st.title}">
      <span class="dot-num">${i+1}</span>
    </button>
  `).join('');
  container.querySelectorAll('.tech-dot').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      const stepIdx=parseInt(btn.dataset.step,10);
      techProgress=action.steps[stepIdx].start+0.005;
      techPlaying=false;
      updatePlayButtonUI();
    });
  });
}

function updateTechTaskUI(){
  const action=SERVICE_ACTIONS[techAction];
  if(!action)return;
  const titleEl=$('tech-action-name');
  if(titleEl)titleEl.textContent=action.name;
  document.querySelectorAll('.task-btn').forEach(btn=>{
    const isActive=btn.dataset.action===techAction;
    btn.classList.toggle('active',isActive);
    btn.setAttribute('aria-pressed',String(isActive));
  });
  renderStepDots();
  techLastStepIdx=-1;
}

function updateTechHUD(prog){
  const action=SERVICE_ACTIONS[techAction];
  if(!action)return;
  let currentStep=action.steps[0];
  let stepIdx=0;
  for(let i=0;i<action.steps.length;i++){
    if(prog>=action.steps[i].start&&prog<=action.steps[i].end){
      currentStep=action.steps[i];
      stepIdx=i;
      break;
    }
  }

  const pb=$('tech-progress-bar');
  if(pb)pb.style.width=Math.round(prog*100)+'%';

  if(stepIdx!==techLastStepIdx){
    techLastStepIdx=stepIdx;
    const pill=$('tech-step-pill');
    if(pill)pill.textContent=`STEP ${stepIdx+1} OF ${action.steps.length}`;
    const categoryEl=$('tech-step-category');
    if(categoryEl)categoryEl.textContent=action.tag||'SERVICE SIMULATION';
    const title=$('tech-step-title');
    if(title)title.textContent=currentStep.title;
    const specText=$('tech-spec-text');
    if(specText)specText.textContent=currentStep.spec||'OEM CERTIFIED PROCEDURE';
    const desc=$('tech-step-desc');
    if(desc)desc.textContent=currentStep.desc;

    document.querySelectorAll('.tech-dot').forEach((d,idx)=>{
      d.classList.toggle('active',idx===stepIdx);
    });

    if(techAction==='toner'){
      if(prog<0.22){
        drawCopierScreen('Service in progress','Opening front cover','#f59e0b','12%');
      }else if(prog<0.44){
        drawCopierScreen('Replacing Toner','Cartridge unlocked','#ef4444','0%');
      }else if(prog<0.72){
        drawCopierScreen('Inserting Toner','Loading genuine cartridge','#3b82f6','50%');
      }else{
        drawCopierScreen('Ready to print','Cyan toner refilled 100%','#22c55e','100%');
      }
    }else if(techAction==='roller'){
      drawCopierScreen('Maintenance Mode','Drive mesh verified','#22c55e','100%');
    }else if(techAction==='cassette'){
      drawCopierScreen('Cassette Ready','Tray 1 loaded 500 sheets','#22c55e','100%');
    }
  }
}

function setExperienceMode(newMode){
  if(currentMode===newMode)return;
  currentMode=newMode;
  const isTech=currentMode==='technician';
  document.body.classList.toggle('mode-technician',isTech);

  $('mode-explode-btn')?.classList.toggle('active',!isTech);
  $('mode-explode-btn')?.setAttribute('aria-selected',String(!isTech));
  $('mode-tech-btn')?.classList.toggle('active',isTech);
  $('mode-tech-btn')?.setAttribute('aria-selected',String(isTech));

  const hud=$('tech-hud-card');
  if(hud)hud.hidden=!isTech;

  const annotations=$('annotations');
  if(annotations)annotations.hidden=isTech;

  const sceneControls=document.querySelector('.scene-controls');
  if(sceneControls)sceneControls.style.opacity=isTech?'0.25':'1';

  if(technician)technician.root.visible=isTech;

  if(isTech){
    if(copier&&copier.parts){
      copier.parts.forEach(pt=>{
        if(pt.userOffset)pt.userOffset.set(0,0,0);
      });
    }
    techProgress=0.0;
    techPlaying=true;
    yawTarget=-0.32;
    pitchTarget=0.08;
    updateTechTaskUI();
    updatePlayButtonUI();
  }else{
    if(copier&&copier.parts){
      copier.parts.forEach(pt=>{
        pt.g.position.copy(pt.base);
        if(pt.baseRotation)pt.g.rotation.copy(pt.baseRotation);
        else pt.g.rotation.set(0,0,0);
        if(pt.userOffset)pt.userOffset.set(0,0,0);
      });
    }
    drawCopierScreen('Ready to print','System ready','#8eb8b9','100%');
    yawTarget=0;
    pitchTarget=0;
  }
}

function initModeAndTechControls(){
  $('mode-explode-btn')?.addEventListener('click',()=>setExperienceMode('explode'));
  $('mode-tech-btn')?.addEventListener('click',()=>setExperienceMode('technician'));
  $('tech-hud-close')?.addEventListener('click',()=>setExperienceMode('explode'));
  $('service-demo-trigger')?.addEventListener('click',()=>{
    setExperienceMode('technician');
    section.scrollIntoView({behavior:'smooth'});
  });

  $('tech-hud-toggle')?.addEventListener('click',()=>{
    const hud=$('tech-hud-card');
    if(!hud)return;
    const isCompact=hud.classList.toggle('is-compact');
    const toggleBtn=$('tech-hud-toggle');
    if(toggleBtn)toggleBtn.textContent=isCompact?'▴':'▾';
  });

  document.querySelectorAll('.task-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const act=btn.dataset.action;
      if(act&&SERVICE_ACTIONS[act]){
        techAction=act;
        techProgress=0.0;
        techPlaying=true;
        if(copier&&copier.parts){
          copier.parts.forEach(pt=>{
            pt.g.position.copy(pt.base);
            if(pt.baseRotation)pt.g.rotation.copy(pt.baseRotation);
            else pt.g.rotation.set(0,0,0);
          });
        }
        updateTechTaskUI();
        updatePlayButtonUI();
      }
    });
  });

  $('tech-btn-play')?.addEventListener('click',()=>{
    techPlaying=!techPlaying;
    updatePlayButtonUI();
  });

  $('tech-btn-replay')?.addEventListener('click',()=>{
    techProgress=0.0;
    techPlaying=true;
    techLastStepIdx=-1;
    updatePlayButtonUI();
  });

  $('tech-btn-zoom')?.addEventListener('click',()=>{
    techZoom=!techZoom;
    const btn=$('tech-btn-zoom');
    if(btn){
      btn.classList.toggle('active',techZoom);
      btn.textContent=techZoom?'🔍 Reset':'🔍 Zoom';
    }
  });
}

function setup(){
  renderer=new T.WebGLRenderer({canvas:$('scene'),antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.25;

  scene=new T.Scene();
  camera=new T.PerspectiveCamera(34,1,.1,100);

  scene.add(new T.HemisphereLight(0xf4f8ff,0x8e9987,3));

  const key=new T.DirectionalLight(0xfffcf2,4.3);
  key.position.set(-4,9,7);
  key.castShadow=true;
  key.shadow.mapSize.set(2048,2048);
  Object.assign(key.shadow.camera,{left:-6,right:6,top:8,bottom:-5,near:.1,far:25});
  key.shadow.bias=-.0004;
  key.shadow.normalBias=.035;
  key.shadow.radius=3;
  scene.add(key);

  const rim=new T.DirectionalLight(0xffffff,2.5);
  rim.position.set(5,5,-4);
  scene.add(rim);

  const fill=new T.DirectionalLight(0xa9c8ff,.8);
  fill.position.set(0,3,6);
  scene.add(fill);

  ground=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.12}));
  ground.rotation.x=-Math.PI/2;
  ground.position.y=.14;
  ground.receiveShadow=true;
  scene.add(ground);

  const c=document.createElement('canvas');c.width=c.height=128;
  const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,4,64,64,64);
  g.addColorStop(0,'rgba(34,48,36,.22)');
  g.addColorStop(.5,'rgba(34,48,36,.11)');
  g.addColorStop(1,'rgba(34,48,36,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
  shadow=new T.Mesh(new T.PlaneGeometry(5.8,4.8),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;
  shadow.position.y=.151;
  scene.add(shadow);

  // Copier with interactive screen texture
  copier=buildCopier(initCopierScreen());
  scene.add(copier.root);

  // Technician character & service cart
  technician=buildTechnician();
  scene.add(technician.root);
  technician.root.visible=false; // hidden by default until technician mode activated

  resize();
  $('loader').hidden=true;
  readScroll();
  motionUI();
  initRotateControls();
  initModeAndTechControls();
  requestAnimationFrame(frame);
}

function resize(){
  if(!renderer)return;
  const w=stage.clientWidth,h=stage.clientHeight;
  if(!w||!h)return;
  renderer.setSize(w,h,false);
  camera.aspect=w/h;
  camera.updateProjectionMatrix();
  positionCamera();
}

function positionCamera(){
  if(!camera)return;
  if(currentMode==='technician'){
    const isMobile=window.innerWidth<=768;
    const cx=techZoom?0.32:0.42;
    const cy=techZoom?(isMobile?2.38:2.15):(isMobile?2.32:2.10);
    const cz=techZoom?0.95:0.75;
    const baseDist=techZoom?(isMobile?5.0:4.2):(isMobile?8.0:7.2);
    const scaleFactor=isMobile?0.74:0.68;
    const dist=Math.max(baseDist,baseDist/camera.aspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*scaleFactor;
    const angle=0.48+yaw;
    camera.position.set(cx+Math.sin(angle)*dist,cy+dist*(0.22+pitch),cz+Math.cos(angle)*dist);
    camera.lookAt(cx,cy,cz);
    return;
  }

  const e=reduced?0:explosionAt(p),height=5.9+2.1*e,width=5.8+3.4*e;
  const dist=Math.max(height,width/camera.aspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)));
  const angle=.52+yaw;
  camera.position.set(Math.sin(angle)*dist,2.25+e*.55+dist*(.32+pitch),Math.cos(angle)*dist);
  camera.lookAt(0,2.25+e*.55,0);
}

let isDragging=false,isDraggingPart=false,activePart=null,startX=0,startY=0,startYaw=0,startPitch=0,autoSpin=false;
const raycaster=new T.Raycaster();
const pointerVec=new T.Vector2();
const dragPlane=new T.Plane();
const planeIntersect=new T.Vector3();
const dragOffset=new T.Vector3();

function updateAutoSpinUI(){
  const b=$('btn-rot-auto');
  if(b){b.setAttribute('aria-pressed',String(autoSpin));b.classList.toggle('active',autoSpin);}
}

function updatePartLabel(cx,cy){
  const pl=$('part-label');
  if(!pl)return;
  const r=stage.getBoundingClientRect();
  const x=Math.max(10,Math.min(r.width-130,cx-r.left+14));
  const y=Math.max(10,Math.min(r.height-36,cy-r.top-26));
  pl.style.left=x+'px';
  pl.style.top=y+'px';
}

function getIntersectedPart(cx,cy){
  if(currentMode==='technician')return null; // keep parts attached during technician service simulation
  if(!copier||!copier.root||!camera)return null;
  const rect=renderer.domElement.getBoundingClientRect();
  if(!rect.width||!rect.height)return null;
  pointerVec.x=((cx-rect.left)/rect.width)*2-1;
  pointerVec.y=-((cy-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(pointerVec,camera);
  const hits=raycaster.intersectObjects(copier.root.children,true);
  if(!hits.length)return null;
  let obj=hits[0].object;
  while(obj&&obj!==copier.root){
    const found=copier.parts.find(p=>p.g===obj);
    if(found)return {part:found,point:hits[0].point};
    obj=obj.parent;
  }
  return null;
}

function initRotateControls(){
  const s=$('stage');
  if(!s)return;
  s.addEventListener('pointerdown',e=>{
    if(e.button!==0&&e.pointerType==='mouse')return;
    if(e.target.closest('button,a,.tech-hud-card'))return;
    const hit=getIntersectedPart(e.clientX,e.clientY);
    if(hit){
      isDraggingPart=true;
      activePart=hit.part;
      if(!activePart.userOffset)activePart.userOffset=new T.Vector3(0,0,0);
      const camDir=new T.Vector3();
      camera.getWorldDirection(camDir);
      dragPlane.setFromNormalAndCoplanarPoint(camDir.negate(),activePart.g.position);
      if(raycaster.ray.intersectPlane(dragPlane,planeIntersect)){
        dragOffset.copy(planeIntersect).sub(activePart.g.position);
      }else{
        dragOffset.set(0,0,0);
      }
      s.classList.add('is-dragging-part');
      const pl=$('part-label'),pn=$('part-name');
      if(pl&&pn){
        pn.textContent=activePart.g.name||'Part';
        pl.hidden=false;
        updatePartLabel(e.clientX,e.clientY);
      }
      autoSpin=false;
      updateAutoSpinUI();
      try{s.setPointerCapture(e.pointerId)}catch(_){}
      return;
    }
    isDragging=true;
    startX=e.clientX;
    startY=e.clientY;
    startYaw=yawTarget;
    startPitch=pitchTarget;
    autoSpin=false;
    updateAutoSpinUI();
    s.classList.add('is-dragging');
    try{s.setPointerCapture(e.pointerId)}catch(_){}
  });

  s.addEventListener('pointermove',e=>{
    if(isDraggingPart&&activePart){
      const rect=renderer.domElement.getBoundingClientRect();
      pointerVec.x=((e.clientX-rect.left)/rect.width)*2-1;
      pointerVec.y=-((e.clientY-rect.top)/rect.height)*2+1;
      raycaster.setFromCamera(pointerVec,camera);
      if(raycaster.ray.intersectPlane(dragPlane,planeIntersect)){
        const targetPos=planeIntersect.clone().sub(dragOffset);
        const delta=targetPos.sub(activePart.g.position);
        activePart.userOffset.add(delta);
        activePart.g.position.add(delta);
      }
      updatePartLabel(e.clientX,e.clientY);
      return;
    }
    if(isDragging){
      const dx=e.clientX-startX;
      const dy=e.clientY-startY;
      yawTarget=startYaw-dx*0.0075;
      pitchTarget=T.MathUtils.clamp(startPitch-dy*0.005,-0.45,0.75);
      return;
    }
    if(e.pointerType==='mouse'&&currentMode==='explode'){
      const hit=getIntersectedPart(e.clientX,e.clientY);
      if(hit){
        s.setAttribute('title',hit.part.g.name+' — Drag to move part');
      }else{
        s.setAttribute('title','Drag to rotate 360°');
      }
    }
  });

  const stopDrag=e=>{
    if(isDraggingPart){
      isDraggingPart=false;
      activePart=null;
      s.classList.remove('is-dragging-part');
      const pl=$('part-label');
      if(pl)pl.hidden=true;
      try{s.releasePointerCapture(e.pointerId)}catch(_){}
    }
    if(isDragging){
      isDragging=false;
      s.classList.remove('is-dragging');
      try{s.releasePointerCapture(e.pointerId)}catch(_){}
    }
  };

  s.addEventListener('pointerup',stopDrag);
  s.addEventListener('pointercancel',stopDrag);

  $('btn-reset-parts')?.addEventListener('click',e=>{
    e.stopPropagation();
    if(copier&&copier.parts){
      copier.parts.forEach(pt=>{if(pt.userOffset)pt.userOffset.set(0,0,0)});
    }
  });

  $('btn-rot-left')?.addEventListener('click',e=>{
    e.stopPropagation();
    autoSpin=false;
    updateAutoSpinUI();
    yawTarget+=Math.PI/4;
  });

  $('btn-rot-right')?.addEventListener('click',e=>{
    e.stopPropagation();
    autoSpin=false;
    updateAutoSpinUI();
    yawTarget-=Math.PI/4;
  });

  $('btn-rot-auto')?.addEventListener('click',e=>{
    e.stopPropagation();
    autoSpin=!autoSpin;
    updateAutoSpinUI();
  });

  $('btn-rot-reset')?.addEventListener('click',e=>{
    e.stopPropagation();
    autoSpin=false;
    updateAutoSpinUI();
    yawTarget=currentMode==='technician'?-0.32:0;
    pitchTarget=currentMode==='technician'?0.08:0;
  });

  s.setAttribute('tabindex','0');
  s.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'){yawTarget+=0.2;autoSpin=false;updateAutoSpinUI();}
    else if(e.key==='ArrowRight'){yawTarget-=0.2;autoSpin=false;updateAutoSpinUI();}
    else if(e.key==='ArrowUp'){pitchTarget=Math.min(pitchTarget+0.1,0.75);}
    else if(e.key==='ArrowDown'){pitchTarget=Math.max(pitchTarget-0.1,-0.45);}
    else if(e.key==='Home'||e.key==='r'){yawTarget=currentMode==='technician'?-0.32:0;pitchTarget=currentMode==='technician'?0.08:0;autoSpin=false;updateAutoSpinUI();}
    else if(e.key==='Escape'){if(copier&&copier.parts)copier.parts.forEach(pt=>{if(pt.userOffset)pt.userOffset.set(0,0,0)});}
  });
}

function frame(ms){
  requestAnimationFrame(frame);
  const dt=Math.min((ms-last)/1000||.016,.05);
  last=ms;
  if(document.hidden||!visible)return;

  if(autoSpin&&!isDragging&&!isDraggingPart){
    yawTarget+=dt*0.45;
  }
  yaw=T.MathUtils.lerp(yaw,yawTarget,1-Math.exp(-dt*9));
  pitch=T.MathUtils.lerp(pitch,pitchTarget,1-Math.exp(-dt*9));

  if(currentMode==='technician'){
    // Reset scroll explosion to 0 so machine is fully assembled
    p=0;
    poseParts(copier.parts,0,0,false);
    if(techPlaying){
      techProgress=(techProgress+dt*0.08)%1.0;
    }
    animateTechnicianService(technician,copier,techAction,techProgress,ms/1000);
    updateTechHUD(techProgress);
    shadow.material.opacity=0.95;
  }else{
    // Normal Exploded 3D view driven by scroll
    p=reduced?target:T.MathUtils.lerp(p,target,1-Math.exp(-dt*9));
    if(Math.abs(p-target)<.00001)p=target;
    poseParts(copier.parts,reduced?0:p,p*16,!reduced);
    const curExpl=explosionAt(reduced?0:p);
    if(copier&&copier.parts){
      for(let i=0;i<copier.parts.length;i++){
        const pt=copier.parts[i];
        if(!pt.userOffset)pt.userOffset=new T.Vector3(0,0,0);
        if(curExpl<0.08&&pt.userOffset.lengthSq()>0.00001){
          pt.userOffset.lerp(new T.Vector3(0,0,0),1-Math.exp(-dt*6));
          if(pt.userOffset.lengthSq()<0.0001)pt.userOffset.set(0,0,0);
        }
        pt.g.position.add(pt.userOffset);
      }
    }
    shadow.material.opacity=1-.25*curExpl;
    ui();
  }

  positionCamera();
  renderer.render(scene,camera);
}

window.addEventListener('scroll',readScroll,{passive:true});
new ResizeObserver(resize).observe(stage);
new IntersectionObserver(e=>{visible=e[0].isIntersecting},{rootMargin:'100px'}).observe(section);
$('motion').addEventListener('click',()=>{reduced=!reduced;motionUI()});
mq.addEventListener('change',e=>{reduced=e.matches;motionUI()});
$('scene').addEventListener('webglcontextlost',e=>{e.preventDefault();$('fallback').hidden=false;});
$('scene').addEventListener('webglcontextrestored',()=>location.reload());

try{setup()}catch(e){console.error('3D initialization failed',e);$('loader').hidden=true;$('fallback').hidden=false;}
