"use strict";

/* ══ FIREBASE CONFIG ══════════════════════════
   POS ile aynı Firebase projesini kullanın.
   Burası otomatik olarak menü değişikliklerini yansıtır.
═════════════════════════════════════════════ */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC6MaQnrlBuINhqowrcxQ1IfSQwtp7PqnQ",
  authDomain: "veloracaffe2.firebaseapp.com",
  projectId: "veloracaffe2",
  storageBucket: "veloracaffe2.firebasestorage.app",
  messagingSenderId: "196549083369",
  appId: "1:196549083369:web:f9d6c12a89dc871f667078"
};

let allProducts = [];
let bizName     = "VELORA";
let activeCat   = "Tümü";
let isMenuOpen  = false;

/* ══ FIREBASE ═══════════════════════════════ */
function initFirebase(){
  try{
    if(!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    const db  = firebase.firestore();
    const doc = db.collection("aura_pos").doc("shared_state");

    doc.onSnapshot(snap=>{
      const data = snap.exists?(snap.data()||{}):{};

      // Sadece satışta olanları göster
      const menu = data["aura_menu"]||[];
      allProducts = menu.filter(p=>p.available!==false);

      // İşletme adı
      const settings = data["aura_settings"]||{};
      if(settings.bizName){ bizName=settings.bizName; updateBizName(); }

      setCloudStatus("live");
      if(isMenuOpen) renderMenu();
    },err=>{
      console.error("Firestore:",err);
      setCloudStatus("offline");
      loadDemo();
    });
  }catch(e){
    console.error("Firebase:",e);
    setCloudStatus("offline");
    loadDemo();
  }
}

function loadDemo(){
  allProducts=[
    {id:1, cat:"Espresso Bazlı",emoji:"☕",name:"Espresso",    price:65, desc:"Yoğun, saf espresso",         popular:false,available:true},
    {id:2, cat:"Espresso Bazlı",emoji:"🖤",name:"Americano",   price:75, desc:"Espresso + sıcak su",          popular:true, available:true},
    {id:3, cat:"Espresso Bazlı",emoji:"🤍",name:"Cappuccino",  price:95, desc:"Espresso + köpüklü süt",       popular:true, available:true},
    {id:10,cat:"Soğuk Kahve",   emoji:"🧊",name:"Cold Brew",   price:115,desc:"18 saat demleme, yumuşak",     popular:true, available:true},
    {id:11,cat:"Soğuk Kahve",   emoji:"🥤",name:"Iced Latte",  price:110,desc:"Espresso + soğuk süt + buz",   popular:true, available:true},
    {id:31,cat:"Atıştırmalık",  emoji:"🥐",name:"Croissant",   price:90, desc:"Tereyağlı, çıtır Fransız",      popular:true, available:true},
    {id:35,cat:"Atıştırmalık",  emoji:"🍰",name:"Cheesecake",  price:148,desc:"New York tarzı dilim",           popular:true, available:true},
  ];
  if(isMenuOpen) renderMenu();
}

/* ══ UI HELPERS ═════════════════════════════ */
function setCloudStatus(s){
  const dot=document.getElementById("cloudDot");
  const lbl=document.getElementById("cloudLabel");
  if(!dot)return;
  dot.className="cloud-dot"+(s==="live"?" live":"");
  lbl.textContent=s==="live"?"Canlı":"Çevrimdışı";
}

function updateBizName(){
  document.getElementById("headerBiz").textContent=bizName;
  document.getElementById("landingTitle").textContent=bizName;
  document.getElementById("headerBadge").textContent=bizName[0]?.toUpperCase()||"V";
  document.getElementById("landingLogo").textContent=bizName[0]?.toUpperCase()||"V";
}

function fmt(n){ return (Number(n)||0).toLocaleString("tr-TR",{minimumFractionDigits:0,maximumFractionDigits:0})+" ₺"; }

/* ══ LANDING ════════════════════════════════ */
function openMenu(){
  const landing=document.getElementById("landing");
  const page=document.getElementById("menu-page");
  landing.classList.add("exit");
  setTimeout(()=>{
    landing.style.display="none";
    page.classList.add("visible");
    isMenuOpen=true;
    renderMenu();
    window.scrollTo(0,0);
  },450);
}

function closeMenu(){
  const landing=document.getElementById("landing");
  const page=document.getElementById("menu-page");
  page.classList.remove("visible");
  landing.style.display="";
  landing.classList.remove("exit");
  void landing.offsetWidth;
  landing.style.animation="none";
  requestAnimationFrame(()=>landing.style.animation="");
  isMenuOpen=false;
  window.scrollTo(0,0);
}

/* ══ CATEGORY BAR ═══════════════════════════ */
function buildCatBar(categories){
  const bar=document.getElementById("catBar");
  const cats=["Tümü",...categories];
  bar.innerHTML=cats.map(c=>`
    <button class="cat-pill${c===activeCat?" active":""}"
      onclick="selectCat('${c.replace(/'/g,"\\'")}')">
      ${c}
    </button>`).join("");
}

function selectCat(cat){
  activeCat=cat;
  document.getElementById("searchInput").value="";
  renderMenu();
  if(cat!=="Tümü"){
    const s=document.getElementById("sec-"+cat.replace(/\s/g,"_"));
    if(s) setTimeout(()=>s.scrollIntoView({behavior:"smooth",block:"start"}),50);
  }else{
    window.scrollTo({top:0,behavior:"smooth"});
  }
}

/* ══ RENDER MENU ════════════════════════════ */
function renderMenu(){
  const body=document.getElementById("menuBody");
  const q=(document.getElementById("searchInput")?.value||"").toLowerCase().trim();

  let products=allProducts;
  if(q) products=allProducts.filter(p=>
    p.name.toLowerCase().includes(q)||
    (p.desc||"").toLowerCase().includes(q)||
    (p.cat||"").toLowerCase().includes(q)
  );

  if(products.length===0){
    body.innerHTML=`<div class="empty-state">
      <div class="empty-emoji">${q?"🔍":"☕"}</div>
      <div class="empty-title">${q?"Sonuç bulunamadı":"Menü boş"}</div>
      <div class="empty-sub">${q?'"'+q+'" için ürün bulunamadı.':"Yakında yeni ürünler eklenecek."}</div>
    </div>`;
    buildCatBar([...new Set(allProducts.map(p=>p.cat))]);
    return;
  }

  const allCats=[...new Set(allProducts.map(p=>p.cat))];
  buildCatBar(allCats);

  const productCats=[...new Set(products.map(p=>p.cat))];
  const visibleCats=activeCat==="Tümü"||q?productCats:productCats.filter(c=>c===activeCat);

  if(visibleCats.length===0){
    body.innerHTML=`<div class="no-results"><span>🔍</span>Bu kategoride ürün yok.</div>`;
    return;
  }

  body.innerHTML=visibleCats.map(cat=>{
    const items=products.filter(p=>p.cat===cat);
    const safeId="sec-"+cat.replace(/\s/g,"_");
    return `<div class="cat-section" id="${safeId}">
      <div class="cat-title">${cat}</div>
      <div class="product-grid">
        ${items.map(p=>productCard(p)).join("")}
      </div>
    </div>`;
  }).join("");
}

function productCard(p){
  return `<div class="product-card" onclick="openProductModal(${p.id})">
    <div class="card-top">
      <div class="card-emoji">${p.emoji||"☕"}</div>
      <div class="card-info">
        <div class="card-name">${p.name}</div>
        ${p.desc?`<div class="card-desc">${p.desc}</div>`:""}
      </div>
    </div>
    <div class="card-footer">
      <div class="card-price">${fmt(p.price)}</div>
      ${p.popular?'<span class="popular-badge">⭐ Popüler</span>':""}
    </div>
  </div>`;
}

/* ══ SEARCH ═════════════════════════════════ */
function filterMenu(){
  activeCat="Tümü";
  renderMenu();
}

/* ══ PRODUCT MODAL ══════════════════════════ */
function openProductModal(id){
  const p=allProducts.find(x=>x.id===id);
  if(!p)return;
  document.getElementById("modalEmoji").textContent=p.emoji||"☕";
  document.getElementById("modalName").textContent=p.name;
  document.getElementById("modalCat").textContent=p.cat;
  document.getElementById("modalDesc").textContent=p.desc||"Açıklama mevcut değil.";
  document.getElementById("modalPrice").textContent=fmt(p.price);
  document.getElementById("modalPopular").innerHTML=p.popular?'<span class="popular-badge">⭐ Popüler</span>':"";
  document.getElementById("productModal").classList.add("open");
  document.body.style.overflow="hidden";
}

function closeProductModal(){
  document.getElementById("productModal").classList.remove("open");
  document.body.style.overflow="";
}

function handleOverlayClick(e){
  if(e.target===document.getElementById("productModal")) closeProductModal();
}

document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeProductModal(); });

/* ══ INIT ═══════════════════════════════════ */
document.addEventListener("DOMContentLoaded",()=>{ initFirebase(); });
