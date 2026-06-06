//
// ベース ＝ app.js
//    メイン処理：render / save / 初期化
//
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
let seriesSortMode = "stitle-asc";
let charsSortMode = "cname-asc";

let searchKeyword = "";
let seriesSearchKeyword = "";

let currentDetailFav = 2;

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

//統計ページ年
let statsYear =
  new Date().getFullYear();

//カレンダー年
let calendarYear =
  new Date().getFullYear();

//カレンダー月
let calendarMonth =
  new Date().getMonth();

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

//====設定用のカラーモード設定
let shelfColorMode =
  localStorage.getItem(
    "shelfColorMode"
    ) || "single";

//タグパレット
const tagColors = [
//濃い色デフォルト
  "#ea6d7e", // 韓紅花
  "#eea220", // 黄丹
  "#c9171e", // 紅
  "#223a70", // 群青
  "#674196", // 菖蒲
  
//カスタム濃い色
  "#6b4c38", //焦茶
  "#9b3a60", //蘇芳
  "#5c3280", //茄子紺
  "#2a5490", //紺青
  "#2d6e45", //深緑
//カスタム淡い色
  "#7db9de", //勿忘草
  "#5fb3a1", //青磁
  "#9b89c4", //藤
  "#87a96b", //若葉
  "#e597b2", //撫子
//カスタムその他
  "#bb5561", //苺
  "#e1d1b3", //亜麻
  "#b9b9b9" //銀鼠
];

//タグ追加
let newTagName = "";
let newTagColor = "#b9b9b9";
let newBookFav = 0;

//シリーズ関係
let seriesMaster = [];
let seriesSections = {
  books: true,
  chars: true
};
let currentSeriesId = null;

//シリーズ編集用のデータ保持枠
let editingSeriesBookIds = [];
let editingSeriesCharacterIds = [];

//新規シリーズ用の関連物
let newSeriesBookIds = [];
let newSeriesCharacterIds = [];

let newBookTagIds = []; //新規本保存用のタグ一時保存場所
let newBookSeries = []; //新規本保存用の関連シリーズ一時保存場所

let editingBookSeriesIds = []; //本編集用の関連シリーズ一時保存場所

let editingCharacterSeriesIds = []; //人物編集用の関連シリーズ一時保存場所

//汎用トグル用のやつ
let homeSections = {
  tags: false
};

let addBookTagSections = { tags: false };
let addBookSeriesSections = { series: false };
let detailSections = { tags:  false };

//人物検索用
let characterSearchKeyword = "";

//最後に開いたページを記憶
let currentPage = localStorage.getItem("lastPage") || "home";

let showHiddenItems = false;

//==============================
//セーブ,go
//==============================
//==============================
//go、ページ切り替え
//==============================
function go(page){

  document
    .querySelectorAll(".page")
    .forEach(el=>{
      el.classList.add("hidden");
    });

  const target =
    document.getElementById("page-" + page);

  if(target){
    target.classList.remove("hidden");
  }

  if(page === "settings") renderSettings();
  if(page === "home") renderHome();
  if(page === "series") renderSeries();
  if(page === "characters") renderCharacters();
  if(page === "stats") renderStats();
  if(page === "tags") renderTags();

  currentPage = page;

  const titles = {
    home:"ホーム",
    series:"シリーズ",
    characters:"人物",
    stats:"統計",
    tags:"タグ",
    settings:"設定"
  };

  const title =
    document.getElementById("page-title");

  if(title){
    title.textContent =
      titles[page] || "読書ログ";
  }

  localStorage.setItem(
    "lastPage",
    page
  );
}

//==============================
//====🔑データの保存処理：超重要！！
//==============================
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









//==============================
//データの取得（get）とか
//==============================

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
//本生成の関数====
//==============================
function createBookSpine(b, mode="main"){
  const d = document.createElement('div');

  const base = 20;
  const extra = Math.min((b.title || "").length * 2, 55);
  
  d.className = "spine";
  d.style.width = (base + extra + 4) + "px";
  
  applySpineColor(d, b);

  if(b.type === "wish"){
  d.classList.add("wish-book");
}

  const title = document.createElement('div');
  title.textContent = b.title;

  title.className = "spine-title";

  const fav = document.createElement('div');
  const val = Math.min(b.fav || 0, 4);
  
  fav.className = "spine-fav";
  
  fav.textContent = val === 4 ? "👑" : "★".repeat(val)
//  +"\n"+${book.readDates?.length || 0}+"回読了";

   if(mode === "detail"){
    d.style.width = (base + extra - 10) + "px";
    d.classList.add("mini-s-spine");
    fav.style.fontSize = "5px";
    fav.style.height = "15px";
    fav.style.paddingBottom = "1px";
  }
  
  if(b.reread){
  
    const mark =
      document.createElement("div");
      
    mark.className = "bookmark";
    
    d.appendChild(mark);
  
  }
  

  d.appendChild(title);
  d.appendChild(fav);

  d.onclick = ()=> openBookDetailModal(b);

  return d;
}



//==============================
//タグ色=====
//==============================
function getTagColor(tagId){
  const t = tagMaster.find(x => x.id === tagId);
  return t?.color || "#999";
}






//==============================
//汎用設定
//==============================





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

  if(id === "open-book-series"){
    detailSections.series = opened;
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
//★フィルタの状態
//==============================
const filterState = {
  tags: [],        // 選択中タグID
  tagMode: "AND",  // AND / OR / NOT
  tagStates: {},
  types: {
    book: true,
    series: true,
    character: true
  },
  search: ""
};




//==============================
//★絞込み現状表示ちゃん
//==============================
function renderActiveFilterView(){

  const area =
    document.getElementById(
      "active-filter-view"
    );

  if(!area) return;

  if(!filterState.tags.length){

  area.innerHTML = "";
  area.style.display = "none";

  return;
}

area.style.display = "block";
    
    
  function getTagNames(tagIds){

  return tagIds.map(tagId=>{

    const tag =
      tagMaster.find(
        t => String(t.id) === String(tagId)
      );

    return tag?.name || "？";

  }).join(" / ");

}

  //AND選択中タグ抽出
  const andTags = Object.keys(
    filterState.tagStates
  ).filter(

    tagId =>

    filterState.tagStates[tagId]
      === "AND"
  );
  
  //OR抽出
  const orTags = Object.keys(
    filterState.tagStates
  ).filter(

    tagId =>

    filterState.tagStates[tagId]
      === "OR"
  );
  
  //NOT抽出
  const notTags = Object.keys(
    filterState.tagStates
  ).filter(

    tagId =>

    filterState.tagStates[tagId]
      === "NOT"
  );

  area.innerHTML = `

    <div class="active-filter-row">

      <span class="filter-mode-label">

        ${andTags.length ? `
          <div>
            AND：${getTagNames(andTags)}
         </div>
         ` : ""}
         
        ${orTags.length ? `
          <div>
            OR：${getTagNames(orTags)}
           </div>
        ` : ""}
         
        ${notTags.length ? `
          <div>
            NOT：${getTagNames(notTags)}
          </div>
        ` : ""}
       
        </span>

      <span class="filter-tag-list">

      </span>

    </div>

  `;
}




//==============================
//★フィルタの状態読み込みちゃん
//==============================
const savedFilterState =
  localStorage.getItem(
    "filterState"
  );

if(savedFilterState){

  Object.assign(

    filterState,

    JSON.parse(savedFilterState)

  );

}




//==============================
//ホーム（メイン本棚）
//==============================
//==============================
// ⬛︎ホーム（本のリスト表示）HOME====
//ホーム画面の「骨組みだけ」にする！
//==============================
function renderHome(){

  setActiveMenu("menu-home");

  const el = document.getElementById("page-home");
  if(!el) return;

  el.innerHTML = `
    <div id="home-fixed-bar"></div>
    <div id="home-top"></div>
    <div id="home-main"></div>
  `;

  renderHomeFixedBar();
  renderSearchArea();
  renderTagFilter();
  renderActiveFilterView();
  renderBookList();
}
//==============================
//======本の一覧だけ表示させる役
//==============================
function renderBookList(){

  const main = document.getElementById("home-main");
  if(!main) return;

  main.innerHTML = "";

 const keyword =
  (searchKeyword || "").trim().toLowerCase();

const filteredBooks = books.filter(b => {

  const matchSearch =
    !keyword
    ||
    (b.title || "")
      .toLowerCase()
      .includes(keyword);

  const matchType =
    typeFilter === "all"
    ||
    b.type === typeFilter;

  return (
    shouldShowItem(b)
    &&
    matchSearch
    &&
    matchType
  );
});

  const sorted = sortBooks(filteredBooks);

  main.classList.remove(
  "card-view",
  "list-view",
  "shelf-view"
);

  if(viewMode === "card"){
    renderCardView(main, sorted);
    main.classList.add("card-view");
  }

  if(viewMode === "list"){
    renderListView(main, sorted);
    main.classList.add("list-view");
  }

  if(viewMode === "shelf"){
    renderShelfView(main, sorted);
    main.classList.add("shelf-view");
  }
}
//==============================
//====カードビューモード
//==============================
function renderCardView(main, books){

  main.classList.remove(
  "card-view",
  "list-view",
  "shelf-view"
);

main.classList.add("card-view");

  books.forEach(b=>{

    const d =
      document.createElement("div");

    d.className =
      "card honlist";

    // タグ取得
    const tags = (b.tagIds || [])
      .map(tagId => {

        const tag = tagMaster.find(
          t =>
            String(t.id)
            === String(tagId)
        );

        return tag?.name || "";

      })
      .filter(Boolean);

    // 関連シリーズ取得
    const relatedSeries =
      seriesMaster.filter(s =>

        (s.bookIds || [])
          .map(String)
          .includes(String(b.id))

      );

    d.innerHTML = `

      <div class="title">
        ${b.title}
      </div>

      <div class="card-sub-row">

        <div class="book-latest-date">
          ${getLatestReadDate(b) || "未読"}
        </div>

        <div class="fav">
          ${getFavLabel(b.fav)}
        </div>

        <div class="book-read-count">
          ${b.readDates?.length || 0}回
        </div>

      </div>

      ${
        tags.length
          ? `
            <div class="card-tags">

  ${tags.map(tagName=>{

    const tag = tagMaster.find(
      t => t.name === tagName
    );

    return `
      <span
        class="card-tag"
        style="
          color:${tag?.color || "#999"};
        "
      >
        #${tagName}
      </span>
    `;

  }).join("")}

</div>
          `
          : ""
      }

      ${
        relatedSeries.length
          ? `
            <div class="card-series">
              ${relatedSeries
                .map(s => s.name)
                .join(" / ")
              }
            </div>
          `
          : ""
      }

    `;

    d.onclick =
      ()=> openBookDetailModal(b);

    main.appendChild(d);

  });
}

//==============================
//====リストビューモード
//==============================
function renderListView(main, books){

  main.classList.remove(
  "card-view",
  "list-view",
  "shelf-view"
);

main.classList.add("list-view");

  books.forEach(b=>{

    const row =
      document.createElement("div");

    row.className =
      "list-row";

    const latestDate =
      getLatestReadDate(b) || "未読";

    const readCount =
      b.readDates?.length || 0;

   row.innerHTML = `

  <div class="list-title">
    ${b.title}
  </div>

  <div class="list-meta">

    <span class="list-date">
      ${latestDate}
    </span>

  </div>

  <div class="list-count-watermark">
    ${readCount}読
  </div>
`;

    row.onclick =
      ()=> openBookDetailModal(b);

    main.appendChild(row);
  });
}


//==============================
//====背表紙ビューモード❤️
//==============================
function renderShelfView(main, list){

  const shelf = document.createElement("div");
  shelf.className = "shelf-view";

  list.forEach(b=>{
    const spine = createBookSpine(b);
    spine.onclick = () => openBookDetailModal(b);
    shelf.appendChild(spine);
  });

  main.appendChild(shelf);
}


//==============================
//本棚背表紙モード
//==============================
function renderShelf(el, list, mode = "main"){
  el.innerHTML = "";

  const wrap =
  document.createElement("div");

wrap.className =
  "shelf-wrap";

  list.forEach(b=>{
    const spine = createBookSpine(b, mode);
    wrap.appendChild(spine);
  });

  el.appendChild(wrap);
}



//==============================
//ホーム固定バー
//==============================
function renderHomeFixedBar(){

  const bar =
    document.getElementById("home-fixed-bar");

  if(!bar) return;

  bar.innerHTML = `
    <button onclick="openAddBookModal()" class="fixed-add-btn">
      ＋本
    </button>

    <button
      class="${viewMode === 'card' ? 'active' : ''}"
      onclick="changeViewMode('card')"
    >
      ■
    </button>

    <button
      class="${viewMode === 'list' ? 'active' : ''}"
      onclick="changeViewMode('list')"
    >
      ☰
    </button>

    <button
      class="${viewMode === 'shelf' ? 'active' : ''}"
      onclick="changeViewMode('shelf')"
    >
      ‖‖
    </button>

    <select class="select-chip" id="type-filter-fixed" onchange="changeTypeFilterFromFixed()">
      <option value="all" ${typeFilter === "all" ? "selected" : ""}>全部</option>
      <option value="normal" ${typeFilter === "normal" ? "selected" : ""}>本棚</option>
      <option value="wish" ${typeFilter === "wish" ? "selected" : ""}>ウィッシュ</option>
    </select>
    
    
    <button
  class="filter-reset-btn"
  onclick="resetHomeSearchFilter()"
>
  🧹リセット
</button>
    
  `;
  
}




//==============================
//======🔍検索用エリア===========
//★====検索UIだけの役割
//==============================
function renderSearchArea(){

  const top = document.getElementById("home-top");
  if(!top) return;
  
  const items = books;//応急処置、後で変更
  
  const visibleItems = items.filter(item =>
  shouldShowByType(item) &&
  matchTags(item)
  );
 
  top.innerHTML = `
  <div class="filter-actions">
    <input class="input-common input-small"
      id="search"
      placeholder="検索..."
      value="${searchKeyword}"
      oninput="handleSearchInput()"
    >
    
    
      <select id="sort-select" class="select-chip"
        onchange="changeSortMode()">

      <option value="read-desc">読了日新</option>
      <option value="read-asc">読了日古</option>

      <option value="title-asc">タイトル↓</option>
      <option value="title-desc">タイトル↑</option>

      <option value="rating-desc">高評価</option>
      <option value="rating-asc">低評価</option>

      </select>
      
      <button class="tag-chip"
        data-open="🏷️タグ非表示"
        data-close="🏷️タグ表示"

        onclick="togglesSection(
        'tag-filter',
        this
        )
      "
     >🏷️タグ表示
       </button>
       <div class="mini-text usui-text">
        タグ切替<br>
        AND/OR/NOT
      </div>
       </div>
       
      
       <div class="filter-actions">
       
         <div
           id="active-filter-view"
           class="active-filter-view"
         ></div>
       </div>
       
   
<div class="
  toggle-content
  ${homeSections.tags ? "open" : ""}
  "
  id="tag-filter"></div>

    <div id="suggest"></div>
  `;
  
  renderSuggest();
}

   // toggleTagFilter()




//==============================
//====新規本のタグ切替え
//==============================
function toggleNewBookTag(tagId, el, color){

  if(newBookTagIds.includes(tagId)){

    newBookTagIds =
      newBookTagIds.filter(id=>id!==tagId);

    el.classList.remove("active");
    
    el.style.background = "#fffffc";
    el.style.color = color;

  }else{

    newBookTagIds.push(tagId);

    el.classList.add("active");
    
    el.style.background = color;
    el.style.color = "#fffffc";

  }

}





//==============================
//新規本用の評価切り替えボタン
//==============================
function cycleNewBookFav(){

  newBookFav =
    (newBookFav + 1) % 5;

  document.getElementById(
    "new-book-fav-btn"
  ).textContent =
    "評価：" +
    ["0","★","★★","★★★","👑"]
      [newBookFav];
}

//==============================
//====キーワード検索（ホーム本棚用）
//==============================
function handleSearchInput(){

  searchKeyword =
    (document.getElementById(
    "search"
    )?.value || "")
    .toLowerCase();

  renderSuggest();
  renderBookList();
}


//==============================
//====ソートモードの切替え（本）
//==============================
function changeSortMode(){

  sortMode =
    document.getElementById("sort-select").value;

  renderBookList();
}


//==============================
//====本棚のビューモード切替え(いずれ削除20260520
//==============================
function changeViewMode(mode){

  viewMode = mode;

  localStorage.setItem("viewMode", viewMode);

  renderHome(); // ★これ一本化
}
//==============================
//====背表紙カラー切り替え
//==============================
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

//==============================
//背表紙カラーモード変更描画
//==============================
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
  //    renderColorMode(targetId);
    };

    el.appendChild(btn);
  });
}





//==============================
//====読了日のトグル表示（モーダル）
//==============================
function toggleDateHistory(bookId, head){

  const body =
    document.getElementById(
      `date-history-${bookId}`
    );

  if(!body) return;

  const isOpening =
    body.style.display === "none";

  body.style.display =
    isOpening
      ? "grid"
      : "none";

  if(head){
    head.textContent =
      isOpening
        ? head.dataset.open
        : head.dataset.close;
  }
}

//==============================
//====評価ボタン1つで切替え
//==============================
function cycleFav(id){

  const book =
    books.find(b=>String(b.id)===String(id));

  if(!book) return;

  book.fav = (book.fav + 1) % 5;

  saveData();

  closeModal("open-book-modal");

  openBookDetailModal(book);

  renderHome();
}


//==============================
//タグの選択切替え
//==============================
function toggleBookTag(bookId, tagId){

	const book =
		books.find(b=>String(b.id)===String(bookId));

	if(!book) return;

	if(!Array.isArray(book.tagIds)){

		book.tagIds = [];

	}

	if(book.tagIds.includes(tagId)){

		book.tagIds =
			book.tagIds.filter(id=>id!==tagId);

	}else{

		book.tagIds.push(tagId);

	}
	
	closeModal("open-book-modal");
	openBookDetailModal(book);

}


//==============================
//タグ収納トグル※旧になる予定20260519
//==============================
function toggleTagFilter(){

  showTagFilter = !showTagFilter;
  
  localStorage.setItem(
    "showTagFilter",
    showTagFilter
  );

  renderHome();
}


//==============================
//本のソートここから
//==============================
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

//==============================
//====★タグフィルター描画※旧になる予定20260519
//==============================
function renderTagFilter(){

  const area =
    document.getElementById("tag-filter");

  if(!area) return;

  area.innerHTML = "";

  tagMaster
    .filter(tag => !tag.isHidden)
    .forEach(tag=>{

    const btn =
      document.createElement("button");

    btn.className = "tag-chip";
    btn.textContent = tag.name;

    btn.style.background = "#fffffc";
    btn.style.color = tag.color || "#666";
    btn.style.border = `1px solid ${tag.color || "#ccc"}`;
    btn.style.borderRadius = "999px";

    const isActive =
      filterState.tags.includes(String(tag.id));
      
    const mode =
      filterState.tagStates[String(tag.id)];

    if(isActive){
      btn.classList.add("active");
      
       if(mode){
         btn.classList.add(
          `tag-mode-${mode.toLowerCase()}`
         );
       }
      
      btn.style.background = tag.color;
      btn.style.color = "#fffffc";
    }

  btn.onclick = () => {

    cycleTagState(tag.id);

    renderHome();
  };

    area.appendChild(btn);
  });
}

//==============================
//========タイプフィルター（ウィッシュリスト）
//==============================
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

//==============================
//====日付の空白安全対策
//==============================
function toDateNum(book){

  const d = getLatestReadDate(book);

  return d
    ? new Date(d).getTime()
    : 0;
}








//==============================
//===旧?viewmode
//==============================
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
   //   renderViewMode(targetId);     // 見た目更新
    };

    el.appendChild(btn);
  });
}






//==============================
//設定
//==============================

//==============================
//🔧====設定ページ====
//==============================
function renderSettings(){

setActiveMenu("menu-settings");

  const el = document.getElementById("page-settings");
  if(!el) return;
  
 
  
  el.innerHTML = `
    <button onclick="go('home')">← 戻る</button>
    <h2>設定</h2>

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
        <input class="input-common input-small"
          type="number" 
          value="${yearlyGoal}" 
          min="1"
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


  `;  
}



//==============================
//====年間目標のオンオフ切替
//==============================
function toggleGoal(e){
  e.stopPropagation();

  enableGoal = !enableGoal;
  localStorage.setItem("enableGoal", enableGoal);

  renderSettings();
  renderHome(); // 即反映
}


//==============================
//====デフォルト並び順切り替え
//==============================
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

//==============================
//====デフォルト表示タイプ切り替え
//==============================
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

//==============================
//====セッティングの汎用切り替えボタン
//==============================
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
//==============================

//==============================
//====設定ページエリアトグル開閉設定
//==============================
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


//==============================
//====設定用：背表紙カラー
//==============================
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

//==============================
//====設定用：並び順
//==============================
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
    return "名前↑";
  }
  
    if(
    sortMode === "title-desc"
  ){
    return "名前↓";
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

//==============================
//====設定用：表示タイプ
//==============================
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

//==============================
//====メモのオンオフ
//==============================
function toggleMemo(){

  enableMemo = !enableMemo;

  localStorage.setItem(
    "enableMemo",
    enableMemo
  );

  renderSettings();
  renderHome();
}

//==============================
//====年間目標数の変更
//==============================
function changeGoal(val){
  yearlyGoal = Number(val) || 0;
  localStorage.setItem("yearlyGoal", yearlyGoal);

  renderHome(); // 即反映
}








//==============================
//⑥ロード
//==============================
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

      const lastPage =
        localStorage.getItem("lastPage")
        || "home";

    // UI初期化
    renderTagFilter();
    if(lastPage === "detail"){

  const savedSeriesId =
    localStorage.getItem("currentSeriesId");

  const series =
    seriesMaster.find(s =>
      String(s.id) === String(savedSeriesId)
    );

  if(series){
    openSeries(series);
  }else{
    go("series");
  }

}else{

  go(lastPage);

}


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
