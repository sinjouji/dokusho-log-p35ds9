//==============================
// UI
//
// ユーザーのインターフェースやで
//==============================



//==============================
// 通知
//==============================
function showToast(message){

  const toast =
    document.createElement("div");

  toast.className = "toast";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(()=>{
    toast.classList.add("show");
  },10);

  setTimeout(()=>{

    toast.classList.remove("show");

    setTimeout(()=>{
      toast.remove();
    },300);

  },2000);
}


//==============================
//右下の「↑」ちゃん
//==============================
function scrollToTop(){
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}



//==============================
//安全共通renderテンプレ
//==============================
function safeRender({
  mountId,
  html,
  afterRender
}){

  const el = document.getElementById(mountId);
  if(!el) return;

  // ① 必ず初期化
  el.innerHTML = "";

  // ② HTML描画
  el.innerHTML = html;

  // ③ DOM生成後処理
  if(afterRender) afterRender(el);
}





//==============================
//開閉トグル（汎用）※('id')を変えるだけ！
//==============================
function togglesSection(id, btn){

  const el =
    document.getElementById(id);

  if(!el) return;

  el.classList.toggle("open");

  const opened =
    el.classList.contains("open");

  btn.textContent =
    opened
      ? btn.dataset.open
      : btn.dataset.close;

  if(id === "tag-filter"){
    homeSections.tags = opened;
  }

  if(id === "open-book-tags"){
    detailSections.tags = opened;
  }
if(id.startsWith("date-history-")){
  detailSections.readHistory = opened;
}
if(id === "open-book-read-history"){
  detailSections.readHistory = opened;
}
if(id === "open-book-series"){
  detailSections.series = opened;
}  
  if(id === "open-book-hidden-tags"){
  detailSections.hiddenTags = opened;
}
if(id === "add-book-hidden-tags"){
  addBookTagSections.hiddenTags = opened;
}
if(id === "open-book-quotes"){
  detailSections.quotes = opened;
}


}


//==============================
//メニューボタンactive切り替え
//==============================
function setActiveMenu(menuId){

  document
    .querySelectorAll(".btn-me")
    .forEach(btn=>{

      btn.classList.remove("active");

    });

  document
    .getElementById(menuId)
    ?.classList.add("active");
}



//==============================                                                                                                       
//====背表紙のカラー設定
//==============================
function applySpineColor(d, b){

  const c1 =
    getTagColor(b.tagIds?.[0]) || "#888";

  const c2 =
    getTagColor(
      b.tagIds?.[1]
      || b.tagIds?.[0]
    ) || c1;

  const c3 =
    getTagColor(
      b.tagIds?.[2]
      || b.tagIds?.[0]
    ) || c1;

  if(colorMode === "single"){
    d.style.background = c1;
  }

  if(colorMode === "gradient"){
    d.style.background =
      `linear-gradient(         135deg,         ${c1},         ${c2}       )`;
  }

  if(colorMode === "stripe"){
    d.style.background =
      `linear-gradient(
               to bottom,
               ${c1} 0%, ${c1} 10%,
               ${c3} 10%, ${c3} 13%,
               ${c1} 13%, ${c1} 83%,
               ${c2} 83%, ${c2} 100%)`;
  }
}




//==============================
//タグ色=====
//==============================
function getTagColor(tagId){
  const t = tagMaster.find(x => x.id === tagId);
  return t?.color || "#999";
}




