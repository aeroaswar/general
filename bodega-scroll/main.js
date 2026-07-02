import * as THREE from 'three';

/* ============================================================
   Bodega — scroll-driven particle ecosystem
   The 3D scene morphs through 6 formations as you scroll and
   grades the palette per chapter:
   sphere(hero) → wave(work) → grid(services/why) →
   helix(process) → galaxy(roblox/proof) → orb(contact)
   ============================================================ */

const PAL = {
  paper:'#faf9f9', ink:'#181718',
  blue:'#2562e7', mint:'#01dcb4', pink:'#fa1e88', yellow:'#fae902',
};
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 760px)').matches;

// Brief form: leave '' to use the mailto fallback (works with no backend).
// To go live, paste a Formspree endpoint e.g. 'https://formspree.io/f/xxxxxx'
const FORM_ENDPOINT = '';
const FORM_EMAIL = 'creativestudiolabodega@gmail.com';

/* ---------- DATA ---------- */
const CLIENTS = ['Panasonic','Kemendagri','Astra Daihatsu','Hutama Karya','Maktour','SuperPadel','Lacoste Open','Kopikalyan','Dans Burgers','Hanau','Citra Borneo Utama','Airnesia','World','Merdeka Run','Konser Pandangan Pertama'];
const CHIP_COLORS = [PAL.blue,PAL.mint,PAL.pink,PAL.yellow];

const WORK = [
  {n:'Maktour', cat:'Travel', svc:['Social Media Handling'], img:'work_travel_maktour_1777220206409.png', g:`linear-gradient(150deg,${PAL.blue},#0a2f9e)`},
  {n:'Panasonic Indonesia', cat:'Consumer Electronics', svc:['Social','Community','Activation'], img:'work_panasonic_1777220223193.png', g:`linear-gradient(150deg,${PAL.mint},#066d8c)`},
  {n:'SuperPadel', cat:'Sports / App', svc:['Social','Activation'], img:'work_padel_1777220256318.png', g:`linear-gradient(150deg,${PAL.pink},#7a0f55)`},
  {n:'SEREUPNA Journey', cat:'Roblox Horror', svc:['In-Game Development'], img:'work_roblox_1777220240401.png', g:`linear-gradient(150deg,#2b2b3a,${PAL.blue})`},
  {n:'Kilometer Berdendang', cat:'Roblox Gen-Z Hangout', svc:['In-Game Development'], img:'work_roblox_1777220240401.png', g:`linear-gradient(150deg,${PAL.yellow},${PAL.pink})`},
  {n:'Lacoste Open Tournament', cat:'Padel Event', svc:['Brand','Activation','Event Mgmt'], img:'work_padel_1777220256318.png', g:`linear-gradient(150deg,${PAL.mint},${PAL.blue})`},
];

const SERVICES = [
  {t:'Branding & Identity', d:'Shaping brands to speak clearly, stand out visually, and grow strategically.', tags:['Logo & Identity','Visual System','Guidelines']},
  {t:'Marketing Strategy', d:'Audience-first strategy that turns business goals into a clear, executable plan.', tags:['Positioning','Go-to-Market','Funnels']},
  {t:'Brand Activation', d:'On-ground and online moments that make people feel the brand, not just see it.', tags:['Events','Experiential','Partnerships']},
  {t:'Web & App Development', d:'Fast, expressive sites and products built to convert and to last.', tags:['Web','App','Roblox']},
  {t:'Digital Marketing', d:'Performance and paid media tuned daily against real audience behavior.', tags:['Paid Media','SEO','Analytics']},
  {t:'Social Media Management & Content', d:'Daily content and community execution that compounds reach over time.', tags:['Content','Community','Production']},
];

const WHY = [
  {ic:'ph:users', t:'Distributed Team of Specialists', d:'Different backgrounds and cities, custom-built per project.', c:PAL.blue, ink:false},
  {ic:'ph:arrows-out', t:'Services You Can Scale', d:'Every service scales up or down by stage, goals, and budget.', c:PAL.mint, ink:false},
  {ic:'ph:tag', t:'Adjustable Pricing', d:'Pay for what brings value, not unnecessary add-ons.', c:PAL.pink, ink:false},
  {ic:'ph:magnifying-glass', t:'Research First', d:'Every solution starts with audience behavior, market, and culture.', c:PAL.yellow, ink:true},
];

const PROCESS = [
  {n:'01', t:'Real Bonding', d:'We listen, ask the right questions, and build real working chemistry.', c:PAL.blue},
  {n:'02', t:'Research & Deep Understanding', d:'We dig into your audience, competitors, data, and culture.', c:PAL.mint},
  {n:'03', t:'Strategy Development', d:'A strategic path that aligns with your goals.', c:PAL.pink},
  {n:'04', t:'Review & Alignment', d:'The solution reflects your voice, not just our imagination.', c:PAL.yellow},
  {n:'05', t:'Kick Off & Execution', d:"Once we're aligned, the real work begins.", c:PAL.blue},
];

const PROOF = [
  {to:2.9, dec:1, suffix:'M+', label:'accounts reached', meta:'Maktour · 6 months', c:PAL.blue},
  {to:205.6, dec:1, suffix:'%', label:'engagement rate growth', meta:'Panasonic', c:PAL.mint},
  {to:579.1, dec:1, suffix:'K', label:'views in 4 months', meta:'SuperPadel', c:PAL.pink},
  {to:611.7, dec:1, suffix:'K', label:'accounts reached', meta:'Insan Hutama · 6 months', c:PAL.yellow},
  {to:14, dec:0, suffix:'+', label:'industries served', meta:'and counting', c:PAL.ink},
];

/* ============================================================
   1. THREE.JS PARTICLE SCENE
   ============================================================ */
const canvas = document.getElementById('scene');
let renderer, scene, camera, points, geo, mat, curPos, forms;
let N = isMobile ? 4200 : 7200;
let lastMorphP = -1;

function fib(i, n){ // fibonacci sphere unit vector
  const phi = Math.acos(1 - 2*(i+0.5)/n);
  const theta = Math.PI*(1+Math.sqrt(5))*i;
  return [Math.cos(theta)*Math.sin(phi), Math.sin(theta)*Math.sin(phi), Math.cos(phi)];
}
const rand=(a,b)=>a+Math.random()*(b-a);

function buildForms(){
  const sphere=new Float32Array(N*3), wave=new Float32Array(N*3), grid=new Float32Array(N*3),
        helix=new Float32Array(N*3), galaxy=new Float32Array(N*3), orb=new Float32Array(N*3);
  // grid dims
  const gx=Math.round(Math.cbrt(N)*1.35), gy=Math.round(Math.cbrt(N)*0.7), gz=Math.ceil(N/(gx*gy));
  for(let i=0;i<N;i++){
    const o=i*3;
    // sphere
    const s=fib(i,N), R=3.1+Math.sin(i*12.9)*0.05;
    sphere[o]=s[0]*R; sphere[o+1]=s[1]*R; sphere[o+2]=s[2]*R;
    // wave / river field
    const wx=rand(-5.4,5.4), wz=rand(-2.6,2.6);
    wave[o]=wx; wave[o+1]=Math.sin(wx*1.0)*0.6+Math.cos(wz*1.3)*0.4 + rand(-0.1,0.1); wave[o+2]=wz;
    // grid lattice
    const ix=i%gx, iy=Math.floor(i/gx)%gy, iz=Math.floor(i/(gx*gy));
    grid[o]=(ix/(gx-1)-0.5)*6.6 + rand(-0.04,0.04);
    grid[o+1]=(iy/(gy-1)-0.5)*3.6 + rand(-0.04,0.04);
    grid[o+2]=(iz/Math.max(gz-1,1)-0.5)*3.0 + rand(-0.04,0.04);
    // helix (double strand)
    const a=i*0.26 + (i%2)*Math.PI, hy=(i/N-0.5)*7.0, hr=2.1+(i%2)*0.18;
    helix[o]=Math.cos(a)*hr; helix[o+1]=hy; helix[o+2]=Math.sin(a)*hr;
    // galaxy (spiral arms)
    const arms=4, br=i%arms, rr=Math.pow(Math.random(),0.62)*4.0, spin=rr*0.9;
    const ga=br/arms*Math.PI*2 + spin;
    galaxy[o]=Math.cos(ga)*rr + rand(-0.18,0.18);
    galaxy[o+1]=rand(-0.5,0.5)*(1-rr/5);
    galaxy[o+2]=Math.sin(ga)*rr + rand(-0.18,0.18);
    // orb (calm tight sphere)
    orb[o]=s[0]*1.7; orb[o+1]=s[1]*1.7; orb[o+2]=s[2]*1.7;
  }
  return [sphere,wave,grid,helix,galaxy,orb];
}

const VERT = `
uniform float uTime; uniform float uSize; uniform float uFocal; uniform float uDPR;
uniform float uChapterMix; uniform vec3 uChapterColor; uniform float uWob;
attribute vec3 aColor; attribute float aScale; attribute float aPhase; attribute float aWobble;
varying vec3 vColor; varying float vFade;
void main(){
  vec3 p = position;
  float t = uTime;
  p.x += sin(t*0.6 + aPhase)*aWobble*uWob;
  p.y += cos(t*0.5 + aPhase*1.3)*aWobble*uWob;
  p.z += sin(t*0.4 + aPhase*0.7)*aWobble*uWob;
  vec4 mv = modelViewMatrix * vec4(p,1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * uDPR * (uFocal / -mv.z);
  vColor = mix(aColor, uChapterColor, uChapterMix);
  vFade = clamp(1.0 - (-mv.z - 2.0)/15.0, 0.18, 1.0);
}`;
const FRAG = `
uniform float uOpacity; varying vec3 vColor; varying float vFade;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if(d>0.5) discard;
  float a = smoothstep(0.5,0.10,d);
  gl_FragColor = vec4(vColor, a*uOpacity*vFade);
}`;

function initThree(){
  renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x000000, 0);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 100);
  camera.position.set(0,0,7.4);

  forms = buildForms();
  curPos = new Float32Array(N*3);
  curPos.set(forms[0]);

  geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(curPos,3));
  const aColor=new Float32Array(N*3), aScale=new Float32Array(N), aPhase=new Float32Array(N), aWobble=new Float32Array(N);
  const accents=[new THREE.Color(PAL.blue),new THREE.Color(PAL.mint),new THREE.Color(PAL.pink),new THREE.Color(PAL.yellow)];
  for(let i=0;i<N;i++){
    const col=accents[i%4].clone().offsetHSL(rand(-0.02,0.02),0,rand(-0.05,0.05));
    aColor[i*3]=col.r; aColor[i*3+1]=col.g; aColor[i*3+2]=col.b;
    aScale[i]=rand(0.6,1.7);
    aPhase[i]=rand(0,Math.PI*2);
    aWobble[i]=rand(0.02,0.09);
  }
  geo.setAttribute('aColor', new THREE.BufferAttribute(aColor,3));
  geo.setAttribute('aScale', new THREE.BufferAttribute(aScale,1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(aPhase,1));
  geo.setAttribute('aWobble', new THREE.BufferAttribute(aWobble,1));

  mat = new THREE.ShaderMaterial({
    uniforms:{
      uTime:{value:0}, uSize:{value:isMobile?2.3:2.7}, uFocal:{value:7.4},
      uDPR:{value:Math.min(window.devicePixelRatio,2)},
      uOpacity:{value:0.82}, uChapterMix:{value:0.34},
      uChapterColor:{value:new THREE.Color(PAL.blue)}, uWob:{value:reduced?0:1},
    },
    vertexShader:VERT, fragmentShader:FRAG,
    transparent:true, depthWrite:false, blending:THREE.NormalBlending,
  });
  points = new THREE.Points(geo, mat);
  scene.add(points);
}

/* palette cycle: blue → mint → pink → yellow → blue */
const _cols=[new THREE.Color(PAL.blue),new THREE.Color(PAL.mint),new THREE.Color(PAL.pink),new THREE.Color(PAL.yellow),new THREE.Color(PAL.blue)];
const _tmp=new THREE.Color();
function paletteAt(p){
  const f=p*(_cols.length-1), i=Math.min(Math.floor(f),_cols.length-2), t=f-i;
  return _tmp.copy(_cols[i]).lerp(_cols[i+1], t*t*(3-2*t));
}
function morph(p){
  if(Math.abs(p-lastMorphP)<0.0008) return;
  lastMorphP=p;
  const K=forms.length;
  let f=p*(K-1); let i0=Math.min(Math.floor(f),K-1); let i1=Math.min(i0+1,K-1);
  let t=f-i0; t=t*t*(3-2*t);
  const A=forms[i0], B=forms[i1];
  for(let i=0;i<N*3;i++) curPos[i]=A[i]+(B[i]-A[i])*t;
  geo.attributes.position.needsUpdate=true;
}

/* ---------- scroll progress + render loop ---------- */
let targetP=0, curP=0, mouseX=0, mouseY=0, tMouseX=0, tMouseY=0, running=true, clock;
const glowEl=document.getElementById('glow');
const railFill=document.getElementById('rail-fill');
const brandDots=document.querySelectorAll('.brand-dot');
let lastHex='';

function scrollProgress(){
  const h=document.documentElement.scrollHeight-innerHeight;
  return h>0 ? Math.min(Math.max(window.scrollY/h,0),1) : 0;
}
function loop(){
  if(!running) return;
  requestAnimationFrame(loop);
  const t=clock.getElapsedTime();
  targetP=scrollProgress();
  curP += (targetP-curP)*(reduced?1:0.08);
  const p=curP;

  morph(p);
  const col=paletteAt(p);
  mat.uniforms.uChapterColor.value.copy(col);
  mat.uniforms.uTime.value=t;

  // camera dolly + parallax
  tMouseX += (mouseX-tMouseX)*0.05; tMouseY += (mouseY-tMouseY)*0.05;
  const dolly = 7.4 - Math.sin(p*Math.PI)*1.1;
  camera.position.x = tMouseX*0.8;
  camera.position.y = -tMouseY*0.5;
  camera.position.z = dolly;
  camera.lookAt(0,0,0);
  if(!reduced){
    points.rotation.y = t*0.04 + p*Math.PI*0.6 + tMouseX*0.25;
    points.rotation.x = tMouseY*0.15 + Math.sin(p*Math.PI*2)*0.06;
  } else {
    points.rotation.y = p*Math.PI*0.6;
  }
  renderer.render(scene,camera);

  // dom grading
  const hex='#'+col.getHexString();
  if(hex!==lastHex){
    lastHex=hex;
    document.documentElement.style.setProperty('--glow',hex);
    brandDots.forEach(d=>d.style.background=hex);
  }
  if(railFill) railFill.style.transform=`scaleX(${targetP})`;
}

function onResize(){
  if(!renderer) return;
  renderer.setSize(innerWidth,innerHeight);
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
  mat.uniforms.uDPR.value=Math.min(window.devicePixelRatio,2);
}

/* ============================================================
   2. BUILD DOM CONTENT
   ============================================================ */
function buildMarquee(){
  const a=document.getElementById('mqA'), b=document.getElementById('mqB');
  const make=(name,i)=>`<span class="chip"><i style="background:${CHIP_COLORS[i%4]}"></i>${name}</span>`;
  const rowA=CLIENTS.map(make).join(''); const rowB=[...CLIENTS].reverse().map(make).join('');
  a.innerHTML=rowA+rowA; b.innerHTML=rowB+rowB;
}
function buildWork(){
  document.getElementById('workGrid').innerHTML = WORK.map((w,i)=>`
    <article class="work-card reveal" style="--cg:${w.g}">
      <img class="wc-img" src="assets/${w.img}" alt="${w.n}" loading="lazy" decoding="async" />
      <div class="wc-top">
        <span class="wc-index">${String(i+1).padStart(2,'0')} / ${w.cat}</span>
        <span class="wc-go"><iconify-icon icon="ph:arrow-up-right"></iconify-icon></span>
      </div>
      <h3>${w.n}</h3>
      <div class="wc-tags">${w.svc.map(s=>`<span class="wc-tag">${s}</span>`).join('')}</div>
    </article>`).join('');
}
function buildAccordion(){
  document.getElementById('accordion').innerHTML = SERVICES.map((s,i)=>`
    <div class="acc-item${i===0?' open':''}">
      <button class="acc-head" aria-expanded="${i===0}">
        <span class="acc-num">${String(i+1).padStart(2,'0')}</span>
        <span class="acc-title">${s.t}</span>
        <span class="acc-toggle"><iconify-icon icon="ph:plus"></iconify-icon></span>
      </button>
      <div class="acc-body"><div class="acc-body-inner">
        <p>${s.d}</p>
        <div class="acc-tags">${s.tags.map(t=>`<span>${t}</span>`).join('')}</div>
      </div></div>
    </div>`).join('');
}
function buildWhy(){
  document.getElementById('whyGrid').innerHTML = WHY.map((w,i)=>`
    <div class="why-card reveal">
      <span class="why-num">0${i+1}</span>
      <span class="why-ic" style="background:${w.c};color:${w.ink?PAL.ink:'#fff'}"><iconify-icon icon="${w.ic}"></iconify-icon></span>
      <h3>${w.t}</h3><p>${w.d}</p>
    </div>`).join('');
}
function buildSteps(){
  document.getElementById('steps').innerHTML = PROCESS.map(s=>`
    <div class="step reveal">
      <span class="step-num">${s.n}</span>
      <div class="step-body"><h3>${s.t}<span class="step-dot" style="background:${s.c}"></span></h3><p>${s.d}</p></div>
    </div>`).join('');
}
function buildProof(){
  document.getElementById('proofGrid').innerHTML = PROOF.map(p=>`
    <div class="proof-card reveal">
      <div class="proof-num" data-to="${p.to}" data-dec="${p.dec}" data-suffix="${p.suffix}" style="color:${p.c===PAL.ink?PAL.ink:p.c}">0${p.suffix}</div>
      <div class="proof-label">${p.label}</div>
      <div class="proof-meta">${p.meta}</div>
      <span class="proof-bar" style="background:${p.c}"></span>
    </div>`).join('');
}

/* ============================================================
   3. GSAP SCROLL REVEALS + COUNT-UPS + INTERACTIONS
   ============================================================ */
function initGSAP(){
  const {gsap}=window;
  gsap.registerPlugin(window.ScrollTrigger);

  // generic reveals
  gsap.utils.toArray('.reveal').forEach(el=>{
    window.ScrollTrigger.create({
      trigger:el, start:'top 88%',
      onEnter:()=>el.classList.add('in'),
    });
  });
  // hero title (immediate)
  document.querySelector('.hero-title').classList.add('in');

  // count-ups
  gsap.utils.toArray('.proof-num').forEach(el=>{
    const to=parseFloat(el.dataset.to), dec=parseInt(el.dataset.dec), suf=el.dataset.suffix;
    const fmt=v=>{
      let s = dec>0 ? v.toFixed(dec) : Math.round(v).toString();
      return s+suf;
    };
    window.ScrollTrigger.create({
      trigger:el, start:'top 90%', once:true,
      onEnter:()=>{
        if(reduced){ el.textContent=fmt(to); return; }
        const o={v:0};
        gsap.to(o,{v:to,duration:1.6,ease:'power2.out',onUpdate:()=>el.textContent=fmt(o.v)});
      }
    });
  });
  // proof bars
  gsap.utils.toArray('.proof-card').forEach(c=>{
    window.ScrollTrigger.create({trigger:c,start:'top 86%',onEnter:()=>c.classList.add('in')});
  });
}

/* accordion */
function initAccordion(){
  const acc=document.getElementById('accordion');
  const setH=(item,open)=>{
    const body=item.querySelector('.acc-body');
    const inner=item.querySelector('.acc-body-inner');
    body.style.height = open ? inner.offsetHeight+'px' : '0px';
  };
  // open first
  acc.querySelectorAll('.acc-item').forEach(it=>setH(it, it.classList.contains('open')));
  acc.addEventListener('click', e=>{
    const head=e.target.closest('.acc-head'); if(!head) return;
    const item=head.parentElement; const isOpen=item.classList.contains('open');
    acc.querySelectorAll('.acc-item').forEach(it=>{
      if(it!==item){ it.classList.remove('open'); it.querySelector('.acc-head').setAttribute('aria-expanded','false'); setH(it,false);
        it.querySelector('.acc-toggle iconify-icon').setAttribute('icon','ph:plus'); }
    });
    item.classList.toggle('open', !isOpen);
    head.setAttribute('aria-expanded', String(!isOpen));
    item.querySelector('.acc-toggle iconify-icon').setAttribute('icon', !isOpen?'ph:minus':'ph:plus');
    setH(item, !isOpen);
  });
  window.addEventListener('resize', ()=>acc.querySelectorAll('.acc-item.open').forEach(it=>setH(it,true)));
}

/* nav + menu + form */
function initUI(){
  const nav=document.getElementById('nav');
  const onScroll=()=>nav.classList.toggle('scrolled', window.scrollY>40);
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  const toggle=document.getElementById('menuToggle');
  const links=document.getElementById('navlinks');
  const icon=document.getElementById('menuIcon');
  const close=()=>{links.classList.remove('open');document.body.classList.remove('mobile-open');toggle.setAttribute('aria-expanded','false');icon.setAttribute('icon','ph:list');};
  toggle.addEventListener('click',()=>{
    const open=links.classList.toggle('open');
    document.body.classList.toggle('mobile-open',open);
    toggle.setAttribute('aria-expanded',String(open));
    icon.setAttribute('icon', open?'ph:x':'ph:list');
  });
  links.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));

  // play button pulse → no-op (placeholder media)
  const media=document.getElementById('robloxMedia');
  media?.addEventListener('click',()=>media.classList.add('played'));

  // form
  const form=document.getElementById('briefForm');
  const note=document.getElementById('formNote');
  const submitBtn=form?.querySelector('button[type=submit]');
  form?.addEventListener('submit', async e=>{
    e.preventDefault();
    const data=Object.fromEntries(new FormData(form).entries());
    // validate required fields
    let ok=true;
    [['name','f-name'],['brand','f-brand']].forEach(([k,id])=>{
      const el=document.getElementById(id); const valid=!!(data[k]&&data[k].trim());
      el.style.borderColor = valid ? '' : PAL.pink; if(!valid) ok=false;
    });
    if(!ok){ note.hidden=false; note.style.color=PAL.pink; note.textContent='Please add your name and brand.'; return; }
    note.style.color='';
    const original=submitBtn.textContent; submitBtn.disabled=true; submitBtn.textContent='Sending…';
    try{
      if(FORM_ENDPOINT){
        const res=await fetch(FORM_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)});
        if(!res.ok) throw new Error('status '+res.status);
      } else {
        const subject=encodeURIComponent(`New brief — ${data.brand} (${data.type||'General'})`);
        const body=encodeURIComponent(`Name: ${data.name}\nBrand / Company: ${data.brand}\nProject Type: ${data.type||''}\n\nBrief:\n${data.brief||''}`);
        window.location.href=`mailto:${FORM_EMAIL}?subject=${subject}&body=${body}`;
      }
      note.hidden=false; note.textContent="Thanks — your brief is in. We'll reply within one working day.";
      submitBtn.textContent='Sent ✓'; form.reset();
    }catch(err){
      note.hidden=false; note.style.color=PAL.pink;
      note.textContent=`Could not send right now — email ${FORM_EMAIL} directly.`;
      submitBtn.textContent=original; submitBtn.disabled=false;
    }
  });
}

/* mouse parallax */
function initMouse(){
  if(reduced) return;
  window.addEventListener('pointermove', e=>{
    mouseX=(e.clientX/innerWidth-0.5)*2;
    mouseY=(e.clientY/innerHeight-0.5)*2;
  }, {passive:true});
}

/* ?cap=<0..1 | section-id> capture mode for deterministic screenshots */
function handleCap(){
  const m=new URLSearchParams(location.search).get('cap');
  if(m==null) return;
  document.documentElement.classList.add('cap-mode');
  const asNum=parseFloat(m);
  setTimeout(()=>{
    if(!isNaN(asNum) && String(asNum)===m){
      const h=document.documentElement.scrollHeight-innerHeight;
      window.scrollTo(0, asNum*h);
    } else {
      document.getElementById(m)?.scrollIntoView();
    }
  }, 300);
}

/* ============================================================
   4. BOOT
   ============================================================ */
function boot(){
  buildMarquee(); buildWork(); buildAccordion(); buildWhy(); buildSteps(); buildProof();
  try{ initThree(); clock=new THREE.Clock(); loop(); }
  catch(err){ console.warn('WebGL scene unavailable:', err); canvas.style.display='none'; }
  initGSAP(); initAccordion(); initUI(); initMouse(); handleCap();
  window.addEventListener('resize', onResize, {passive:true});

  // debug handle (house convention)
  window.__bodega={
    goto(p){ const h=document.documentElement.scrollHeight-innerHeight; window.scrollTo({top:p*h,behavior:'auto'}); },
    get progress(){return curP;},
    pause(){running=false;}, play(){if(!running){running=true;loop();}},
    scene:()=>({scene,camera,points}),
  };
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
else boot();
