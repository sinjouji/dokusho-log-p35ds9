//==============================
// UI
//
// ユーザーのインターフェースやで
//==============================



//==============================
// トースト通知
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
// ダイアログ通知（事前確認用）
//==============================
function showConfirmDialog({
  title = "確認",
  message = "",
  okText = "OK",
  cancelText = "キャンセル",
  onOk = () => {},
  onCancel = () => {}
}){

  const modal = document.createElement("div");
  modal.className = "modal-bg";
  modal.id = "confirm-dialog";

  modal.innerHTML = `
    <div class="modal-box confirm-dialog">

      <div class="detail-modal-header">
        <div class="left-yose">${title}</div>
      </div>

      <div class="detail-modal-body">
        ${message}
      </div>

      <div class="detail-modal-footer">
        <button class="btn-sub">
          ${cancelText}
        </button>

        <button class="btn-main">
          ${okText}
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(modal);

  const buttons =
    modal.querySelectorAll("button");

  buttons[0].onclick = ()=>{
    closeModal("confirm-dialog");
    onCancel();
  };

  buttons[1].onclick = ()=>{
    closeModal("confirm-dialog");
    onOk();
  };

}


//==============================
// ダイアログ通知（実行後の結果確認）
//==============================
function showResultDialog({
  title = "完了",
  message = "",
  okText = "OK",
  onOk = () => {}
}){

  const modal = document.createElement("div");
  modal.className = "modal-bg";
  modal.id = "result-dialog";

  modal.innerHTML = `
    <div class="modal-box confirm-dialog">

      <div class="detail-modal-header">
        <div class="left-yose">${title}</div>
      </div>

      <div class="detail-modal-body">
        ${message}
      </div>

      <div class="detail-modal-footer">
        <button class="btn-main">
          ${okText}
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(modal);

  modal
    .querySelector("button")
    .onclick = ()=>{

      closeModal("result-dialog");

      onOk();

    };

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
//右下の「↓」ちゃん
//==============================
function scrollToBottom(){
  window.scrollTo({
    top: document.documentElement.scrollHeight,
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
// ホームページのバーガーメニュー開く
//==============================
function toggleMoreMenu(){
  document
    .getElementById("more-menu")
    .classList.toggle("hidden");
}

//==============================                                                                                                       
// ホームページのバーガーメニュー閉じる
//==============================
function closeMoreMenu(){
  document
    .getElementById("more-menu")
    .classList.add("hidden");
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



//==============================
// テーマセレクター
//==============================
function injectThemeSwitcher(){
  const wrapper=document.createElement("div");
  wrapper.className="theme-switcher";

// 同期スイッチ描画
const syncButton =
  isSyncMode()
    ? `
      <button
  id="sync-toggle"
  class="sync-toggle ${
    isSyncEnabled()
      ? "sync-on"
      : "sync-off"
  }"
  onclick="toggleSyncSwitch()"
>
  ${
    isSyncEnabled()
      ? "☁️ 同期ON"
      : "☁️ 同期OFF"
  }
</button>
    `
    : "";

  wrapper.innerHTML=`
  
  ${syncButton}
  
       <select
    id="theme-select"
    class="select-chip hidari-ake"
    onchange="
      applyTheme(this.value)
    "
  >
    <option value="" disabled selected>◼️テーマを選択</option>
     <optgroup label="第1弾テーマ">
      <option value="harunoniwa">◻️春の庭</option>
      <option value="yuusuzumi">◻️夕涼み</option>
      <option value="yuuyakekomichi">◻️夕焼け小径</option>
      <option value="ekisha">◼️駅舎</option>
      <option value="tsukikage">◼️月影</option>
      <option value="taishomodern">◻️大正モダン</option>
     </optgroup>
     
     <optgroup label="第2弾テーマ">
      <option value="bungakushoujo">◻️文学少女</option>
      <option value="bunmeikaika">◻️文明開化</option>
      <option value="meijishosai">◻️明治書斎</option>
      <option value="asatsuyu">◻️朝露</option>
      <option value="yoiyami">◼️宵闇</option>
      <option value="natsumatsuri">◼️夏祭り</option>
      <option value="marin">◻️海の家</option>
     </optgroup>

  </select>

  `;

  const app=document.querySelector(".app-container") || document.body;
app.prepend(wrapper);

const savedTheme =
  localStorage.getItem(
    "selectedTheme"
  ) || "yuusuzumi";

const select =
  wrapper.querySelector(
    "#theme-select"
  );

select.value = savedTheme;

}

document.addEventListener("DOMContentLoaded",()=>{
  injectThemeSwitcher();
});



//===============================
// 同期スイッチ切り替え
//===============================
function toggleSyncSwitch(){

  const next =
    !isSyncEnabled();

  setSyncEnabled(next);

  updateSyncSwitch();

}


//===============================
// 同期スイッチ表示更新
//===============================
function updateSyncSwitch(){

  const button =
    document.getElementById(
      "sync-toggle"
    );

  if(!button){
    return;
  }

  const enabled =
    isSyncEnabled();

  button.textContent =
    enabled
      ? "☁️ 同期ON"
      : "☁️ 同期OFF";

  button.classList.toggle(
    "sync-on",
    enabled
  );

  button.classList.toggle(
    "sync-off",
    !enabled
  );

}



//==============================
// モーダル右上の✖️ボタン
//==============================
function renderCloseButton(modalId){

  return `
    <button
      class="btn-sub right-yose hidari-ake"
      onclick="
        closeModal('${modalId}')
      "
    >
      ×
    </button>
  `;

}



//==============================
// HELP文トグル
//==============================
function toggleHelpSection(
  sectionId,
  header,
  key
){

  togglesSection(
    sectionId,
    header
  );

  helpSections[key] =
    !helpSections[key];

  if(
    localStorage.getItem(
      key + "Seen"
    ) !== "1"
  ){

    localStorage.setItem(
      key + "Seen",
      "1"
    );

  }

}



//==============================
// HELP文ポップアップ
//==============================



