/* AXIOM — shared page behaviors (nav, reveal, cursor, cart badge) */
(function(){
"use strict";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = matchMedia("(pointer: coarse)").matches;

/* ---- Mobile nav ---- */
const navToggle=document.getElementById("navToggle"),navLinks=document.getElementById("navLinks");
if(navToggle&&navLinks){
  navToggle.addEventListener("click",()=>navLinks.classList.toggle("open"));
  navLinks.addEventListener("click",e=>{if(e.target.tagName==="A")navLinks.classList.remove("open")});
}

/* ---- Year ---- */
const yr=document.getElementById("yr");if(yr)yr.textContent=new Date().getFullYear();

/* ---- Catalogue count (hero meta), when data.js is present ---- */
const mc=document.getElementById("metaCount");
if(mc&&window.CATALOG)mc.textContent=window.CATALOG.reduce((n,c)=>n+c.items.length,0);

/* ---- Cart badge from persisted cart; on pages without the drawer, Cart goes to products ---- */
window.AX_CART_KEY="axiom_cart_v1";
window.axReadCart=function(){try{return JSON.parse(localStorage.getItem(window.AX_CART_KEY))||{};}catch(e){return {};}};
window.axBadge=function(){
  const entries=Object.values(window.axReadCart());
  const tq=entries.reduce((n,e)=>n+e.qty,0);
  const badge=document.getElementById("navCartCount"),zero=document.getElementById("cartZero");
  if(badge){badge.textContent=tq;badge.hidden=tq===0;}
  if(zero)zero.hidden=tq!==0;
};
window.axBadge();
const navCart=document.getElementById("navCart");
if(navCart&&!document.getElementById("quoteBar")){
  navCart.addEventListener("click",()=>{location.href="products.html#cart";});
}

/* ---- Reveal (with auto-stagger indices) ---- */
document.querySelectorAll(".stagger").forEach(s=>[...s.children].forEach((c,i)=>c.style.setProperty("--i",i)));
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target)}}),{threshold:.12});
document.querySelectorAll(".reveal, .rule-draw").forEach(el=>io.observe(el));
window.axReveal=el=>io.observe(el); // for content injected after this runs (catalog.js)

/* ---- Intro preloader (home only; once per session) ---- */
(function(){
  const pl=document.getElementById("preloader");if(!pl)return;
  let seen=false;try{seen=sessionStorage.getItem("axiom_intro")==="1";}catch(e){}
  if(reduce||seen){pl.classList.add("done");return;}
  try{sessionStorage.setItem("axiom_intro","1");}catch(e){}
  setTimeout(()=>pl.classList.add("done"),1650);
})();

/* ---- Custom cursor (fine pointers only) ---- */
if(!coarse&&!reduce){
  const ring=document.getElementById("cursorRing"),dot=document.getElementById("cursorDot");
  if(ring&&dot){
    let rx=innerWidth/2,ry=innerHeight/2,dx=rx,dy=ry,tx=rx,ty=ry,on=false;
    const hoverSel="a,button,input,select,textarea,summary,label,.tlink,.chip,.pcard,[data-add],[data-ref],.faq-q";
    addEventListener("mousemove",e=>{
      tx=e.clientX;ty=e.clientY;
      if(!on){on=true;document.body.classList.add("cursor-on");}
      const t=e.target.closest?.(hoverSel);
      ring.classList.toggle("hover",!!t);
    });
    addEventListener("mouseleave",()=>{on=false;document.body.classList.remove("cursor-on");});
    (function tick(){
      dx+=(tx-dx)*0.35;dy+=(ty-dy)*0.35;
      rx+=(tx-rx)*0.16;ry+=(ty-ry)*0.16;
      dot.style.transform=`translate(${dx}px,${dy}px)`;
      ring.style.transform=`translate(${rx}px,${ry}px)`;
      requestAnimationFrame(tick);
    })();
  }
}

/* ---- Magnetic hover (fine pointers only) ---- */
if(!coarse&&!reduce){
  const strength=0.32;
  document.querySelectorAll(".tlink, nav .navcart, .btn, .gate-actions a, .gate-actions button").forEach(el=>{
    el.addEventListener("mousemove",e=>{
      const r=el.getBoundingClientRect();
      const mx=e.clientX-(r.left+r.width/2),my=e.clientY-(r.top+r.height/2);
      el.style.transform=`translate(${mx*strength}px,${my*strength}px)`;
    });
    el.addEventListener("mouseleave",()=>{el.style.transform="";el.style.transition="transform .4s cubic-bezier(.16,1,.3,1)";setTimeout(()=>el.style.transition="",400);});
  });
}

/* ---- Scroll progress bar + hide-on-scroll nav ---- */
const bar=document.getElementById("progress"),nav=document.getElementById("nav");
let lastY=scrollY,ticking=false;
function onScroll(){
  if(ticking)return;ticking=true;
  requestAnimationFrame(()=>{
    const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
    if(bar)bar.style.width=(h>0?(y/h*100):0)+"%";
    if(nav){
      if(y>lastY&&y>240)nav.classList.add("nav-hidden");
      else nav.classList.remove("nav-hidden");
    }
    lastY=y;ticking=false;
  });
}
addEventListener("scroll",onScroll,{passive:true});onScroll();
})();
