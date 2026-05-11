// ★ JSON URL
const DATA_URL = "https://raw.githubusercontent.com/sinjouji/my-b0o0oksd6t6/main/data.json";

//🟦①====状態（let）====
//初期設定

let books = [];
let characters = [];
let tagMaster = [];

let selectedTagId = null;
//if(!selectedTagId) selectedTagId = null;

const savedMode = localStorage.getItem("colorMode");

let colorMode = localStorage.getItem("colorMode") || "single";
if(!["single","gradient","stripe"].includes(colorMode)){
  colorMode = "single";
} // 背表紙カラー：single/gradient/stripe

let viewMode = "card";
//if(!["card","shelf"].includes(viewMode)){viewMode = "card";}

let sortMode = "read-desc";

let searchKeyword = "";
let seriesSearchKeyword = "";
//let charaSearchKeyword = "";

//ミニカレンダーの月移動用設定
let miniMonth = new Date();

let currentDetailFav = 0;

let openedSeries = {};

//絞込み用タグ収納用
let showTagFilter = localStorage.getItem("showTagFilter");
showTagFilter = showTagFilter === null
  ? true
  : showTagFilter === "true";
  
//タイプフィルター
let typeFilter = localStorage.getItem("typeFilter") || "all";
  
//メモ機能のオンオフ切り替え
let enableMemo = localStorage.getItem("enableMemo");
 enableMemo =
  enableMemo === null
   ? true
   : enableMemo === "true";

//テーマカラーの設定
let themeColor = localStorage.getItem("themeColor") || "#f5f5f5";
 document.body.style.background = themeColor;

let sortKey = localStorage.getItem("sortKey") || "title"; //なにで並べるか
let sortOrder = localStorage.getItem("sortOrder") || "asc"; // asc / desc
let selectedType = "all"; // "all" | "normal" | "wish"※ウィッシュリスト切替
let currentMonth = new Date();

//====年間目標設定
let yearlyGoal = Number(localStorage.getItem("yearlyGoal")) || 100;

let enableGoal = localStorage.getItem("enableGoal");
enableGoal = enableGoal === null ? true : (enableGoal === "true");//年間読破目標設定

//グラフ年間移動用
let statsYear = new Date().getFullYear();

// 設定（保存＋初期値）
let uiSettings = {
  recent: true,
  summary: true,
  tags: true,
  type: true,
  ...JSON.parse(localStorage.getItem("uiSettings") || "{}")
};

let uiMode = localStorage.getItem("uiMode") || "on";
// "on" or "off"
let recentViewMode = localStorage.getItem("recentViewMode") || "card";
// "card" or "spine"

//設定のグループ開閉
let settingSections = JSON.parse(
  localStorage.getItem("settingSections")
  ) || {
    home: true,
    input: true,
    stats: true,
    tags: true,
    datas: true,
    };

//タグ編集用
let editingTagId = null;
let editingTagColor = "";

//タグパレット
const tagColors = [
//濃い色
  "#ea6d7e", // 韓紅花
  "#eea220", // 黄丹
  "#c9171e", // 紅
  "#223a70", // 群青
  "#674196", // 菖蒲
  "#478384", // 青碧
  "#5dac81", // 若竹
  "#f08300", // 蜜柑色
  "#e95464", // 薄紅
  "#ca6924", // 琥珀

  "#7B8D8E", // 青鈍
//  "#6E7F80", // 御召茶
//  "#8F7A66", // 江戸茶
  "#8C6B4F", // 狐色
  "#7C5C46", // 路考茶

//  "#8B6F70", // 鳩羽鼠
//  "#A16D5D", // 唐茶
  "#B77B57", // 琥珀色
//  "#A67B5B", // 丁子茶

//  "#6D8C74", // 千歳緑
  "#5F7B6E", // 深緑
  "#768F72", // 柳煤竹

//  "#6F7C8C", // 鉄紺
  "#5F6A7D", // 紺鼠
  "#7A89A8", // 藍鼠

  "#9A8C98", // 紫鼠
  "#8D7A8C", // 葡萄鼠

//  "#B4A582", // 利休白茶
  "#C2B59B", // 灰桜
//  "#D0C2A8",  // 鳥の子

//カスタム追加
"#74aea9", //水浅葱
"#67b255", //鮮緑
"#f9ca00", //金
"#f8a484", //曙
"#646364", //燻銀
"#eddece", //惚
"#b9d08b", //若葉
"#86964e" //苔
];

//タグ追加
let newTagName = "";
let newTagColor = "#7b8d8e";

//シリーズ関係
let seriesMaster = [];
let seriesSections = {
  books: true,
  characters: true
};




//🟩②====データ取得・保存（load・save）====
//基本的にGet系はここ、go


//====タグ編集用：色の処理
function selectTagColor(color){

  editingTagColor = color;
  
  renderSettings();
}
//==================

//====新規タグ追加用：色の処理
function selectNewTagColor(color){

  newTagColor = color;

  renderSettings();
}
//==================



//最近読んだ3冊====
function getRecentBooks(limit=3){
  return [...books]
    .filter(b => b.dates && b.dates.length)
    .sort((a,b)=>{
      const da = a.dates[a.dates.length-1];
      const db = b.dates[b.dates.length-1];
      return db.localeCompare(da);
    })
    .slice(0, limit);
}
//========


// ページ切替
function go(page){
  document.querySelectorAll("[id^='page-']").forEach(el=>{
    el.style.display = "none";
  });

  const target = document.getElementById("page-" + page);
  if(target) target.style.display = "block";

  // ここ追加
  updateUIVisibility(page);

  if(page === 'settings') renderSettings();
  if(page === 'home') renderHome();
  if(page === 'series') renderSeries();
  if(page === 'characters') renderCharacters();
  if(page === 'stats') renderStats();
}
//========

//====🔑データの保存処理：超重要！！====
async function saveData(){

  const data = {
    books,
    characters,
    tagMaster,
    seriesMaster
  };

  // ローカル保存
  localStorage.setItem(
    "bookAppData",
    JSON.stringify(data)
  );

  // Firestore保存
  await window.setDoc(
    window.doc(window.db, "app", "data"),
    data
  );

  console.log("Firestore保存完了");
}
//================================


//====最新読了日を取得するやつ
function getLatestReadDate(book){

  return (
  [...(book.dates || [])]
    .sort()
    .at(-1)
  ) || "";
}
//=================

//====日付の空白安全対策
function toDateNum(book){

  const d = getLatestReadDate(book);

  return d
    ? new Date(d).getTime()
    : 0;
}
//==================


//タグ色=====
function getTagColor(tagId){
  const t = tagMaster.find(x => x.id === tagId);
  return t?.color || "#999";
}
//========

//背表紙（単色）
function getBookColor(book){
  const firstTagId =
    book.tagIds?.[0];
    
  return getTagColor(firstTagId);
}
//========

//====設定用：背表紙カラー
function getShelfColorModeLabel(){

  if(
    colorMode === "single"
  ){
    return "単色";
  }

  if(
    colorMode === "gradient"
  ){
    return "グラデ";
  }

  if(
    colorMode === "stripe"
  ){
    return "目印";
  }

  return "";
}
//============

//====設定用：並び順
function getSortModeLabel(){

  if(
    sortMode === "read-desc"
  ){
    return "最新読了順";
  }

  if(
    sortMode === "read-asc"
  ){
    return "最古読了順";
  }

  if(
    sortMode === "title-asc"
  ){
    return "名前↓";
  }
  
    if(
    sortMode === "title-desc"
  ){
    return "名前↑";
  }
  
    if(
    sortMode === "rating-desc"
  ){
    return "高評価";
  }
  
    if(
    sortMode === "rating-asc"
  ){
    return "低評価";
  }

  return "";
}
//=============

//====設定用：表示タイプ
function getTypeModeLabel(){
    if(
    typeFilter === "all"
  ){
    return "全部";
  }
  
      if(
    typeFilter === "normal"
  ){
    return "本棚";
  }

    if(
    typeFilter === "wish"
  ){
    return "ウィッシュリスト";
  }
  return "";
}
//=============



//文字色対策
function getTextColor(bg){
  return "#fffffc"; // とりあえず白固定でもOK
}
//========

//====常に正しい本を取得
function getBookById(id){
	return books.find(x => String(x.id) === String(id));
}
//========


//========
function getFavLabel(val){
	if(val >= 4) return "👑";
	return "★".repeat(val || 0);
	}
//========



//ラベル表示====
function getViewLabel(){
  return {
    card:"カード",
    shelf:"本棚",
    "shelf-series":"シリーズ"
  }[viewMode];
}
//========

//========
function getColorLabel(){
  return {
    single:"単色",
    gradient:"グラデ",
    stripe:"目印"
  }[colorMode];
}
//========

//========
function getSortLabel(){
  return {
    title:"名前",
    fav:"評価",
    date:"日付"
  }[sortKey];
}
//========

//========
function getRecentViewLabel(){
  return {
    card:"カード",
    spine:"背表紙"
  }[recentViewMode];
}
//========


//読書状態ステータス
function getReadStatus(book){
	if(book.type === "wish") return "ウィッシュ";

  const count = book.dates?.length || 0;
  if(count === 0) return "🔖未読";
  if(count === 1) return "✔️読了";
  return `🔂再読 ${count}回`;
}
//========


//========
function getHeatColor(count){
  if(count === 0) return "#9b8e82"; //鼯鼠
  if(count === 1) return "#f8d8c6"; //乙女
  if(count === 2) return "#f7ed92"; //承和
  if(count === 3) return "#fddb5d"; //くちなし
  if(count === 4) return "#aacf53"; //萌葱
  return "#78ccd2"; //白群
  }
//========


//今年・今月◯冊取得
function getMonthlyCounts(year){
  const arr = Array(12).fill(0);
  
  books.forEach(b=>{
    (b.dates || []).forEach(d=>{
      if(!d.startsWith(String(year)))
        return;
      const month =
        Number(d.slice(5,7)) - 1;
      
      arr[month]++;
    });
  });
  return arr;
}
//========

//========
function getYearReadCount(year){

  let count = 0;
  books.forEach(b=>{
    (b.dates || []).forEach(d=>{
      if(new Date(d).getFullYear() === year){
       count++;
       }
    });
  });

  return count;
}
//========

//読了回数バッジ
function createReadBadge(book){
  const count = book.dates?.length || 0;

  const span = document.createElement('span');

  // 共通スタイル
  span.style.padding = "2px 8px";
  span.style.fontSize = "12px";
  span.style.borderRadius = "999px";
  span.style.marginLeft = "6px";

  if(count === 0){
    span.textContent = "🔖未読";
    span.style.background = "#eee";
    span.style.color = "#666";
  } else if(count === 1){
    span.textContent = "✔️読了";
    span.style.background = "#4a8d61";
    span.style.color = "#fffffc";
  } else {
    span.textContent = `再読 ${count}回`;
    span.style.background = "#4c808d";
    span.style.color = "#fffffc";
  }

  return span;
}
//==========

//========カレンダー
function getReadingMap(){
  const map = {};

  books.forEach(b=>{
    (b.dates || []).forEach(d=>{
      map[d] = (map[d] || 0) + 1;
    });
  });

  return map;
}
//========






//🟨③====ロジック、関数====
//並び替え・フィルタ、計算、sortgetLatestReadDate、データをいじるだけ

//完全UIOFFフラグ====
function isUIAllOff(){
  return !uiSettings.recent &&
         !uiSettings.summary &&
         !uiSettings.tags &&
         !uiSettings.type;
}
//========

//ボタンエフェクト
function pressEffect(el){
	el.style.transform = "scale(0.95)";
	setTimeout(()=>{
		el.style.transform = "scale(1)";
	},100);
}
//========


//====評価切替えボタン
function setFav(fav){

  currentDetailFav = fav;

  const buttons =
    document.querySelectorAll(".fav-btn");

  buttons.forEach(btn=>{
    btn.classList.remove("active");
  });

  document
    .getElementById(`fav-${fav}`)
    ?.classList.add("active");
}
//=================

//====評価1ボタン切替え
function cycleFav(id){

  const book =
    books.find(b=>String(b.id)===String(id));

  if(!book) return;

  book.fav = (book.fav + 1) % 5;

  saveData();

  closeModal();

  openBookDetailModal(book);

  renderHome();
}
//===============


//カレンダー月送り
function changeMonth(diff){
  const y = currentMonth.getFullYear();
  const m = currentMonth.getMonth();
  
  currentMonth = new Date(y, m + diff, 1);
  renderCalendar();
}
//=========


//カレンダー年送り
function changeYear(diff){

  currentMonth.setFullYear(
    currentMonth.getFullYear() + diff
  );

  renderStats();
}
//===========

//====グラフ、年間目標年送り
function changeStatsYear(diff){
  statsYear += diff;
  renderStats();
}
//=============


//========
function changeGoal(val){
  yearlyGoal = Number(val) || 0;
  localStorage.setItem("yearlyGoal", yearlyGoal);

  renderHome(); // 即反映
}
//========

//本生成の関数====
function createBookSpine(b){
  const d = document.createElement('div');

  const base = 20;
  const extra = Math.min((b.title || "").length * 2, 55);

  d.style.width = (base + extra + 4) + "px";
  d.style.height = "130px";
  d.style.margin = "0px";
  d.style.borderRadius = "3px 5px 5px 3px";
  d.style.display = "flex";
  d.style.flexDirection = "column";
  d.style.justifyContent = "space-between";
  d.style.borderRight = "3px solid rgba(0, 0, 0, 0.2)";
  d.style.overflow = "visible";

  
  applySpineColor(d, b);

  if(b.type === "wish"){
	d.style.opacity = "0.65";
	d.style.filter = "grayscale(0.15)";
	}

  const title = document.createElement('div');
  title.textContent = b.title;
  
  //縦書き
  title.style.writingMode = "vertical-rl"; //!
  title.style.textOrientation = "mixed";
  
  //レイアウト安定
  title.style.display = "flex"; //!
  title.style.height = "auto";
 // title.style.width = "auto";

  //はみ出し対策
  title.style.overflow = "visible";//visible:hidden
  title.style.wordBreak = "break-all";
  
  //見た目調整
  title.style.fontSize = "9px"; //!
  title.style.lineHeight = "1.1";
  title.style.paddingTop = "8px";
  title.style.paddingLeft = "8px";
  title.style.paddingRight = "6px";
  title.style.letterSpacing = "0.05em";
  
  //色
  title.style.color = "#fffffc"; //!
  
  title.style.flex = "1";
  title.style.alignItems = "center"; //! flex-start
  title.style.justifyContent = "flex-start"; //! flex-start/center
  title.style.textAlign = "left";
  title.style.whiteSpace = "normal";
  title.style.maxHeight = "100%";

  const fav = document.createElement('div');
  const val = Math.min(b.fav || 0, 4);
  fav.textContent = val === 4 ? "👑" : "★".repeat(val)
//  +"\n"+${book.dates?.length || 0}+"回読了";
  fav.style.fontSize = "8px";
  fav.style.color = "#fffffc";
  fav.style.writingMode = "vertical-rl";
  fav.style.height = "30px";
  fav.style.display = "flex";
  fav.style.alignItems = "center";
  fav.style.justifyContent = "flex-end";
  fav.style.paddingBottom = "5px";

  d.appendChild(title);
  d.appendChild(fav);

  d.onclick = ()=> openDetail(b);

//評価を背表紙にうっすら表示
//const badge = document.createElement("div");
//badge.textContent = getFavLabel(b.fav);
//badge.style.position = "absolute";
//badge.style.bottom = "2px";
//badge.style.right = "2px";
//badge.style.fontSize = "10px";
//badge.style.opacity = "0.8";
//badge.style.writingMode = "vertical-rl";
//badge.style.height = "30px";
//badge.style.alignItems = "center";
//badge.style.justifyContent = "flex-end";
//badge.style.paddingBottom = "5px";

//d.style.position = "relative";
//d.appendChild(badge);


  return d;
}
//========


//====メモのオンオフ
function toggleMemo(){

  enableMemo = !enableMemo;

  localStorage.setItem(
    "enableMemo",
    enableMemo
  );

  renderSettings();
  renderHome();
}
//==============


//====背表紙のカラー設定
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
               ${c1} 0%, ${c1} 3%,
               ${c3} 3%, ${c3} 6%,
               ${c1} 6%, ${c1} 75%,
               ${c2} 75%, ${c2} 100%)`;
  }
}
//==================



//=====ソートここから
function sortBooks(list){

  const arr = [...list];

  if(sortMode === "title-asc"){
    arr.sort((a,b)=>
      (a.title || "")
      .localeCompare(b.title || "","ja")
    );
  }
  
  if(sortMode === "title-desc"){
    arr.sort((a,b)=>
      (b.title || "")
      .localeCompare(a.title || "", "ja")
    );
  }

  if(sortMode === "rating-desc"){

    arr.sort((a,b)=>
      Number(b.fav || 0) - Number(a.fav || 0)
    );
  }
  
  if(sortMode === "rating-asc"){
    arr.sort((a,b)=>
      Number(a.fav || 0) - Number(b.fav || 0)
    );
  }

  if(sortMode === "read-asc"){

    arr.sort((a,b)=>
      toDateNum(a) - toDateNum(b)
      );
  }

  if(sortMode === "read-desc"){

    arr.sort((a,b)=>
      toDateNum(b) - toDateNum(a)
    );
  }

  return arr;
}
//========




//========
function markAsRead(book){
  const today = new Date().toISOString().slice(0,10);

  book.type = "normal";

  if(!Array.isArray(book.dates)){
    book.dates = [];
  }

  book.dates.push(today);

  saveData();
  openDetail(book);
}
//========








//🟧④====UI描画（render系）====
//ページ毎にまとめてOKなエリア


//ボタンの見た目チップ化
function styleChip(btn, active=false){
  btn.style.display = "inline-block";
  btn.style.padding = "4px 10px";
  btn.style.margin = "4px 4px 4px 0";
  btn.style.fontSize = "13px";
  btn.style.borderRadius = "999px";
  btn.style.cursor = "pointer";
  btn.style.border = "1px solid #333";

  if(active){
    btn.style.background = "#333";
    btn.style.color = "#fffffc";
  } else {
    btn.style.background = "transparent";
    btn.style.color = "#333";
  }
}
//========

//====
function renderViewMode(targetId = "view-mode"){
  const el = document.getElementById(targetId);
  if(!el) return;

  el.innerHTML = "";

  const modes = [
    { id: "card", label: "カード" },
    { id: "list", label: "リスト（２列）"},
    { id: "shelf", label: "本棚" },
    { id: "shelf-series", label: "シリーズ" }
  ];

  modes.forEach(m=>{
    const btn = document.createElement('button');
    btn.textContent = m.label;
    btn.className = "setting-btn";

    if(m.id === viewMode){
      btn.classList.add("active");
    }

    btn.onclick = ()=>{
      viewMode = m.id;
      localStorage.setItem("viewMode", viewMode);

      renderHome();                 // これ必須
      renderViewMode(targetId);     // 見た目更新
    };

    el.appendChild(btn);
  });
}
//========


// ⬛︎ホーム（本のリスト表示）HOME====
//ホーム画面の「骨組みだけ」にする！
function renderHome(){

  const el = document.getElementById("page-home");
  if(!el) return;

  el.innerHTML = `
 
    <div id="home-top"></div>
    <div id="home-main"></div>
  `;


  renderSearchArea();
  
  renderTagFilter();

  renderRecentBooks();
  
  renderBookList();
}
//==============================


//======🔍検索用エリア===========
//====検索UIだけの役割
function renderSearchArea(){

  const top = document.getElementById("home-top");
  if(!top) return;
  
 
  top.innerHTML = `
    <button onclick="openAddBookModal()" class="add-btn">
      ＋ 本を追加
    </button>

    <input
      id="search"
      placeholder="検索..."
      value="${searchKeyword}"
      oninput="handleSearchInput()"
    >
    
      <select id="sort-select"
        onchange="changeSortMode()">

      <option value="read-desc">読了日新</option>
      <option value="read-asc">読了日古</option>

      <option value="title-asc">タイトル↑</option>
      <option value="title-desc">タイトル↓</option>

      <option value="rating-desc">評価↑</option>
      <option value="rating-asc">評価↓</option>

      </select>
    <div class="view-switch">

      <button class="${viewMode === 'card'
      ? 'active'
      : ''}"
      onclick="changeViewMode('card')">
        ■ 
      </button>

      <button class="${viewMode === 'list'
      ? 'active'
      : ''}"
      onclick="changeViewMode('list')">
        ☰ 
      </button>

      <button class="${viewMode === 'shelf'
      ? 'active'
      : ''}"
      onclick="changeViewMode('shelf')">
        📚 
      </button>
      <select
  id="type-filter"
  onchange="changeTypeFilter()">

  <option value="all">
    全部
  </option>

  <option value="normal">
    本棚
  </option>

  <option value="wish">
    ウィッシュ
  </option>

  </select>

      <button class="tag-chip" onclick="toggleTagFilter()">
      ${showTagFilter
        ? "🏷️タグ非表示"
        : "🏷️タグ表示"
      }
      </button>
    </div>
       ${showTagFilter
     ? `<div id="tag-filter"></div>`
     : ""
   }

    <div id="suggest"></div>
  `;

  renderSuggest();
}
//==================



//====タイプフィルター切り替え
function changeTypeFilter(){

  typeFilter =
    document.getElementById(
      "type-filter"
    ).value;

  localStorage.setItem(
    "typeFilter",
    typeFilter
  );

  renderHome();
}
//================

//====汎用サジェスト
function renderSuggestList({

  inputId,
  suggestId,
  list,
  max = 5

}){

  const input =
    document.getElementById(inputId);

  const suggest =
    document.getElementById(suggestId);

  if(!input || !suggest) return;

  const keyword =
    input.value
      .trim()
      .toLowerCase();

  if(!keyword){

    suggest.innerHTML = "";
    return;
  }

  const matched =
    [...new Set(list)]
      .filter(v=>

        v &&
        v.toLowerCase()
          .includes(keyword)

      )
      .slice(0, max);

  suggest.innerHTML = "";
  
  matched.forEach(text=>{

    const item =
      document.createElement("div");

    item.className =
      "suggest-item";

    item.textContent = text;
    
    item.onclick = ()=>{

      input.value = text;

      suggest.innerHTML = "";
    };

    suggest.appendChild(item);
  });
}
//===============


//====サジェスト
//====検索候補のみ表示させる役
function renderSuggest(){

  // 検索候補
    //🔍 検索
  const keyword = searchKeyword;
 
  const suggestEl = document.getElementById("search-suggest");

  if(suggestEl){

  if(keyword){

    const suggestions = books
  .filter(b =>
    (b.title || "")
      .toLowerCase()
      .includes(keyword)
  )
  .slice(0,5);

  suggestEl.innerHTML = suggestions.map(b=>`
    <div class="search-item"
         onclick="openDetailById('${b.id}')">
      ${b.title}
    </div>
  `).join("");

  }else{
    suggestEl.innerHTML = "";
  }
}
}

//========

//====タイトル用サジェスト
function renderTitleSuggest(){

  renderSuggestList({

    inputId: "add-title",

    suggestId: "title-suggest",

    list:
      books.map(b=>b.title)

  });
}
//===================

//====シリーズ用サジェスト
function renderSeriesSuggest(){

  renderSuggestList({

    inputId: "add-series",

    suggestId: "series-suggest",

    list:
      seriesMaster.map(s => s.name)

  });
}
//===================

//====キャラクター用サジェスト
function renderCharacterSuggest(){

  renderSuggestList({

    inputId: "add-character",

    suggestId: "character-suggest",

    list:
      characters.map(c=>c.name)

  });
}
//===================

//====キーワード検索（ホーム本棚用）
function handleSearchInput(){

  searchKeyword =
    (document.getElementById(
    "search"
    )?.value || "")
    .toLowerCase();

  renderSuggest();
  renderBookList();
}
//========

//====キーワード検索（シリーズ一覧用）


function handleSeriesSearchInput(){

	renderSuggestList({
	
		inputId:
			"search",
		
		suggestId:
			"suggest",
		
		list:
			seriesMaster.map(
				s => s.name
			)
	});

  renderSeriesSuggest();
  renderSeriesBookList();
}
//========




//======本の一覧だけ表示させる役
function renderBookList(){
  const main = document.getElementById("home-main");
  if(!main) return;
  main.innerHTML = "";

  
  //フィルタ
  const filtered = filterBooks(
  books.filter(b=>{

    const matchTitle =
      (b.title || "")
      .toLowerCase()
      .includes(searchKeyword);

    const matchTag =
      !selectedTagId ||

      (b.tagIds || [])
      .includes(selectedTagId);

    return matchTitle && matchTag;
  })
);
  
  //ソート
  const sorted = sortBooks(filtered);
  
  //表示
  if(viewMode === "card"){
    renderCardView(main, sorted);
    return;
  }

  if(viewMode === "list"){
    renderListView(main, sorted);
    return;
  }

  if(viewMode === "shelf"){
    renderShelfView(main, sorted);
    return;
  }
  
  
}
//========

//====シリーズ一覧だけを表示する
function renderSeriesBookList(){

//console.log("seriesMaster", seriesMaster);

	const main = document.getElementById("series-main");
	if(!main) return;
	main.innerHTML = "";
	
	//フィルタ
	const filtered =
		seriesMaster.filter(s =>
		
			(s.name || "")
				.toLowerCase()
				.includes(seriesSearchKeyword)
				
		);
				console.log(filtered);
		filtered.forEach(s=>{
		
		console.log(s.name);
		
			const d = document.createElement('div');
			d.className = "card";
			d.textContent = s.name;

		d.onclick = ()=> openSeries(s);
		main.appendChild(d);
	});
	//ソート
	//const sorted = sortSeries
	
}
//====================



//====カードビューモード
function renderCardView(main, books){

  books.forEach(b=>{

    const d = document.createElement("div");

    d.className = "card";

    d.innerHTML = `
      <div class="title">${b.title}</div>

      <div class="book-latest-date">
        ${getLatestReadDate(b) || "未読"}
      </div>
      
      <div class="book-read-count">
        ${b.dates?.length || 0}回
      </div>

      <div class="fav">
        ${getFavLabel(b.fav)}
      </div>
    `;

    d.onclick = ()=> openDetail(b);

    main.appendChild(d);
  });
}
//=================


//====リストビューモード
function renderListView(main, books){

  books.forEach(b=>{

    const row = document.createElement("div");

    row.className = "list-row";

    row.innerHTML = `
      <div class="list-title">
        ${b.title}
      </div>

      <div class="list-meta">
        ${getFavLabel(b.fav)}
        ${getLatestReadDate(b)}：
        ${b.dates?.length || 0}回
      </div>
    `;

    row.onclick = ()=> openDetail(b);

    main.appendChild(row);
  });
}
//=====================

//====背表紙ビューモード❤️
function renderShelfView(main, books){

  const shelf = document.createElement("div");

  shelf.className = "shelf-view";
  shelf.style.gap = "2px";

  books.forEach(b=>{

    const spine = createBookSpine(b);

    spine.onclick =
      ()=> openBookDetailModal(b);

    shelf.appendChild(spine);
  });

  main.appendChild(shelf);
}
//=================


//====設定用のカラーモード設定
let shelfColorMode =
  localStorage.getItem(
    "shelfColorMode"
    ) || "single";
//====================



//====月間読書グラフ表示
function renderMonthlyGraph(main, year){

  const counts = getMonthlyCounts(year);

  const wrap = document.createElement("div");

  wrap.style.marginTop = "20px";

  counts.forEach((c,i)=>{

    const row = document.createElement("div");

    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "8px";

    row.innerHTML = `
  <div style="
    width:70px;
    font-size:12px;
    flex-shrink:0;
  ">
    ${i+1}月 (${c}冊)
  </div>

  <div style="
    flex:1;
    height:12px;
    background:#eee;
    border-radius:999px;
    overflow:hidden;
  ">

    <div style="
      width:${c*5}px;
      height:100%;
      background:#78ccd2;
    ">
    </div>

  </div>
`;

    wrap.appendChild(row);

  });

  main.appendChild(wrap);
}
//==================



//本棚背表紙モード
function renderShelf(el, list){
  el.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.flexWrap = "wrap";
  wrap.style.alignItems = "flex-end";

  list.forEach(b=>{
    const spine = createBookSpine(b);
    wrap.appendChild(spine);
  });

  el.appendChild(wrap);
}
//========

//背表紙カラーモード変更描画
function renderColorMode(targetId = "color-mode"){
  const el = document.getElementById(targetId);
  if(!el) return;

  el.innerHTML = "";

  const modes = [
    { id: "single", label: "単色" },
    { id: "gradient", label: "グラデ" },
    { id: "stripe", label: "目印" }
  ];

  modes.forEach(m=>{
    const btn = document.createElement('button');
    btn.textContent = m.label;
    btn.className = "setting-btn";

    if(m.id === colorMode){
      btn.classList.add("active");
    }

    btn.onclick = ()=>{
      colorMode = m.id;
      localStorage.setItem("colorMode", colorMode);

      renderHome();              // 
      renderColorMode(targetId);
    };

    el.appendChild(btn);
  });
}
//========


//シリーズで表示をまとめる
function renderSeriesShelf(el, sorted){
  el.innerHTML = "";

  seriesMaster.forEach(s=>{
    const relatedBooks = sorted.filter(b =>
      Array.isArray(s.bookIds) && s.bookIds.includes(b.id)
    );

    if(!relatedBooks.length) return;

    const title = document.createElement('div');
    const isOpen = openedSeries[s.id];

    title.textContent =
      `${isOpen ? "▽" : "▶︎"} ${s.name} (${relatedBooks.length})`;

    title.style.cursor = "pointer";

    title.onclick = ()=>{
      openedSeries[s.id] = !openedSeries[s.id];
      renderHome();
    };

    el.appendChild(title);

    if(isOpen){
      const box = document.createElement('div');
      renderShelf(box, relatedBooks);
      el.appendChild(box);
    }
  });
}
//========


//小カードで最近読んだ本====
function renderRecentBooks(){
  const el = document.getElementById("recent-books");
  if(!el) return;

  // 日付でソート（新しい順）
  const sorted = [...books]
    .filter(b => b.dates?.length)
    .sort((a,b)=>{
      return getLatestReadDate(b).localeCompare(getLatestReadDate(a));
    })
    .slice(0,10);

  el.innerHTML = `
    <div class="section-title">♫最近読んだ本</div>
    <div class="carousel" id="recent-carousel"></div>
  `;

  const box = document.getElementById("recent-carousel");

  sorted.forEach(b=>{
    const d = document.createElement("div");
    d.className = "carousel-item";

    d.innerHTML = `
      <div style="font-weight:bold;">${b.title}</div>
      <div style="font-size:12px;color:#666;">
        ${getLatestReadDate(b)}
      </div>
      <div style="margin-top:4px;">
        ${getFavLabel(b.fav)}
      </div>
    `;

    d.onclick = ()=> openDetail(b);
    box.appendChild(d);
  });
}
//========

//カルーセル表示用の本棚
function renderShelfCarousel(el, sorted){

  el.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.className = "shelf-scroll";

  sorted.forEach(b=>{
    const spine = createBookSpine(b);
    wrap.appendChild(spine);
  });

  el.appendChild(wrap);
}
//========

//========
function renderRecent(){
  const el = document.getElementById("home-recent");
  if(!el) return;

  const list = getRecentBooks();

  if(!list.length){
    el.innerHTML = `<div style="color:#999;">まだ読了なし</div>`;
    return;
  }

  el.innerHTML = `
    <div class="settings-item" onclick="openSettingSelect('recent')">
  最近の本表示
  <div class="settings-value">${recentViewMode === "card" ? "カード" : "背表紙"}</div>
</div>
  `;

  list.forEach(b=>{
    const d = document.createElement("div");
    d.className = "card";

    d.innerHTML = `
      <div class="title">${b.title}</div>
      <div class="meta">${getLatestReadDate(b)}</div>
    `;

    d.onclick = ()=> openDetail(b);
    el.appendChild(d);
  });
}
//========

//今年：今月◯冊の表示
function renderSummary(main){
  const el = document.getElementById("home-summary");
  if(!el) return;

  const month = getMonthlyCount();
  const year = getYearlyCount();

  let html = `
    <div class="summary-box">
      <div class="summary-item">
        <div class="num">${year}</div>
        <div class="label">今年</div>
      </div>

      <div class="summary-item">
        <div class="num">${month}</div>
        <div class="label">今月</div>
      </div>
    </div>
  `;

  // 🎯 年間目標
  if(enableGoal){
    const rate = yearlyGoal
      ? Math.min(100, Math.round(year / yearlyGoal * 100))
      : 0;

    const color =
      rate < 30 ? "#e74c3c" :
      rate < 70 ? "#f1c40f" :
                  "#2ecc71";

    html += `
      <div class="goal-box">
        ★⭐︎★ ${year} / ${yearlyGoal}冊 (${rate}%)
        <div class="goal-bar">
          <div class="goal-fill" style="width:${rate}%; background:${color}"></div>
        </div>
      </div>
    `;
  }

  el.innerHTML = html;
}
//========


//========タイプフィルター（ウィッシュリスト）
function filterBooks(list){
  
  if(!list) return [];

  let arr = [...list];

  if(typeFilter !== "all"){

    arr = arr.filter(book => {

      if(typeFilter === "normal"){
        return book.type !== "wish";
      }

      if(typeFilter === "wish"){
        return book.type === "wish";
      }

      return true;
    });
  }

  return arr;
}
//========







//====タグフィルター描画
function renderTagFilter(){

  const area =
    document.getElementById("tag-filter");

  if(!area) return;

  area.innerHTML = "";

  tagMaster.forEach(tag=>{

    const btn =
      document.createElement("button");

    btn.className = "tag-chip";
    
    btn.textContent = tag.name;
    btn.style.fontSize = "10px";

    btn.style.background = "#fffffc";
    btn.style.color = tag.color || "#666";
    
    btn.style.border = `1px solid ${tag.color || "#ccc"}`;
    btn.style.borderRadius = "999px";

    if(selectedTagId === tag.id){
      btn.classList.add("active");
      btn.style.background = tag.color;
      btn.style.color = "#fffffc";
    }

    btn.onclick = ()=>{

      if(selectedTagId === tag.id){

        selectedTagId = null;

      }else{

        selectedTagId = tag.id;
      }

      renderHome();
    };

    area.appendChild(btn);
  });
}
//====================



//====ソートUI
function renderSort(targetId = "sort-mode"){
  const el = document.getElementById(targetId);
  if(!el) return;

  el.innerHTML = "";

  const modes = [
    { id: "title", label: "名前" },
    { id: "fav", label: "評価" },
    { id: "date", label: "日付" }
  ];

  modes.forEach(m=>{
    const btn = document.createElement('button');

    let arrow = "";
    if(m.id === sortKey){
      arrow = sortOrder === "asc" ? " ↑" : " ↓";
    }

    btn.textContent = m.label + arrow;
    btn.className = "setting-btn";

    if(m.id === sortKey){
      btn.classList.add("active");
    }

    btn.onclick = ()=>{
      if(sortKey === m.id){
        sortOrder = (sortOrder === "asc") ? "desc" : "asc";
      } else {
        sortKey = m.id;
        sortOrder = "asc";
      }

      localStorage.setItem("sortKey", sortKey);
      localStorage.setItem("sortOrder", sortOrder);

      renderHome();          // ！
      renderSort(targetId);
    };

    el.appendChild(btn);
  });
}
//========

//====カレンダー、統計ページの表示
function renderStats(){

  const main = document.getElementById("page-stats");
  main.innerHTML = "";

  const year = statsYear;

  main.innerHTML = `
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:16px;
    ">
      <button onclick="changeStatsYear(-1)">←</button>

      <h2>${year}年 統計</h2>

      <button onclick="changeStatsYear(1)">→</button>
    </div>
  `;


  
  //年間目標
  const yearlyCount = getYearReadCount(year);

const percent =
  Math.min(
    yearlyCount / yearlyGoal * 100,
    100
  );

const goal = document.createElement("div");

goal.style.margin = "16px 0";

goal.innerHTML = `
  <div style="
    font-size:14px;
    margin-bottom:6px;
  ">
    年間目標：
    ${yearlyCount} / ${yearlyGoal}冊
  </div>

  <div style="
    height:14px;
    background:#eee;
    border-radius:999px;
    overflow:hidden;
  ">

    <div style="
      width:${percent}%;
      height:100%;
      background:#aacf53;
    ">
    </div>

  </div>
  `;
  if(enableGoal){
      main.appendChild(goal);
  }
  
  renderSummary(main);
  renderMiniCalendar(main);
  renderMonthlyGraph(main, year);

// renderReadingHistory(main);
}
//========================

//====小さめ表示のカレンダー（統計ページ用）
function renderMiniCalendar(main){

  const now = miniMonth;
  const year = statsYear;
  const month = now.getMonth();

  // ===== ヘッダー =====

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.marginBottom = "8px";

  const prev = document.createElement("button");
  prev.textContent = "←";

  prev.onclick = ()=>{
    miniMonth.setMonth(miniMonth.getMonth() - 1);
    renderStats();
  };

  const title = document.createElement("div");
  title.textContent =
    `${year}年 ${month+1}月`;

  const next = document.createElement("button");
  next.textContent = "→";

  next.onclick = ()=>{
    miniMonth.setMonth(miniMonth.getMonth() + 1);
    renderStats();
  };

  header.append(prev);
  header.append(title);
  header.append(next);

  main.appendChild(header);

  // ===== 読書データ =====

  const map = {};

  books.forEach(b=>{
    (b.dates || []).forEach(date=>{
      map[date] = map[date] || [];
      map[date].push(b);
    });
  });

  // ===== カレンダー =====
  
  const firstDay =
    new Date(year, month, 1).getDay();

  const lastDate =
    new Date(year, month + 1, 0).getDate();

  const grid = document.createElement("div");

  grid.className = "mini-calendar";

  // 空白
  for(let i=0; i<firstDay; i++){
    grid.appendChild(
      document.createElement("div")
    );
  }

  // 日付
  for(let d=1; d<=lastDate; d++){

    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");

    const dateStr =
      year + "-" + mm + "-" + dd;

    const count =
      map[dateStr]?.length || 0;

    const cell =
      document.createElement("div");

    cell.className = "mini-day";

    cell.style.background =
      getHeatColor(count);

    // 今日
    const today =
      new Date().toISOString().slice(0,10);

    if(dateStr === today){
      cell.style.border =
        "2px solid #e94709";
    }

    cell.innerHTML =
      "<div>" + d + "</div>" +
      "<div>" + (count || "") + "</div>";

    cell.onclick = ()=>{
      if(!map[dateStr]) return;

      openDayModal(
        dateStr,
        map[dateStr]
      );
    };

    grid.appendChild(cell);
  }

  main.appendChild(grid);
}
//========================


//====カレンダー====
function renderCalendar(){

  const el = document.getElementById("page-calendar");
  if(!el) return;

  const now = currentMonth;
  const year = now.getFullYear();
  const month = now.getMonth();

  el.innerHTML = `
  <div style="display:flex;justify-content:space-between;align-items:center;">
    <button onclick="changeMonth(-1)">←</button>
    <h3>${year}年 ${month+1}月</h3>
    <button onclick="changeMonth(1)">→</button>
  </div>
`;

  const map = {};

  books.forEach(b=>{
    (b.dates || []).forEach(d=>{
      map[d] = map[d] || [];
      map[d].push(b);
    });
  });

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month+1, 0).getDate();
  const days = ["日","月","火","水","木","金","土"];

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(7,1fr)";
  grid.style.gap = "4px";
  
  grid.style.transition = "opacity 0.2s";
  grid.style.opacity = "0";
  
  setTimeout(()=>{
    grid.style.opacity ="1";
  },10);

    days.forEach((d,i)=>{
    const head = document.createElement("div");
    head.textContent = d;
    head.style.fontSize = "12px";
    head.style.textAlign = "center";
    head.style.fontWeight = "bold";
    
    //土日色
    if(i === 0) head.style.color = "#e74c3c"; //日曜
    if(i === 6) head.style.color = "#3498db"; //土曜
    
    grid.appendChild(head);
    });

  // 空白
  for(let i=0;i<firstDay;i++){
    grid.appendChild(document.createElement("div"));
  }

  // 日付セル
  for(let d=1; d<=lastDate; d++){
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    const cell = document.createElement("div");
    cell.style.border = "1px solid #ccc";
    cell.style.minHeight = "60px";
    cell.style.padding = "4px";
    cell.style.cursor = "pointer";
    cell.style.borderRadius = "8px";
    cell.style.fontWeight = "bold";

    const dayOfWeek = new Date(year, month, d).getDay();
    
    if(dayOfWeek === 0){
      cell.style.backgroundColor = "rgba(231,76,60,0.1)";
    }
    if(dayOfWeek === 6){
      cell.style.backgroundColor = "rgba(52,152,219,0.1)";
    }

    const count = map[dateStr]?.length || 0;

    //ヒートマップ
    let textColor = "#333"
    
    	if(count){
 	 const alpha = Math.min(count / 5, 1); //最大5冊でMAX色
 	 const color = getHeatColor(count);
 	 if(color){
  	 
		cell.style.background = color;
  		cell.style.color = count >= 3 ? "#fffffc" : "#333";
  		//textColor = alpha > 0.4 ? "#fffffc" : "#333";
	  }}

    
	//今日を強調
	const today = new Date().toISOString().slice(0,10);
	if(dateStr === today){
  	  cell.style.border = "2px solid #ac4f02";
	}

    cell.innerHTML = `
      <div style="font-size:12px;">${d}</div>
      <div style="font-size:12px;color:${textColor};">
        ${count ? count + "冊" : ""}
      </div>
    `;

    cell.onmouseenter = ()=>{
      cell.style.transform = "scale(1.05)";
    };
    
    cell.onmouseleave = ()=>{
      cell.style.transform = "scale(1)";
    };

    cell.onclick = ()=>{
      if(!map[dateStr]) return;
      openDayModal(map[dateStr]);
    };
    
    // ここが超重要
    grid.appendChild(cell);
  }

  el.appendChild(grid);
}
//========




// ◼️シリーズ一覧表示（骨組みだけ）
function renderSeries(){
  const list = document.getElementById('page-series');
  list.innerHTML = `
  		
  		<div id="series-top"></div>
  		<div class="series-main" id="series-main"></div>
  `;
	
	
	renderSeriesSearchArea();
	renderSeriesBookList();
	
}


//========
//====シリーズページの検索エリア
function renderSeriesSearchArea(){

	const top = document.getElementById("series-top");
	if(!top) return;
	
	top.innerHTML = `
	<button onclick="openAddSeriesModal()"
		class="add-btn">
			＋ シリーズ追加
		</button>
		
		<input
			id="search"
			placeholder="シリーズ検索..."
			value="${seriesSearchKeyword}"
			oninput="handleSeriesSearchInput()"
		>
		
			<select id="series-sort-select"
				onchange="changeSeriesSortMode()">
			
			<option value="read-desc">読了日新</option>
			<option value="read-asc">読了日古</option>
			
			<option value="title-asc">タイトル↑</option>
			<option value="title-desc">タイトル↓</option>
			</select>
		
		<div id="suggest"></div>
	`;
	
}
//=======




//========
function renderList(el, sorted){
  el.innerHTML = "";

  const listWrap = document.createElement("div");
  listWrap.className = "list-grid";

  sorted.forEach(b=>{
    const d = document.createElement('div');
    d.className = "list-card";

    d.innerHTML = `
      <div class="title">${b.title}</div>
      <div>${getLatestReadDate(b)}</div>
      <div>${getFavLabel(b.fav)}</div>
    `;

    d.onclick = ()=> openDetail(b);

    listWrap.appendChild(d);
  });

  el.appendChild(listWrap);
}
//========

//表示制御====
function applyUIVisibility(page){
  const master = (uiMode === "on");

  const search = (document.getElementById("search")?.value || "").toLowerCase();
  const summary = document.getElementById("home-summary");
  const tags = document.getElementById("tag-filter");
  const type = document.getElementById("type-filter");
  const recent = document.getElementById("recent-books");

  // 🔍 検索
  if(search){
    if(master && ["home","series","characters","calendar"].includes(page)){
      search.style.display = "block";
    } else {
      search.style.display = "none";
    }
  }

  const isHome = (page === "home" && master);

  if(summary) summary.style.display = (isHome && uiSettings.summary) ? "block" : "none";
  if(tags) tags.style.display = (isHome && uiSettings.tags) ? "flex" : "none";
  if(type) type.style.display = (isHome && uiSettings.type) ? "flex" : "none";
  if(recent) recent.style.display = (isHome && uiSettings.recent) ? "block" : "none";
}
//========



//====キャラクターページ====
function renderCharacters(){
  const el = document.getElementById('page-characters');
  el.innerHTML = "";

  characters.forEach(c=>{
    const d = document.createElement('div');
    d.className = "card";
    d.textContent = c.name;

    d.onclick = ()=> openCharacter(c);

    el.appendChild(d);
  });
}
//===========

//🔧====設定ページ====
function renderSettings(){
  const el = document.getElementById("page-settings");
  if(!el) return;
  
 
  
  el.innerHTML = `
    <h2 style="padding:12px;">設定</h2>

  <div class="setting-card">
    <div class="setting-card-title" onclick="toggleSettingSection('home')">
    ${settingSections.home
    ? "▽"
    : "▶︎"}
    ホーム表示設定</div>
    
    ${settingSections.home
    ? `
    <!--背表紙-->
    <div class="setting-row">
      <span>背表紙カラー</span>
      <button onclick="changeShelfColorMode()">
        背表紙カラー：${getShelfColorModeLabel()}
      </button>
    </div>
    
    <!--並び順-->
    <div class="setting-row">
      <span>並び順</span>
      <button onclick="changeDefaultSort()">
        ${getSortModeLabel()}
      </button>
    </div>
    
    <!--表示タイプ-->
    <div class="setting-row">
      <span>表示タイプ</span>
      <button onclick="changeDefaultType()">
        ${getTypeModeLabel()}
      </button>
    </div>
    
    <!--テーマカラー-->
    <div class="setting-row">
      <span>テーマカラー</span>
      ---
    </div>
    
    <!--フォントサイズ-->
    <div class="setting-row">
      <span>フォントサイズ</span>
      ---
    </div>
    
    <!--最近の本-->
    <div class="setting-row">
      <span>最近の本</span>
      ---
    </div>
    
    <!--サマリー-->
    <div class="setting-row">
      <span>サマリー</span>
      ---
    </div>
`
: ""}
  </div>
  
  
  <div class="setting-card">
    <div class="setting-card-title"onclick="toggleSettingSection('input')">
    ${settingSections.input
    ? "▽"
    : "▶︎"}入力設定</div>
      ${settingSections.input
    ? `
    <!--メモエリア-->
    <div class="setting-row">
      <span>メモエリア</span>
      <button onclick="toggleMemo()">
        ${
          enableMemo
            ? "📝 メモ表示：ON"
            : "📝 メモ表示：OFF"
          }
        </button>
      </div>
  
    <!--タグの使用-->
    <div class="setting-row">
      <span>タグの使用</span>
      ---
    </div>

    <!--引用-->
    <div class="setting-row">
      <span>引用</span>
      ---
    </div>

    <!--再読チェック-->
    <div class="setting-row">
      <span>再読チェック</span>
      ---
    </div>

    <!--サジェスト-->
    <div class="setting-row">
      <span>サジェスト</span>
      ---
    </div>
`
: ""}
  </div>

  <div class="setting-card">
    <div class="setting-card-title" onclick="toggleSettingSection('stats')">
    ${settingSections.stats
    ? "▽"
    : "▶︎"}統計設定</div>
  
      ${settingSections.stats
    ? `
    <!--年間目標-->
    <div class="setting-row">
      <span>年間目標</span>
      <div class="switch ${enableGoal ? "on" : ""}"             
        onclick="toggleGoal(event)"></div>
      <div class="settings-item">
        目標冊数
        <input 
          type="number" 
          value="${yearlyGoal}" 
          min="1"
          style="width:80px;"
          onchange="changeGoal(this.value)">
       </div>
    </div>  

    <!--カレンダー-->
    <div class="setting-row">
      <span>カレンダー</span>
      ---
    </div>

    <!--グラフ-->
    <div class="setting-row">
      <span>グラフ</span>
      ---
    </div>
`
: ""}
  </div>
   
 
   <div class="setting-card">
  <div
    class="setting-card-title"
    onclick="toggleSettingSection('tags')"
  >

    ${settingSections.tags
      ? "▽"
      : "▶︎"
    }

    タグ設定

  </div>

  ${settingSections.tags
    ? `

    <div class="setting-row">

      <span>タグの編集</span>

    </div>
       <div class="tag-add-area">

  <input
    id="new-tag-name"
    placeholder="新しいタグ">

  <div class="tag-color-palette">

    ${tagColors.map(color => `

      <button
        class="
          color-dot
          ${newTagColor === color
            ? "active"
            : ""
          }
        "

        style="background:${color};"

        onclick="
          selectNewTagColor('${color}')
        ">
      </button>

    `).join("")}

  </div>

  <button onclick="addTag()">
    ＋タグ追加
  </button>

</div>


    ${tagMaster.map(tag => `

      <div class="tag-edit-item">

        <div class="setting-row">

          <span
            class="tag-chip"
              style="
                background:${tag.color};
                color:white;
              "
            >
              ${tag.name}
            </span>

          <button
            onclick="
              openTagEditor('${tag.id}')
            "
          >
            編集
          </button>
          
          <button
            class="danger-button"
            onclick="deleteTag('${tag.id}')"
          >
            削除
          </button>

        </div>

        ${editingTagId === tag.id
          ? `

          <div class="tag-edit-area">

            <input
              id="edit-tag-name"
              value="${tag.name}">

            <div class="tag-color-palette">

              ${tagColors.map(color => `

                <button

                  class="
                    color-dot
                    ${editingTagColor === color
                      ? "active"
                      : ""
                    }
                  "

                  style="
                    background:${color};
                  "

                  onclick="
                    selectTagColor('${color}')
                  "

                >
                </button>

              `).join("")}

            </div>

            <button onclick="saveTagEdit('${tag.id}')">
              保存
            </button>

            <button
              onclick="
                closeTagEditor()
              "
            >
              キャンセル
            </button>

          </div>

          `
          : ""
        }

      </div>

    `).join("")}

    `
    : ""
  }

</div>
   

  <div class="setting-card">
    <div class="setting-card-title"onclick="toggleSettingSection('datas')">
    ${settingSections.datas
    ? "▽"
    : "▶︎"}データ</div>
    
      ${settingSections.datas
    ? `
    <!--エクスポート-->
    <div class="setting-row">
      <span>インポート</span>
      ---
    </div>  

    <!--インポートー-->
    <div class="setting-row">
      <span>インポート</span>
      ---
    </div>

    <!--バックアップ-->
    <div class="setting-row">
      <span>バックアップ</span>
      ---
    </div>
    
    <!--同期-->
    <div class="setting-row">
      <span>Firestore同期</span>
      ---
    </div>
`
: ""}
  </div>

    <button onclick="go('home')" style="margin:16px;">← 戻る</button>
  `;  
}
//==========


//====セッティングの汎用切り替えボタン
function cycleSetting({

  current,
  list

}){

  const index =
    list.indexOf(current);

  const next =
    (index + 1) % list.length;

  return list[next];
}
//==================


//UIの表示制御ベース
function applyUIVisibility(page){
  const show = (uiMode === "on");

  // 要素取得
  const search = (document.getElementById("search")?.value || "").toLowerCase();
  const summary = document.getElementById("home-summary");
  const tags = document.getElementById("tag-filter");
  const type = document.getElementById("type-filter");
  const recent = document.getElementById("recent-books");

  // 検索バー
  if(search){
    if(show && ["home","series","characters","calendar"].includes(page)){
      search.style.display = "block";
    } else {
      search.style.display = "none";
    }
  }

  //  ホーム限定UI
  const homeOnly = (show && page === "home");

  if(summary) summary.style.display = homeOnly ? "block" : "none";
  if(tags) tags.style.display = homeOnly ? "flex" : "none";
  if(type) type.style.display = homeOnly ? "flex" : "none";
  if(recent) recent.style.display = homeOnly ? "block" : "none";
}
//========

//========
function toggleUIMode(e){
  e.stopPropagation();

  uiMode = (uiMode === "on") ? "off" : "on";
  localStorage.setItem("uiMode", uiMode);

  renderSettings();
  go('home'); // 再適用
}
//↑↓同じかも↑↓========
function toggleUI(e){
  e.stopPropagation();

  uiMode = (uiMode === "on") ? "off" : "on";
  localStorage.setItem("uiMode", uiMode);

  renderSettings();
  renderHome();
  applyUIVisibility("home"); // ←即反映
}
//========

//========
function toggleUIItem(e, key){
  e.stopPropagation();

  uiSettings[key] = !uiSettings[key];
  localStorage.setItem("uiSettings", JSON.stringify(uiSettings));

  renderSettings();
  updateUIVisibility("home"); // ←追加
  renderHome();
}
//========


//====設定ページエリアトグル開閉設定
function toggleSettingSection(key){

  settingSections[key] =
    !settingSections[key];

  localStorage.setItem(

    "settingSections",

    JSON.stringify(
      settingSections
    )
  );

  renderSettings();
}
//======================


//====シリーズ詳細ページトグル開閉設定
function toggleSeriesSection(key){
  seriesSections[key] =
    !seriesSections[key];
    
  localStorage.setItem(
    "seriesSections",
    JSON.stringify(
      seriesSections
    )
  );
  
  openSeries(s);
}
//======================




//「次の画面」っぽいやつ====
function openSettingSelect(type){
  const el = document.getElementById("page-settings");

  let list = [];

  if(type === "view"){
    list = [
      {id:"card", label:"カード"},
      {id:"shelf", label:"本棚"},
    ];
  }

  if(type === "color"){
    list = [
      {id:"single", label:"単色"},
      {id:"gradient", label:"グラデ"},
      {id:"stripe", label:"目印"}
    ];
  }

  if(type === "sort"){
    list = [
      {id:"title", label:"名前"},
      {id:"fav", label:"評価"},
      {id:"date", label:"日付"}
    ];
  }

  if(type === "recent"){
    list = [
      {id:"card", label:"カード"},
      {id:"spine", label:"背表紙"}
    ];
  }

  el.innerHTML = `
    <h2 style="padding:12px;">選択</h2>
    <div class="settings-list" id="select-list"></div>
    <button onclick="renderSettings()" style="margin:16px;">← 戻る</button>
  `;

  const listEl = document.getElementById("select-list");
  listEl.innerHTML = "";

  list.forEach(item=>{
    const d = document.createElement("div");
    d.className = "settings-item";

    const selected =
      (type==="view" && item.id===viewMode) ||
      (type==="color" && item.id===colorMode) ||
      (type==="sort" && item.id===sortKey) ||
      (type==="recent" && item.id===recentViewMode);

    d.innerHTML = `
      ${item.label}
      <div>${selected ? "✔️" : ""}</div>
    `;

    d.onclick = ()=>{
      if(type==="view") viewMode = item.id;
      if(type==="color") colorMode = item.id;
      if(type==="sort") sortKey = item.id;
      if(type==="recent") recentViewMode = item.id;

      localStorage.setItem("viewMode", viewMode);
      localStorage.setItem("colorMode", colorMode);
      localStorage.setItem("sortKey", sortKey);
      localStorage.setItem("recentViewMode", recentViewMode);

      renderSettings();
      renderHome();
    };

    listEl.appendChild(d);
  });
}
//========

//========
function updateUIVisibility(page){

  const showUI = uiSettings; // 略

  const search = (document.getElementById("topbar")?.value || "").toLowerCase();
  const summary = document.getElementById("home-summary");
  const recent = document.getElementById("recent-books");
  const tags = document.getElementById("tag-filter");
  const type = document.getElementById("type-filter");

  // ● 全OFF
  if(!showUI.recent && !showUI.summary && !showUI.tags && !showUI.type){
    if(search) search.style.display = "none";
    if(summary) summary.style.display = "none";
    if(recent) recent.style.display = "none";
    if(tags) tags.style.display = "none";
    if(type) type.style.display = "none";
    return;
  }

  // ● 検索バー
  const showSearchPages = ["home","calendar","series","characters"];
  if(search){
    search.style.display =
      showSearchPages.includes(page) ? "flex" : "none";
  }

  // ● ホームだけ
  if(page === "home"){
    if(summary) summary.style.display = showUI.summary ? "block" : "none";
    if(recent) recent.style.display = showUI.recent ? "block" : "none";
    if(tags) tags.style.display = showUI.tags ? "flex" : "none";
    if(type) type.style.display = showUI.type ? "flex" : "none";
  } else {
    // 他ページは全部消す
    if(summary) summary.style.display = "none";
    if(recent) recent.style.display = "none";
    if(tags) tags.style.display = "none";
    if(type) type.style.display = "none";
  }
}
//========







//⬛︎⑤====イベント・操作系====
//ユーザーの操作・openDetail、Toggle系、set系

//=============モーダル置き場

//⬛︎本の追加モーダル==========
function openAddBookModal(){

  const modal = document.createElement("div");
  modal.className = "modal-bg";
  modal.id = "add-book-modal";

  modal.innerHTML = `
    <div class="modal-box">

      <h2>本を追加</h2>


      <input id="add-title"
        type="text"
        placeholder="タイトル"
        oninput="renderTitleSuggest()"
        >
      <div id="title-suggest"></div>
      
      <div class="field">
        <div class="field-label">読了日</div>

        <input type="date" id="add-date">
      </div>
      <select id="add-fav">
        <option value="0">評価なし</option>
        <option value="1">★</option>
        <option value="2">★★</option>
        <option value="3">★★★</option>
        <option value="4">👑</option>
      </select>

      ${enableMemo ? `
      <textarea id="add-memo"
        placeholder="メモ"></textarea>` : ""}

        <button onclick="saveNewBook()">
          ＋本棚
        </button>

        <button onclick="addBook('wish')">
          ＋WishList
        </button>

        <button onclick="closeModal('add-book-modal')">×</button>
            </div>
  `;

  document.body.appendChild(modal);
}
//========

//====シリーズの追加モーダル
function openAddSeriesModal(){

	const modal = document.createElement("div");
	modal.className = "modal-bg";
	modal.id = "add-series-modal";
	
	modal.innerHTML = `
		<div class="modal-box">
		
			<h2>シリーズを追加</h2>
			
			<input id="add-series-title"
				type="text"
				placeholder="シリーズタイトル"
				oninput="renderTitleSuggest()">
			<div id="title-suggest"></div>
			
			<div class="field">
				<div class="field-label">関連対象を登録</diV>
				<input id=""
					type="text"
					placeholder="作品／人物名"
					oninput="renderSeriesSuggest();
						renderCharacterSuggest();">
				<button onclick="">
					＋
				</button>

				<button onclick="saveNewSeries()">＋追加</button>
				
				<button onclick="closeModal('add-series-modal')">×</button>
				
			</div>
`;
	document.body.appendChild(modal);
	//関連対象一時表示エリア、複数は最新3件まで表示とかに制限したい
}
//==================

//====本追加モーダルを閉じる
function closeModal(id){

  document
    .getElementById(id)
    ?.remove();
}
//========================


//====ソートモードの切替え（本）
function changeSortMode(){

  sortMode =
    document.getElementById("sort-select").value;

  renderBookList();
}
//================

//====ソートモード切替え（シリーズ）
function changeSeriesSortMode(){

	sortMode =
		document.getElementById("series-sort-select").value;
		
		renderSeries();

}
//=================

//====ソートモード切替え（キャラ）

//=================


//====本棚のビューモード切替え
function changeViewMode(mode){

  viewMode = mode;

  localStorage.setItem(
    "viewMode",
    viewMode
  );

  renderBookList();
}
//================



//====背表紙カラー切り替え
const shelfColorModes = [
  "single",
  "gradient",
  "stripe"
];

function changeShelfColorMode(){

  colorMode =
    cycleSetting({

      current:
        colorMode,

      list:
        shelfColorModes

    });

  localStorage.setItem(
    "colorMode",
    colorMode
  );

  renderSettings();
  renderHome();
}
//===============


//====デフォルト並び順切り替え
const sortModes = [
  "read-desc",
  "read-asc",
  "title-asc",
  "title-desc",
  "rating-desc",
  "rating-asc"
];

function changeDefaultSort(){
  sortMode =
    cycleSetting({
      current:
        sortMode,
      
      list:
        sortModes
     });
     
   localStorage.setItem(
     "sortMode",
     sortMode
   );
   
   renderSettings();
   renderHome();
}
//===============

//====デフォルト表示タイプ切り替え
const typeModes = [
  "all",
  "normal",
  "wish"
];

function changeDefaultType(){
  typeFilter =
    cycleSetting({
      current:
        typeFilter,
      list:
        typeModes
      });
    localStorage.setItem(
      "typeFilter",
      typeFilter
    );
    
    renderSettings();
    renderHome();
}
//===============




// 本詳細
function openDetail(book){
  go('detail');

  const el = document.getElementById('page-detail');
 
  const relatedSeries = seriesMaster.filter(s=>{
    return Array.isArray(s.bookIds) && s.bookIds.includes(book.id);
  });

  const relatedCharacters = characters.filter(c=>{
    return relatedSeries.some(s =>
      Array.isArray(c.seriesIds) && c.seriesIds.includes(s.id)
    );
  });

// ① HTML
el.innerHTML = `
	<h2>${book.title}</h2>
	<div id="action-bar">
		<button onclick="go('home')">戻る</button>
		<button id="fav-btn">評価 ${getFavLabel(book.fav)}</button>
		<button id="type-btn">${book.type === "wish" ? "📥 本棚に入れる" : "♥️ ウィッシュに追加"}</button>
		<button id="add-date-btn">
		${book.dates?.length ? "🔂再読" : "✔️読了にする"}</button>
	</div>
<br>

<div>
  読了日:${(book.dates && book.dates.length > 0)
    ? book.dates.map((d,i)=>`
      <div>
        ${d}
        <span onclick="removeDate('${book.id}', ${i})" style="color:red;cursor:pointer;">  ：  削除  ：  </span>
        <span onclick="editDate('${book.id}', ${i})" style="cursor:pointer;">編集</span>
      </div>
    `).join("")
    : `<span style="color:gray;">🔖未読</span>`
  }
</div>

    <div style="margin-top:10px;">
      ${book.memo || ""}
    </div>

    <hr>

    <div>
      シリーズ:
      ${relatedSeries.map(s=>`
        <span style="color:blue;cursor:pointer"
          onclick="openSeriesById('${s.id}')">
          ${s.name}
        </span>
      `).join(", ") || "なし"}
    </div>

 
  `;

// ② 登場人物エリア
el.innerHTML += `
	<hr>
	<div>登場人物:</div>
	<div id="book-chars"></div>
	
  `;


  //評価ボタン
  const favBtn = document.getElementById('fav-btn');
  //読了ボタン
  const addBtn = document.getElementById('add-date-btn');
  //ウィッシュ切替ボタン
  const typeBtn = document.getElementById('type-btn');
  //ボタンたち
  const actionBar = document.getElementById('action-bar');
  actionBar.style.display = "flex";
  actionBar.style.alignItems = "center";
  actionBar.style.gap = "8px";
  actionBar.style.margin = "8px 0";
  actionBar.style.flexWrap = "wrap";
  
   const badge = createReadBadge(book);
  actionBar.appendChild(badge);
  badge.style.cursor = "pointer";
  
  badge.onclick = ()=>{
  	alert(book.dates?.join("\n") || "未読");
  };
  
  styleChip(favBtn, true); //評価は強調
  styleChip(addBtn, false); //読了は通常
  

//  favBtn.style.transition = "transform 0.1s";

//評価変更
  favBtn.onclick = ()=>{
    pressEffect(favBtn);
    book.fav = (book.fav || 0) + 1;

    if(book.fav > 4) book.fav = 1;

	saveData();
	openDetail(book);
    //setTimeout(renderHome, 0);
  };
  
  
//読了日追加
addBtn.onclick = ()=>{
	pressEffect(addBtn);
  const today = new Date().toISOString().slice(0,10);

  if(!Array.isArray(book.dates)){
    book.dates = [];
  }

  book.dates.push(today);

  saveData();
  openDetail(book); // 再描画
};

typeBtn.onclick = ()=>{
	pressEffect(typeBtn);
	
	book.type = (book.type === "wish") ? "normal" : "wish";
	
	saveData();
	openDetail(book);
	};
  
  

  // ⭐ 登場人物描画（←ここに入れる！！）
  const list = document.getElementById('book-chars');

  if(!relatedCharacters.length){
    list.innerHTML = '<div style="color:gray;">（人物なし）</div>';
  } else {
    relatedCharacters.forEach(c=>{
      const d = document.createElement('div');
      d.className = "card";
      d.textContent = c.name;

      d.onclick = ()=> openCharacter(c);

      list.appendChild(d);
    });
  }
}
//===============


//====本詳細モーダル========
//====本詳細モーダル====================
function openBookDetailModal(book){

  currentDetailFav = book.fav || 0;

  const modal = document.createElement("div");
  modal.className = "modal-bg";
  modal.id = "open-book-modal";

  modal.innerHTML = `
    <div class="modal-box detail-modal">

      <button class="close-btn" onclick="closeModal(open-book-modal)">
        ×
      </button>

      <input id="detail-title" class="detail-title"
        value="${book.title || ""}">

     <div class="detail-fav-wrap">

       <button
         class="fav-cycle-btn"
         onclick="cycleFav('${book.id}')">評価：
           ${
              ["0","★","★★","★★★","👑"][book.fav || 0]
            }
       </button>

     </div>

      <div class="detail-row">
        状態：
        ${
          book.type === "wish"
          ? "❤️ウィッシュ"
          : "📚本棚"
        }：${book.dates?.length || 0}回読了
      </div>

     <div class="detail-row">
  読了日：

  ${
    book.dates?.length
    ? [...book.dates]
        .sort((a,b)=>b.localeCompare(a))
        .map(date=>`

          <div class="date-tag">

            ${date}

            <button
              class="mini-delete-btn"
              onclick="removeReadDate('${book.id}','${date}')"
            >
              ✕
            </button>

          </div>

        `).join("")
    : "未読"
  }

</div>
      
      <div class="detail-date-add">
      <input type="date" id="readDate-${book.id}">
      <button onclick="addReadDate('${book.id}')">
        ＋読了日追加
      </button>
      </div>

      <div class="detail-tags">
        ${(book.tagIds || []).map(id=>{

          const tag =
            tagMaster.find(t=>t.id===id);

          return tag
            ? `<span class="tag">${tag.name}</span>`
            : "";

        }).join("")}
      </div>

      ${enableMemo ? `
      <textarea id="editMemo">
        ${book.memo || ""}
      </textarea>
      ` : ""}

      <button onclick="saveDetail('${book.id}')">
        保存
      </button>

      <button class="danger-btn"
        onclick="deleteBook('${book.id}')">
        🗑 削除
      </button>
       
    </div>
  `;

  document.body.appendChild(modal);
}
//=================================



//本詳細でシリーズを開く
function openSeriesById(id){
  const s = seriesMaster.find(x=>x.id === id);
  if(s) openSeries(s);
}
//========


//タグ収納トグル
function setupTagToggle(){
  const btn = document.getElementById('toggle-tags');
  const el = document.getElementById('tag-filter');
  if(!btn || !el) return;

  function update(){
    el.style.display = showTags ? "flex" : "none";
  }

  update();

  btn.onclick = ()=>{
    showTags = !showTags;
    localStorage.setItem("showTags", showTags);
    update();
  };
}
//========



//カレンダー開くやつ
function openCalendar(){
  go('calendar');
  renderCalendar();
}
//========


//========
function openDetailById(id, suggestId){

  const book = books.find(b => b.id === id);

  if(!book) return;

  openDetail(book);

  const suggest =
    document.getElementById(suggestId);

  if(suggest){
    suggest.innerHTML = "";
  }
}
//========

//カレンダーの日モーダル設定====
function openDayModal(dateStr, list){
  const m = document.createElement("div");
  m.style.position = "fixed";
  m.style.top = 0;
  m.style.left = 0;
  m.style.right = 0;
  m.style.bottom = 0;
  m.style.background = "rgba(0,0,0,0.5)";
  m.style.display = "flex";
  m.style.alignItems = "center";
  m.style.justifyContent = "center";

  const box = document.createElement("div");
  box.style.background = "#fffffc";
  box.style.padding = "20px";
  box.style.maxHeight = "80%";
  box.style.overflow = "auto";
  box.style.borderRadius = "12px";
  box.style.minWidth = "200px";

  list.forEach(b=>{
    const d = document.createElement("div");
    d.style.padding = "6px 0";
    d.style.borderBottom = "1px solid #eee";
    
    d.innerHTML = `
      <div style="font-weight:bold">${b.title}</div>`;

    d.onclick = ()=>{
      m.remove();
      openDetail(b);
    };
    
    box.appendChild(d);
  });

  m.appendChild(box);
  m.onclick = ()=> m.remove();
  box.onclick = (e)=>{
    e.stopPropagation();
  };

  document.body.appendChild(m);
}
//========



//本のビュー切り替え
function setView(mode){
  viewMode = mode;
  localStorage.setItem("viewMode", mode);
  renderHome();
}
//========


//========
function setTypeFilter(type){
  selectedType = type;

  renderHome();
}
//========



//★★ワンクリックでタイプ切替
function toggleType(book){
	book.type = (book.type === "wish") ? "normal" : "wish";
	saveData();
	openDetail(book);
}
//========




// シリーズ詳細====
function openSeries(s){
  go('detail');

  const el = document.getElementById('page-detail');

	//シリーズ→本
  const relatedBooks = books.filter(b=>{
    return Array.isArray(s.bookIds) && s.bookIds.includes(b.id);
  });
  	
 	 //シリーズ→人物
  const relatedCharacters = characters.filter(c=>{
  return Array.isArray(c.seriesIds) && c.seriesIds.includes(s.id);
  });
  

//シリーズ関連：本HTML表示
  el.innerHTML = `
    <button onclick="go('series')">戻る</button>
    
    <h2>${s.name}</h2>
    <div>冊数: ${relatedBooks.length}</div>
    <hr>

<div class="series-detail-layout">

<div class="series-section">

  <div
    class="series-section-title"
    onclick="toggleSeriesSection('books')"
  >
    ▼ 関連作品
  </div>

  ${
    seriesSections.books
      ? `
        <div class="series-section-body">
          <div id="series-books"></div>
        </div>
      `
      : ""
  }

</div>

<div class="series-section">

  <div
    class="series-section-title"
    onclick="toggleSeriesSection('books')"
  >
    ▼ 関連人物
  </div>

  ${
    seriesSections.books
      ? `
        <div class="series-section-body">
           <div id="series-chars"></div>
        </div>
      `
      : ""
  }

</div>

</div>

`;

//シリーズ関連：本描画
  const list = document.getElementById('series-books');

//追加
if(viewMode.startsWith("shelf")){
	renderShelf(list, relatedBooks);
} else {
	relatedBooks.forEach(b=>{
    const d = document.createElement('div');
    d.className = "card";
    d.textContent = b.title;

    d.onclick = ()=> openDetail(b);
    list.appendChild(d);
  });
  }
  
  
  //シリーズ関連：人物描画
const list2 = document.getElementById('series-chars');

if(!relatedCharacters.length){
  list2.innerHTML = '<div style="color:gray;">（人物なし）</div>';
} else {
  relatedCharacters.forEach(c=>{
    const d = document.createElement('div');
    d.className = "card";
    d.textContent = c.name;

    d.onclick = ()=> openCharacter(c);

    list2.appendChild(d);
  });
}
}
//========

//人物詳細====
function openCharacter(c){
  go('detail');

  const el = document.getElementById('page-detail');

 // 人物→シリーズ
  const relatedSeries = seriesMaster.filter(s=>{
    return Array.isArray(c.seriesIds) && c.seriesIds.includes(s.id);
  });

  // 人物→本
  const relatedBooks = books.filter(b=>{
    return relatedSeries.some(s =>
     Array.isArray(s.bookIds) && s.bookIds.includes(b.id)
   );
  });

  // HTML
  el.innerHTML = `
    <h2>${c.name}</h2>

    <div style="margin-bottom:10px;">
      ${c.memo || ""}
    </div>

   <hr>

    <div>シリーズ:</div>
    <div id="char-series"></div>

    <button onclick="go('characters')">戻る</button>
  `;

  // 本セクション追加
  el.innerHTML += `
    <hr>
    <div>登場作品:</div>
    <div id="char-books"></div>
  `;

  // シリーズ描画
  const list = document.getElementById('char-series');

  relatedSeries.forEach(s=>{
    const d = document.createElement('div');
    d.className = "card";
    d.textContent = s.name;

    d.onclick = ()=> openSeries(s);

    list.appendChild(d);
  });

  // 本描画
  const list3 = document.getElementById('char-books');

  relatedBooks.forEach(b=>{
    const d = document.createElement('div');
    d.className = "card";
    d.textContent = b.title;

    d.onclick = ()=> openDetail(b);

    list3.appendChild(d);
  });
}//function openCharacter()おわり
//========





//====タグエディタ「編集開く」
function openTagEditor(id){

  editingTagId = id;
  
  const tag =
    tagMaster.find(
      t => t.id === id
    );
  
  if(tag){
    editingTagColor = tag.color;
  }

  renderSettings();
}
//=====================

//====タグエディタ「閉じる」
function closeTagEditor(){

  editingTagId = null;

  renderSettings();
}
//=====================






//========
function toggleGoal(e){
  e.stopPropagation();

  enableGoal = !enableGoal;
  localStorage.setItem("enableGoal", enableGoal);

  renderSettings();
  renderHome(); // 即反映
}
//========


//トグル動作==
function toggleTagFilter(){

  showTagFilter = !showTagFilter;
  
  localStorage.setItem(
    "showTagFilter",
    showTagFilter
  );

  renderHome();
}
//========

//====モーダル版日付削除処理
async function removeReadDate(bookId,date){

  const book =
    books.find(b=>b.id==bookId);

  if(!book) return;

  book.dates =
    (book.dates || [])
      .filter(d=>d !== date);

  if(book.dates.length === 0){
    book.type = "wish";
  }

  await saveData();

  closeModal();
  openBookDetailModal(book);
}
//======================



//====日付削除
function removeDate(bookId, index){
  const b = getBookById(bookId);
  if(!b || !b.dates) return;

  b.dates.splice(index,1);

  saveData();
  openDetail(b);
}
//========


//====日付編集
function editDate(bookId, index){
  const b = books.find(x=> String(x.id) === String(bookId));
  if(!b || !b.dates) return;

  const input = document.createElement('input');
  input.type = "date";
  input.value = b.dates[index];

  input.onchange = ()=>{
    if(input.value){
      b.dates[index] = input.value;
      
      saveData();
      openDetail(b);
    }
  };

  input.onblur = ()=>{
    input.remove();
  };

  document.body.appendChild(input);
  input.focus();
}
//========





//====本を追加保存=================
async function saveNewBook(){

  const title =
    document.getElementById("add-title").value.trim();

  if(!title){
    alert("タイトルを入力してね！");
    return;
  }

  const date =
    document.getElementById("add-date").value;

  const memo =
    document.getElementById("add-memo").value;

  const book = {
    id: Date.now().toString(),
    title,
    memo,
    fav: 0,
    dates: date ? [date] : [],
    tagIds: [],
    type: date ? "normal" : "wish"
  };

  books.unshift(book);

  await saveData();
  showToast(`「${book.title}」を追加しました`);

  closeModal();

  renderHome();
}
//==============================

//======ウィッシュリストに本を追加
async function addBook(type){

  const title =
    document.getElementById("add-title").value.trim();

  if(!title){
    alert("タイトルを入力してください");
    return;
  }

  const date =
    document.getElementById("add-date").value;

  const fav =
    Number(document.getElementById("add-fav").value);

  const memo =
    document.getElementById("add-memo").value;

  const newBook = {
    id: Date.now().toString(),

    title,
    fav,
    memo,

    type,

    dates: date ? [date] : [],

    tagIds: []
  };

  books.unshift(newBook);

  await saveData();
  showToast(`「${book.title}」をウィッシュに追加しました`);

  closeModal();

  renderHome();
}
//================


//====新規シリーズ追加処理
async function saveNewSeries(){

  const title =
    document.getElementById(
      "add-series-title"
    ).value.trim();

  if(!title) return;

  seriesMaster.push({

    id:
      "s" + Date.now(),

    name:
      title

  });

  await saveData();

  closeModal(
    "add-series-modal"
  );

  renderSeries();

}
//==================




//====新規タグ追加
async function addTag(){

  const input =
    document.getElementById("new-tag-name");

  if(!input) return;

  const name =
    input.value.trim();

  if(!name){

    alert("タグ名を入力してください");
    return;
  }

  tagMaster.push({

    id: "t" + Date.now(),

    name,

    color: newTagColor

  });

  await saveData();

  input.value = "";

  newTagColor = "#7b8d8e";

  renderSettings();
}
//================


//====詳細保存================
async function saveDetail(id){

  console.log("save start", id);

  const book =
    books.find(b=>String(b.id)===String(id));

  console.log("found book", book);

  if(!book) return;

  console.log(
    document.getElementById("detail-title").value
  );

  book.title =
    document.getElementById("detail-title").value;

 if(enableMemo){
   const memoEl =
     document.getElementById("editMemo");
     
     book.memo =
       memoEl?.value || "";
  }

  book.fav = currentDetailFav;

  console.log("after edit", book);

  await saveData();

showToast("保存しました！");

  closeModal();

  renderHome();
}
//===========================


//====保存通知
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
//==============


//==============
async function addReadDate(id){

  const book =
    books.find(b=>String(b.id)===String(id));

  if(!book) return;

  const input =
    document.getElementById(`readDate-${id}`);

  if(!input.value) return;

  if(!book.dates){
    book.dates = [];
  }

  book.dates.unshift(input.value);

  // 本棚へ移動
  book.type = "normal";

  await saveData();

  closeModal();

  openBookDetailModal(book);

  renderHome();
}
//======================


//====本を削除==================
async function deleteBook(id){

  const book =
    books.find(b=>b.id==id);

  if(!book) return;

  const title = book.title;

  books =
    books.filter(b=>b.id!=id);

  await saveData();

  closeModal();

  renderHome();

  showToast(`「${title}」を削除しました`);
}
//=============================

//====シリーズ削除
//async function deleteSeries(id){

//	const s

//}
//==============================



//====タグ削除処理
async function deleteTag(id){

 const used = books.some(book =>
  (book.tagIds || []).includes(id)
);
  if(used){
    alert("使用中のタグは削除できません");
    return;
  }
     const ok = confirm("タグを削除しますか？");

  if(!ok) return;

tagMaster =
  tagMaster.filter(
    tag =>
      String(tag.id)
      !==
      String(id)
  );

  await saveData();

  renderSettings();
  renderHome();
}
//============================

//====タグ保存処理
async function saveTagEdit(id){

  const tag =
    tagMaster.find(
      t => t.id === id
    );

  if(!tag) return;

  // 名前
  const input =
    document.getElementById(
      "edit-tag-name"
    );

  if(input){
    tag.name = input.value.trim();
  }

  // 色
  tag.color = editingTagColor;

  await saveData();

  editingTagId = null;

  renderSettings();
  renderHome();
}
//==========================




//⬛︎⑥====データ読み込み====
async function loadData(){

  // ここに入れる（関数の一番上）
  if(!window.db || !window.doc || !window.getDoc){
    console.log("⏳ Firebase待機中...");
    setTimeout(loadData, 100);
    return;
  }

  try{
    // Firestoreから取得
    const snap = await window.getDoc(
      window.doc(window.db, "app", "data")
    );
    
    
    if(snap.exists()){
      const data = snap.data();

      books = data.books || [];
      characters = data.characters || [];
      tagMaster = data.tagMaster || [];
      seriesMaster =
        (data.series || [])
          .concat(
            data.seriesMaster || []
          );


      // ローカルにも保存（バックアップ）
      localStorage.setItem("bookAppData",JSON.stringify(data));

      console.log("Firestoreから読み込み");

    } else {

      // Firestore空ならローカル
      const saved = localStorage.getItem("bookAppData");

      if(saved){
        const data = JSON.parse(saved);

        books = data.books || [];
        characters = data.characters || [];
        tagMaster = data.tagMaster || [];
        seriesMaster = data.seriesMaster || [];

        console.log("◆ローカルから読み込み");

      } else {

        // 🔸 初回だけGitHub
        const res = await fetch(DATA_URL + "?t=" + Date.now());
        const data = await res.json();

        books = data.books || [];
        characters = data.characters || [];
        tagMaster = data.tagMaster || [];
        seriesMaster = data.seriesMaster || [];

        await saveData();

        console.log("🌐 初期データ取得");
      }
    }
    
    viewMode =
      localStorage.getItem("viewMode")
      || "card";


    // UI初期化
    renderTagFilter();
    renderColorMode();
    renderViewMode();
    renderSort();
    setupTagToggle();

    renderCalendar();
    renderHome();
    go('home');


  }catch(e){
    console.error(e);
    alert("読み込み失敗: " + e.message);
  }



  const l = document.getElementById('loading');
  if(l) l.classList.add('hidden');
}//async function loadData()おわり

// 初回ロード
window.addEventListener("load", ()=>{
  loadData();
  console.log("ここまで読めてる");
});
