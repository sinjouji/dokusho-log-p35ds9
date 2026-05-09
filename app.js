// ★ JSON URL
const DATA_URL = "https://raw.githubusercontent.com/sinjouji/my-b0o0oksd6t6/main/data.json";

//🟦①====状態（let）====
//初期設定

let books = [];
let series = [];
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
// 保険（壊れた値対策）
//if(!["card","shelf"].includes(viewMode)){viewMode = "card";}

let sortMode = "date-desc";

let searchKeyword = "";

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
 
 let currentMonth = new Date();

//====年間目標設定
let yearlyGoal = Number(localStorage.getItem("yearlyGoal")) || 100;

let enableGoal = localStorage.getItem("enableGoal");
enableGoal = enableGoal === null ? true : (enableGoal === "true");//年間読破目標設定

//グラフ年間移動用
let statsYear = new Date().getFullYear();







//🟩②====データ取得・保存（load・save）====
//基本的にGet系はここ、go

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
  if(page === 'calendar') renderCalendar();
  if(page === 'stats') renderStats();
}
//========

//====🔑データの保存処理：超重要！！====
async function saveData(){

  const data = {
    books,
    series,
    characters,
    tagMaster
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







//getエリア=======================

//====最新読了日を取得するやつ
function getLatestReadDate(book){

  return (
  [...(book.dates || [])]
    .sort()
    .at(-1)
  ) || "";
}
//=================


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



//====常に正しい本を取得
function getBookById(id){
	return books.find(x => String(x.id) === String(id));
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




//====便利機能

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




//=================================

//====changeエリア


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



//==============================change


//====createエリア


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
  title.style.color = "#fff"; //!
  
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
  fav.style.color = "#fff";
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




//==========================


//====applyエリア


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











//====toggleエリア


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

//=========================toggle




//====sortエリア


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


//==========================



//====他


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

//==========================





//🟧④====UI描画（render系）====
//ページ毎にまとめてOKなエリア


//====renderエリア

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
//  renderTypeFilter();
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
  onchange="changeTypeFilter()"
>

  <option
    value="all"
    ${typeFilter === "all"
      ? "selected"
      : ""}
  >
    全部
  </option>

  <option
    value="normal"
    ${typeFilter === "normal"
      ? "selected"
      : ""}
  >
    本棚
  </option>

  <option
    value="wish"
    ${typeFilter === "wish"
      ? "selected"
      : ""}
  >
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

    btn.style.background = "#fff";
    btn.style.color = tag.color || "#666";
    
    btn.style.border = `1px solid ${tag.color || "#ccc"}`;
    btn.style.borderRadius = "999px";

    if(selectedTagId === tag.id){
      btn.classList.add("active");
      btn.style.background = tag.color;
      btn.style.color = "#fff";
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



//🔧====設定ページ====
function renderSettings(){
  const el = document.getElementById("page-settings");
  if(!el) return;

  el.innerHTML = `
    <h2 style="padding:12px;">設定</h2>

<div class="setting-card">

  <div class="setting-card-title">
    表示設定
  </div>

  <button onclick="toggleMemo()">
    ${
      enableMemo
        ? "📝 メモ表示：ON"
        : "📝 メモ表示：OFF"
    }
  </button>

</div>

    <div class="settings-card">
      <div class="settings-card-title">表示</div>
      <div class="settings-list">
        <div class="settings-item" onclick="openSettingSelect('view')">
          表示モード
          <div class="settings-value">${getViewLabel()}</div>
        </div>

        <div class="settings-item" onclick="openSettingSelect('color')">
          背表紙カラー
          <div class="settings-value">${getColorLabel()}</div>
        </div>
      </div>
    </div>

    <div class="settings-card">
      <div class="settings-card-title">並び</div>
      <div class="settings-list">
        <div class="settings-item" onclick="openSettingSelect('sort')">
          並び順
          <div class="settings-value">${getSortLabel()}</div>
        </div>
      </div>
    </div>

<div class="settings-card">
  <div class="settings-card-title">ホームUI</div>
  <div class="settings-list">

    <div class="settings-item">
      最近の本
      <div class="switch ${uiSettings.recent ? "on" : ""}" onclick="toggleUIItem(event,'recent')"></div>
    </div>

    <div class="settings-item">
      サマリー
      <div class="switch ${uiSettings.summary ? "on" : ""}" onclick="toggleUIItem(event,'summary')"></div>
    </div>

    <div class="settings-item">
      タグ
      <div class="switch ${uiSettings.tags ? "on" : ""}" onclick="toggleUIItem(event,'tags')"></div>
    </div>

    <div class="settings-item">
      タイプ
      <div class="switch ${uiSettings.type ? "on" : ""}" onclick="toggleUIItem(event,'type')"></div>
    </div>

  </div>
</div>
<div class="settings-card">
  <div class="settings-title">目標</div>
  <div class="settings-list">

    <div class="settings-item">
      年間目標
      <div class="switch ${enableGoal ? "on" : ""}" onclick="toggleGoal(event)"></div>
    </div>

    <div class="settings-item">
      冊数
      <input 
        type="number" 
        value="${yearlyGoal}" 
        min="1"
        style="width:80px;"
        onchange="changeGoal(this.value)"
      >
    </div>

  </div>
</div>

    <button onclick="go('home')" style="margin:16px;">← 戻る</button>
  `;  
}
//==========



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


//============================render



//====


//====キーワード検索
function handleSearchInput(){

  searchKeyword =
    (document.getElementById("search")?.value || "")
    .toLowerCase();

  renderSuggest();
  renderBookList();
}
//========





//=======================





//====filterエリア

//========タイプフィルター（ウィッシュリスト）
function filterBooks(list){

  let arr = [...list];

  // タイプ絞り込み
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



//🟥⑤====イベント・操作系====
//ユーザーの操作・openDetail、Toggle系、set系

//====モーダルエリア

//⬛︎本の追加モーダル==========
function openAddBookModal(){

  const modal = document.createElement("div");
  modal.className = "modal-bg";
  modal.id = "modal";

  modal.innerHTML = `
    <div class="modal-box">

      <h2>本を追加</h2>

      <input id="add-title"
        type="text"
        placeholder="タイトル">

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

        <button onclick="closeModal()">×</button>
            </div>
  `;

  document.body.appendChild(modal);
}
//========




//====本追加モーダルを閉じる
function closeModal(){
  document.getElementById("modal")?.remove();
}
//========================



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





//========================modal




//====openエリア=====

//====本詳細モーダル========
//====本詳細モーダル====================
function openBookDetailModal(book){

  currentDetailFav = book.fav || 0;

  const modal = document.createElement("div");
  modal.className = "modal-bg";
  modal.id = "modal";

  modal.innerHTML = `
    <div class="modal-box detail-modal">

      <button class="close-btn" onclick="closeModal()">
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



//モーダル設定====
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
  box.style.background = "#fff";
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




// 本詳細
function openDetail(book){
  go('detail');

  const el = document.getElementById('page-detail');
 
  const relatedSeries = series.filter(s=>{
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




//カレンダー開くやつ
function openCalendar(){
  go('calendar');
  renderCalendar();
}
//========


//========
function openDetailById(id){

  const book = books.find(b => b.id === id);

  if(!book) return;

  openDetail(book);

  const suggest =
    document.getElementById("search-suggest");

  if(suggest){
    suggest.innerHTML = "";
  }
}
//========


//========================open


//====set


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
 // renderTypeFilter(); //再描画で色変更
  renderHome();
}
//========

//==========================set


//=========


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

  book.memo =
    document.getElementById("editMemo").value;

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
      series = data.series || [];
      characters = data.characters || [];
      tagMaster = data.tagMaster || [];

      // ローカルにも保存（バックアップ）
      localStorage.setItem("bookAppData",JSON.stringify(data));

      console.log("Firestoreから読み込み");

    } else {

      // Firestore空ならローカル
      const saved = localStorage.getItem("bookAppData");

      if(saved){
        const data = JSON.parse(saved);

        books = data.books || [];
        series = data.series || [];
        characters = data.characters || [];
        tagMaster = data.tagMaster || [];

        console.log("◆ローカルから読み込み");

      } else {

        // 🔸 初回だけGitHub
        const res = await fetch(DATA_URL + "?t=" + Date.now());
        const data = await res.json();

        books = data.books || [];
        series = data.series || [];
        characters = data.characters || [];
        tagMaster = data.tagMaster || [];

        await saveData();

        console.log("🌐 初期データ取得");
      }
    }
  viewMode = localStorage.getItem("viewMode") || "card";


    // UI初期化
    renderTagFilter();
    renderColorMode();
    renderViewMode();
    renderSort();
    setupTagToggle();
//    renderTypeFilter();
//    renderCalendar();
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



