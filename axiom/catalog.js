/* AXIOM — products page: card catalogue, filters, persistent cart, reference drawer, gate */
(function(){
"use strict";
const fmt = n => n == null ? "N/A" : new Intl.NumberFormat("id-ID").format(n);
const CAT = window.CATALOG;

/* Filter chips */
const filters=document.getElementById("filters");
CAT.forEach(c=>{
  const b=document.createElement("button");
  b.className="chip";b.dataset.cat=c.id;
  b.textContent=c.name.split(" & ")[0].split(",")[0];
  filters.appendChild(b);
});

/* Item registry */
const ITEMS={};
const TOTAL=CAT.reduce((n,c)=>n+c.items.length,0);
const PRICES=CAT.flatMap(c=>c.items.map(i=>i.price)).filter(p=>p!=null);
const PMIN=Math.min(...PRICES),PMAX=Math.max(...PRICES);

/* Card grid */
const list=document.getElementById("catList");
CAT.forEach(c=>{
  const short=c.name.split(" & ")[0].split(",")[0];
  const cards=c.items.map((it,i)=>{
    const id=`${c.id}-${i}`;
    ITEMS[id]={id,name:it.name,dose:it.dose,price:it.price,cat:c.id};
    const priceHtml=it.price==null?'<span class="pcard-price na">On request</span>':`<span class="pcard-price"><span class="cur">Rp</span>${fmt(it.price)}</span>`;
    return `
    <article class="pcard" data-id="${id}" data-name="${(it.name+' '+it.dose).toLowerCase()}" data-idx="${i}" data-price="${it.price==null?'':it.price}">
      <div class="pcard-top">
        <span class="pcard-tag">${short}</span>
        <span class="pcard-idx">${c.no}·${String(i+1).padStart(2,'0')}</span>
      </div>
      <h4 class="pcard-name">${it.name}</h4>
      ${it.dose?`<span class="pcard-dose">${it.dose}</span>`:''}
      <div class="pcard-foot">
        ${priceHtml}
        <div class="pcard-actions">
          ${(window.REFERENCE&&window.REFERENCE[it.name])?`<button class="ref-btn" data-ref="${it.name}" aria-label="Research info" title="Research info"><i class="ph ph-info"></i></button>`:''}
          ${it.price==null?'':`<button class="add-btn" data-add="${id}" aria-label="Add to cart" title="Add to cart"><i class="ph ph-plus"></i></button>`}
        </div>
      </div>
    </article>`;}).join("");
  const block=document.createElement("div");
  block.className="cat reveal";block.dataset.cat=c.id;block.id="cat-"+c.id;
  block.innerHTML=`
    <div class="cat-head">
      <div class="cat-no">${c.no}</div>
      <div class="cat-titles"><h3>${c.name}</h3><p>${c.blurb}</p></div>
      <div class="cat-count">${c.items.length} ${c.unit||'compounds'}</div>
    </div>
    <div class="pgrid">${cards}</div>`;
  list.appendChild(block);
  if(window.axReveal)window.axReveal(block);else block.classList.add("in");
});

/* Search + filter + sort + price-range */
const search=document.getElementById("search"),empty=document.getElementById("empty");
const sortSel=document.getElementById("sort"),priceInp=document.getElementById("price"),priceVal=document.getElementById("priceVal"),rcount=document.getElementById("rcount");
let activeCat="all";
priceInp.min=PMIN;priceInp.max=PMAX;priceInp.step=1000;priceInp.value=PMAX;
function sortRows(){
  const mode=sortSel.value;
  document.querySelectorAll(".cat .pgrid").forEach(grid=>{
    const cards=[...grid.querySelectorAll(".pcard")];
    cards.sort((a,b)=>{
      const pa=a.dataset.price===""?Infinity:+a.dataset.price, pb=b.dataset.price===""?Infinity:+b.dataset.price;
      if(mode==="price-asc")return pa-pb;
      if(mode==="price-desc")return (pb===Infinity?-1:pa===Infinity?1:pb-pa);
      if(mode==="name")return a.querySelector(".pcard-name").textContent.localeCompare(b.querySelector(".pcard-name").textContent);
      return (+a.dataset.idx)-(+b.dataset.idx);
    });
    cards.forEach(c=>grid.appendChild(c));
  });
}
function apply(){
  const q=search.value.trim().toLowerCase();const maxP=+priceInp.value;let any=false,shown=0;
  priceVal.textContent="Rp "+fmt(maxP);
  document.querySelectorAll(".cat").forEach(cat=>{
    const catMatch=activeCat==="all"||cat.dataset.cat===activeCat;let vis=0;
    cat.querySelectorAll(".pcard").forEach(card=>{
      const price=card.dataset.price===""?null:+card.dataset.price;
      const priceOk = price==null || maxP>=PMAX || price<=maxP;
      const m=catMatch&&(!q||card.dataset.name.includes(q))&&priceOk;
      card.classList.toggle("hidden",!m);if(m){vis++;shown++;}
    });
    const show=catMatch&&vis>0;cat.classList.toggle("hidden",!show);if(show)any=true;
  });
  empty.style.display=any?"none":"block";
  rcount.innerHTML=`Showing <b>${shown}</b> of ${TOTAL} items`;
}
search.addEventListener("input",apply);
sortSel.addEventListener("change",()=>{sortRows();apply();});
priceInp.addEventListener("input",apply);
filters.addEventListener("click",e=>{
  const b=e.target.closest(".chip");if(!b)return;
  filters.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));
  b.classList.add("active");activeCat=b.dataset.cat;apply();
});
apply();

/* ---- Quote builder (persisted across pages) ---- */
const quote=new Map(Object.entries(window.axReadCart()));
const qBar=document.getElementById("quoteBar"),qItems=document.getElementById("qItems"),qCount=document.getElementById("qCount"),qTotal=document.getElementById("qTotal");
const WA_NUMBER="18038573396";
function saveCart(){
  try{localStorage.setItem(window.AX_CART_KEY,JSON.stringify(Object.fromEntries(quote)));}catch(e){}
}
function renderQuote(){
  const entries=[...quote.values()];
  qCount.textContent=entries.reduce((n,e)=>n+e.qty,0);
  const total=entries.reduce((n,e)=>n+e.price*e.qty,0);
  qTotal.textContent="Rp "+fmt(total);
  qItems.innerHTML=entries.map(e=>`
    <div class="qrow">
      <div class="qn">${e.name}${e.dose?`<small>${e.dose}</small>`:''}</div>
      <div class="qty"><button data-dec="${e.id}">–</button><span>${e.qty}</span><button data-inc="${e.id}">+</button></div>
      <div class="qp">Rp ${fmt(e.price*e.qty)}</div>
      <button class="qremove" data-rm="${e.id}" aria-label="Remove"><i class="ph ph-x"></i></button>
    </div>`).join("");
  qBar.classList.toggle("show",entries.length>0);
  if(entries.length===0)qBar.classList.remove("open");
  let msg="Hello AXIOM, I'd like to order the following:\n";
  entries.forEach((e,i)=>{msg+=`${i+1}. ${e.name}${e.dose?' '+e.dose:''} — ${e.qty}× — Rp ${fmt(e.price*e.qty)}\n`;});
  msg+=`\nEstimated total: Rp ${fmt(total)}`;
  document.getElementById("qWhatsApp").href=`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  qBar._msg=msg;
  document.querySelectorAll(".add-btn").forEach(b=>b.classList.toggle("added",quote.has(b.dataset.add)));
  saveCart();window.axBadge();
}
function addItem(id){
  const it=ITEMS[id];if(!it||it.price==null)return;
  if(quote.has(id))quote.get(id).qty++;else quote.set(id,{...it,qty:1});
  renderQuote();
}
list.addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b)addItem(b.dataset.add);});
qItems.addEventListener("click",e=>{
  const inc=e.target.closest("[data-inc]"),dec=e.target.closest("[data-dec]"),rm=e.target.closest("[data-rm]");
  if(inc){quote.get(inc.dataset.inc).qty++;renderQuote();}
  if(dec){const it=quote.get(dec.dataset.dec);if(--it.qty<=0)quote.delete(dec.dataset.dec);renderQuote();}
  if(rm){quote.delete(rm.dataset.rm);renderQuote();}
});
document.getElementById("quoteTop").addEventListener("click",()=>qBar.classList.toggle("open"));
document.getElementById("navCart").addEventListener("click",()=>{
  if(quote.size){qBar.classList.add("show","open");}
  else document.getElementById("catalogue").scrollIntoView({behavior:"smooth"});
});
document.getElementById("qClear").addEventListener("click",()=>{quote.clear();renderQuote();});
document.getElementById("qCopy").addEventListener("click",e=>{
  navigator.clipboard?.writeText(qBar._msg||"");
  const t=e.currentTarget;const old=t.innerHTML;t.innerHTML='<i class="ph ph-check"></i> Copied';setTimeout(()=>t.innerHTML=old,1500);
});
renderQuote();
/* deep link: products.html#cart opens the drawer */
if(location.hash==="#cart"&&quote.size)qBar.classList.add("show","open");

/* ---- Reference drawer ---- */
const NAME2DOSES={};
CAT.forEach(c=>c.items.forEach(it=>{
  (NAME2DOSES[it.name]=NAME2DOSES[it.name]||[]).push(it.dose||"—");
}));
const REF=window.REFERENCE||{},HANDLING=window.REF_HANDLING||"";
const drawer=document.getElementById("drawer"),drawerOv=document.getElementById("drawerOv");
function openRef(name){
  const r=REF[name];if(!r)return;
  document.getElementById("drCls").textContent=r.cls||"Research compound";
  document.getElementById("drName").textContent=name;
  document.getElementById("drMech").textContent=r.mech||"—";
  document.getElementById("drHalf").textContent=r.half||"—";
  document.getElementById("drHandling").textContent=HANDLING;
  const doses=[...new Set(NAME2DOSES[name]||[])].filter(d=>d&&d!=="—");
  document.getElementById("drDoses").innerHTML=doses.map(d=>`<span>${d}</span>`).join("");
  drawer.classList.add("show");drawerOv.classList.add("show");drawer.setAttribute("aria-hidden","false");
}
function closeRef(){drawer.classList.remove("show");drawerOv.classList.remove("show");drawer.setAttribute("aria-hidden","true");}
list.addEventListener("click",e=>{const b=e.target.closest("[data-ref]");if(b)openRef(b.dataset.ref);});
drawerOv.addEventListener("click",closeRef);
document.getElementById("drawerClose").addEventListener("click",closeRef);
addEventListener("keydown",e=>{if(e.key==="Escape")closeRef();});

/* ---- Acknowledgement gate ---- */
(function(){
  const gate=document.getElementById("gate");if(!gate)return;
  let ack=false;try{ack=localStorage.getItem("axiom_ack")==="1";}catch(e){}
  if(ack)return;
  gate.hidden=false;document.documentElement.style.overflow="hidden";
  function enter(){
    gate.hidden=true;document.documentElement.style.overflow="";
    try{localStorage.setItem("axiom_ack","1");}catch(e){}
  }
  document.getElementById("gateAccept").addEventListener("click",enter);
})();
})();
