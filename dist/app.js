import * as T from './vendor/three.module.js';
import {buildCopier,poseParts,explosionAt} from './model.js';
import {buildTechnician,animateTechnicianService,SERVICE_ACTIONS} from './technician.js';

const $=id=>document.getElementById(id), stage=$('stage'), section=$('experience'), range=$('progress');
let renderer,scene,camera,copier,technician,shadow,ground,p=0,target=0,last=0,visible=true,yaw=0,yawTarget=0,pitch=0,pitchTarget=0,chapter=-1;
let currentMode='explode'; // 'explode' | 'technician'
let techAction='all'; // 'all' (Full copier teardown & reassembly) | 'toner' | 'roller' | 'cassette' | 'scanner'
let techProgress=0.0;
let techPlaying=true;
let techZoom=false;
let techLastStepIdx=-1;
let screenCanvas, screenCtx, screenTex;
let soundEnabled=true;
let audioCtx=null;
let lastLockSoundStep=-1;

// Web Audio API Synthesizer for tactile feedback
function getAudioContext(){
  if(!audioCtx&&typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext)){
    const AudioCtx=window.AudioContext||window.webkitAudioContext;
    audioCtx=new AudioCtx();
  }
  if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();
  return audioCtx;
}

function playMechanicalSound(type='snap'){
  if(!soundEnabled)return;
  try{
    const ctx=getAudioContext();
    if(!ctx)return;
    const now=ctx.currentTime;
    if(type==='snap'){
      const osc=ctx.createOscillator();
      const gain=ctx.createGain();
      osc.type='triangle';
      osc.frequency.setValueAtTime(920,now);
      osc.frequency.exponentialRampToValueAtTime(160,now+0.08);
      gain.gain.setValueAtTime(0.24,now);
      gain.gain.exponentialRampToValueAtTime(0.001,now+0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now+0.09);

      const click=ctx.createOscillator();
      const clickGain=ctx.createGain();
      click.type='sine';
      click.frequency.setValueAtTime(2800,now);
      click.frequency.exponentialRampToValueAtTime(500,now+0.025);
      clickGain.gain.setValueAtTime(0.35,now);
      clickGain.gain.exponentialRampToValueAtTime(0.001,now+0.03);
      click.connect(clickGain);
      clickGain.connect(ctx.destination);
      click.start(now);
      click.stop(now+0.03);
    }
  }catch(_){}
}

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

  if(technician&&technician.activePart){
    const phaseTextEl=$('tech-phase-text');
    if(phaseTextEl)phaseTextEl.textContent=technician.activePart.phase;
    const phaseSubEl=$('tech-phase-sub')||$('tech-phase-hi');
    if(phaseSubEl)phaseSubEl.textContent='[OEM PROCEDURE]';
  }

  if(stepIdx!==techLastStepIdx){
    techLastStepIdx=stepIdx;
    const pill=$('tech-step-pill');
    if(pill)pill.textContent=`PART ${stepIdx+1} OF ${action.steps.length}`;
    const categoryEl=$('tech-step-category');
    if(categoryEl)categoryEl.textContent=action.tag||'SERVICE SIMULATION';
    const title=$('tech-step-title');
    if(title)title.textContent=currentStep.title;
    const subEl=$('tech-step-sub')||$('tech-step-hi');
    if(subEl)subEl.textContent=currentStep.partTitle||currentStep.partName||'OEM Component';
    const specText=$('tech-spec-text');
    if(specText)specText.textContent=currentStep.spec||'OEM CERTIFIED PROCEDURE';
    const desc=$('tech-step-desc');
    if(desc)desc.textContent=currentStep.desc;

    document.querySelectorAll('.tech-dot').forEach((d,idx)=>{
      d.classList.toggle('active',idx===stepIdx);
    });

    // Dynamic copier LCD screen updates based on current servicing step
    if(techAction==='all'){
      if(stepIdx===0)drawCopierScreen('ADF Service','Feeder Hinge Tested','#f59e0b','Standby');
      else if(stepIdx===1)drawCopierScreen('Optical Scanner','600 DPI CCD Cleaned','#3b82f6','95%');
      else if(stepIdx===2)drawCopierScreen('Touch Interface','Flex Harness Docked','#3b82f6','OK');
      else if(stepIdx===3)drawCopierScreen('Front Service Door','Bay Access Open','#ef4444','Door Open');
      else if(stepIdx===4)drawCopierScreen('CMYK Toners','All 4 Bays Locked 100%','#22c55e','100%');
      else if(stepIdx===5)drawCopierScreen('Fuser Unit','200°C Heat Sleeve Verified','#22c55e','100%');
      else if(stepIdx===6)drawCopierScreen('Drive Train','60 RPM Gear Mesh OK','#22c55e','100%');
      else if(stepIdx===7)drawCopierScreen('Dual Trays','1,000 Sheets Loaded','#22c55e','100%');
      else drawCopierScreen('Ready to Print','All 19 Parts Verified','#22c55e','100%');
    }else if(techAction==='toner'){
      if(prog<0.18)drawCopierScreen('Service in Progress','Opening front cover','#f59e0b','12%');
      else if(prog<0.36)drawCopierScreen('Cyan Refilled','Bay C Locked 100%','#3b82f6','25%');
      else if(prog<0.54)drawCopierScreen('Magenta Refilled','Bay M Locked 100%','#ec4899','50%');
      else if(prog<0.72)drawCopierScreen('Yellow Refilled','Bay Y Locked 100%','#eab308','75%');
      else if(prog<0.88)drawCopierScreen('Black Refilled','Bay K Locked 100%','#18181b','100%');
      else drawCopierScreen('Ready to Print','CMYK Full Calibrated','#22c55e','100%');
    }else if(techAction==='roller'){
      drawCopierScreen('Maintenance Mode','Drive Mesh & Fuser 100%','#22c55e','100%');
    }else if(techAction==='cassette'){
      drawCopierScreen('Cassettes Ready','Trays 1 & 2 Loaded 1000 Sh','#22c55e','100%');
    }else if(techAction==='scanner'){
      drawCopierScreen('Optical Ready','600 DPI Optical Bed OK','#22c55e','100%');
    }
  }
}

// Build and populate the Technical Parts Directory Drawer
function initSpecsDrawer(){
  const list=$('specs-drawer-list');
  if(!list)return;
  const partsData=[
    {name:'Automatic Document Feeder (ADF)',category:'Optics & Feeder Unit',code:'CP-ADF-9400-HD',spec:'80 PPM Dual-Scan, Optical Borosilicate Guide, 100-Sheet Capacity',material:'Reinforced Polycarbonate + Dual Inversion Rollers',latch:'Dual Quick-Release Hinge Damper Pins'},
    {name:'Optical Platen Glass & Scanner Bed',category:'Optical Scanning Assembly',code:'CP-SCN-6000-GL',spec:'600×600 DPI Optical CCD, First-Surface Mirrors, Dual LED Exposures',material:'Tempered Float Glass + Precision Aluminum Carriage',latch:'Vibration-Isolated Dampers & Front Locking Lugs'},
    {name:'Smart Touch Screen Operator UI',category:'Control Interface Electronics',code:'CP-DSP-1010-UI',spec:'10.1" WSVGA Color Touchscreen, Emergency Stop Interlock, Flex Ribbon Cable',material:'Capacitive Multi-Touch Glass + Flame-Retardant ABS',latch:'Articulated Swivel Joint Bracket with Snap Clips'},
    {name:'Front Magnetic Service Door',category:'Access Enclosure',code:'CP-DR-5200-FR',spec:'Dust-Proof Seal, Neoprene Gaskets, Dual Magnetic Safety Interlock Switches',material:'Impact-Resistant Polycarbonate Enclosure',latch:'Left Heavy-Duty Pivot Pins & Magnetic Safety Interlock'},
    {name:'Cyan Toner Cartridge (C)',category:'Cyan Imaging Consumable',code:'CP-TN-8800-CYAN',spec:'45,000 Pages @ 5% A4, Micro-Polymer Cyan Toner, RFID Lock Authentication',material:'Engineered Polymer Bottle + Optical Level Prisms',latch:'Precision Dual Guide Rails with Positive Cam-Lock Lever'},
    {name:'Magenta Toner Cartridge (M)',category:'Magenta Imaging Consumable',code:'CP-TN-8800-MAG',spec:'45,000 Pages @ 5% A4, Micro-Polymer Magenta Toner, RFID Lock Authentication',material:'Engineered Polymer Bottle + Optical Level Prisms',latch:'Precision Dual Guide Rails with Positive Cam-Lock Lever'},
    {name:'Yellow Toner Cartridge (Y)',category:'Yellow Imaging Consumable',code:'CP-TN-8800-YEL',spec:'45,000 Pages @ 5% A4, Micro-Polymer Yellow Toner, RFID Lock Authentication',material:'Engineered Polymer Bottle + Optical Level Prisms',latch:'Precision Dual Guide Rails with Positive Cam-Lock Lever'},
    {name:'High-Yield Black Toner (K)',category:'Monochrome Imaging Consumable',code:'CP-TN-8800-BLK',spec:'65,000 Pages @ 5% A4, Ultra-Dense Carbon Micro-Toner, RFID Chip Authenticated',material:'High-Capacity Polymer Bottle + Agitator Shaft',latch:'Precision Dual Guide Rails with Positive Cam-Lock Lever'},
    {name:'Heated Transfer & Fuser Rollers',category:'Thermal Fixing Assembly',code:'CP-FUS-2200-HT',spec:'200°C Heat Resistance, 100,000 Continuous Pages, Built-in Thermistor Sensors',material:'Non-Stick Fluoropolymer Sleeve + Silicone Core + Steel Shaft',latch:'Dual Thermal Cam Locks & High-Temp Spring Retainers'},
    {name:'Precision Drive Gear Transmission',category:'Mechanical Powertrain',code:'CP-GR-4402-DRV',spec:'14T / 12T / 10T Helical & Spur Gear Cluster, Zero Backlash Tolerance, 60 RPM Rated',material:'High-Torque POM Delrin + Sintered Steel Drive Hubs',latch:'Flanged Spline Shaft with Radial Retaining C-Clips'},
    {name:'Paper Cassette Tray 1 & Tray 2',category:'Media Feed Cassette System',code:'CP-CAS-5000-D1',spec:'Dual 500-Sheet Capacity, 60–256 gsm Support, Precision Adjustable Guides',material:'Reinforced Stamped Steel Sub-Chassis + Ball-Bearing Slides',latch:'Telescopic Heavy-Duty Slides with Magnetic Latching'},
    {name:'Rubber Pickup Rollers & Separation Pad',category:'Paper Transport Assembly',code:'CP-PK-1020-SET',spec:'Anti-Static Rubber Pickup Rings, Jam-Free Sheet Feed, Optical Level Detectors',material:'High-Friction EPDM Rubber + Polyurethane Separation Pad',latch:'Spring-Loaded Quick-Snap Spindle Shafts'}
  ];

  list.innerHTML=partsData.map((pt,i)=>`
    <div class="specs-part-item">
      <div class="specs-part-badge">
        <span class="specs-part-num">${String(i+1).padStart(2,'0')}</span>
        <span class="specs-part-code">${pt.code}</span>
      </div>
      <div class="specs-part-info">
        <h4>${pt.name}</h4>
        <div class="specs-part-sub">${pt.category}</div>
        <p class="specs-part-spec">${pt.spec}</p>
        <div class="specs-part-tags">
          <span>📦 <b>Material:</b> ${pt.material}</span>
          <span>🔒 <b>Mounting:</b> ${pt.latch}</span>
        </div>
      </div>
    </div>
  `).join('');
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

  const floatingTag=$('tech-floating-tag');
  if(floatingTag&&!isTech)floatingTag.hidden=true;

  const annotations=$('annotations');
  if(annotations)annotations.hidden=isTech;

  const sceneControls=document.querySelector('.scene-controls');
  if(sceneControls)sceneControls.style.opacity=isTech?'0.25':'1';

  if(technician){
    technician.root.visible=isTech;
    if(technician.caddy) technician.caddy.visible=isTech;
    if(technician.snapRing) technician.snapRing.visible=false;
  }

  if(isTech){
    if(copier&&copier.parts){
      copier.parts.forEach(pt=>{
        if(pt.userOffset)pt.userOffset.set(0,0,0);
      });
    }
    techProgress=0.0;
    techPlaying=true;
    yawTarget=-0.28;
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
  resize();
  positionCamera();
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
    positionCamera();
  });

  // Sound toggle button
  $('tech-hud-sound')?.addEventListener('click',()=>{
    soundEnabled=!soundEnabled;
    const btn=$('tech-hud-sound');
    if(btn){
      btn.textContent=soundEnabled?'🔊':'🔇';
      btn.title=soundEnabled?'Sound FX Enabled':'Sound FX Muted';
    }
    if(soundEnabled)playMechanicalSound('snap');
  });

  // Specs Directory Drawer toggle
  $('tech-btn-specs')?.addEventListener('click',()=>{
    const drawer=$('tech-specs-drawer');
    if(drawer){
      const isHidden=drawer.hidden;
      drawer.hidden=!isHidden;
      $('tech-btn-specs')?.classList.toggle('active',!drawer.hidden);
    }
  });
  $('specs-drawer-close')?.addEventListener('click',()=>{
    const drawer=$('tech-specs-drawer');
    if(drawer){
      drawer.hidden=true;
      $('tech-btn-specs')?.classList.remove('active');
    }
  });

  // Previous Part button
  $('tech-btn-prev')?.addEventListener('click',()=>{
    const action=SERVICE_ACTIONS[techAction];
    if(!action)return;
    let curIdx=0;
    for(let i=0;i<action.steps.length;i++){
      if(techProgress>=action.steps[i].start&&techProgress<=action.steps[i].end){
        curIdx=i;break;
      }
    }
    const prevIdx=Math.max(0,curIdx-1);
    techProgress=action.steps[prevIdx].start+0.005;
    techPlaying=false;
    updatePlayButtonUI();
  });

  // Next Part button
  $('tech-btn-next')?.addEventListener('click',()=>{
    const action=SERVICE_ACTIONS[techAction];
    if(!action)return;
    let curIdx=0;
    for(let i=0;i<action.steps.length;i++){
      if(techProgress>=action.steps[i].start&&techProgress<=action.steps[i].end){
        curIdx=i;break;
      }
    }
    const nextIdx=Math.min(action.steps.length-1,curIdx+1);
    techProgress=action.steps[nextIdx].start+0.005;
    techPlaying=false;
    updatePlayButtonUI();
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

  initSpecsDrawer();
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
  if(technician.caddy) scene.add(technician.caddy);
  if(technician.snapRing) scene.add(technician.snapRing);
  technician.root.visible=false; // hidden by default until technician mode activated
  if(technician.caddy) technician.caddy.visible=false;

  resize();
  $('loader').hidden=true;
  readScroll();
  motionUI();
  initRotateControls();
  initModeAndTechControls();
  const urlParams = new URLSearchParams(window.location.search);
  if(urlParams.get('mode') === 'technician') {
    setExperienceMode('technician');
    const act = urlParams.get('action');
    if(act && SERVICE_ACTIONS[act]) {
      techAction = act;
      updateTechTaskUI();
    }
    if(urlParams.get('p')) {
      techProgress = parseFloat(urlParams.get('p'));
    }
    if(urlParams.get('pause') === '1') {
      techPlaying = false;
      updatePlayButtonUI();
    }
  }
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
  const isMobile=window.innerWidth<=768;

  if(currentMode==='technician'){
    let targetLookY = 2.25;
    let targetLookX = 0.35;
    if(technician && technician.activePart3DPos){
      targetLookY = 1.40 + technician.activePart3DPos.y * 0.35;
      targetLookX = 0.20 + technician.activePart3DPos.x * 0.25;
    }
    const cx=targetLookX;
    const cy=targetLookY;
    const cz=0.45;

    if(isMobile){
      const h=stage.clientHeight||(window.innerHeight-72);
      const aspect=camera.aspect||(stage.clientWidth/h);
      const hud=$('tech-hud-card');
      const isCompact=hud&&hud.classList.contains('is-compact');
      const topReserved=54;
      const bottomReserved=isCompact?110:248;
      const availH=Math.max(220,h-topReserved-bottomReserved);
      const targetScreenY=topReserved+availH*0.50;
      const stageCenterY=h*0.5;
      const pixelShiftUp=stageCenterY-targetScreenY;

      const targetModelPixels=availH*(techZoom?0.88:0.78);
      const pixelsPerUnit=targetModelPixels/(techZoom?3.2:4.8);
      const tanHalfFov=Math.tan(T.MathUtils.degToRad(camera.fov/2));

      let dist=(h/pixelsPerUnit)/(2*tanHalfFov);
      const distWidth=((techZoom?2.8:3.8)*1.16/aspect)/(2*tanHalfFov);
      dist=Math.max(dist,distWidth);
      if(techZoom)dist*=0.68;

      const actualPixelsPerUnit=h/(2*dist*tanHalfFov);
      const worldYShift=pixelShiftUp/actualPixelsPerUnit;
      const lookY=cy-worldYShift;
      const angle=0.40+yaw;
      const pitchFactor=techZoom?0.16:0.20;

      camera.position.set(cx+Math.sin(angle)*dist,lookY+dist*(pitchFactor+pitch),cz+Math.cos(angle)*dist);
      camera.lookAt(cx,lookY,cz);
      return;
    }

    const baseDist=techZoom?6.2:10.2;
    const scaleFactor=1.0;
    const dist=Math.max(baseDist,baseDist/camera.aspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*scaleFactor;
    const angle=0.40+yaw;
    camera.position.set(cx+Math.sin(angle)*dist,cy+dist*(0.20+pitch),cz+Math.cos(angle)*dist);
    camera.lookAt(cx,cy,cz);
    return;
  }

  const e=reduced?0:explosionAt(p),height=5.9+2.1*e,width=5.8+3.4*e;
  const baseScale=isMobile?0.92:1.0;
  const dist=Math.max(height,width/camera.aspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*baseScale;
  const angle=.52+yaw;
  const yShift=isMobile?(0.40*(1-e)):0;
  const lookY=2.25+e*.55-yShift;
  camera.position.set(Math.sin(angle)*dist,lookY+dist*(.32+pitch),Math.cos(angle)*dist);
  camera.lookAt(0,lookY,0);
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
      techProgress=(techProgress+dt*0.065)%1.0;
    }
    animateTechnicianService(technician,copier,techAction,techProgress,ms/1000);
    updateTechHUD(techProgress);
    shadow.material.opacity=0.95;

    // Positive Locking Sound trigger
    if(technician.justLocked && lastLockSoundStep !== techLastStepIdx){
      playMechanicalSound('snap');
      lastLockSoundStep = techLastStepIdx;
    } else if(!technician.justLocked && lastLockSoundStep === techLastStepIdx && technician.activePart && technician.activePart.localP < 0.85){
      lastLockSoundStep = -1;
    }

    // Realtime 3D Floating Tag projection
    const tag = $('tech-floating-tag');
    if(tag && technician.activePart){
      const p3d = technician.activePart3DPos.clone();
      const v = p3d.project(camera);
      if(v.z < 1.0){
        const sw = stage.clientWidth;
        const sh = stage.clientHeight;
        const x = Math.max(12, Math.min(sw - 200, (v.x * 0.5 + 0.5) * sw + 16));
        const y = Math.max(12, Math.min(sh - 50, (-v.y * 0.5 + 0.5) * sh - 30));
        tag.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        tag.hidden = false;
        const tTitle = $('tech-floating-title');
        const tPhase = $('tech-floating-phase');
        if(tTitle) tTitle.textContent = technician.activePart.title;
        if(tPhase) tPhase.textContent = technician.activePart.phase;
        tag.classList.toggle('is-locked', technician.justLocked);
      } else {
        tag.hidden = true;
      }
    }
  }else{
    const tag = $('tech-floating-tag');
    if(tag) tag.hidden = true;

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
