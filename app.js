// ★ JSON URL
const DATA_URL = "https://raw.githubusercontent.com/sinjouji/my-b0o0oksd6t6/main/data.json";

//🟦①====状態（let）====
//初期設定

let books = [];
let characters = [];
let tagMaster = [];

let selectedTagId = null;
//if(!selectedTagId) selectedTagId = null;
let newBookTagIds = []; //新規本保存用のタグ一時保存場所

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
let charsSearchKeyword = "";

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

//====設定用のカラーモード設定
let shelfColorMode =
  localStorage.getItem(
    "shelfColorMode"
    ) || "single";

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



//==============================
//セーブ,go
//==============================
//==============================
//go、ページ切り替え
//==============================

function go(page){
  document.querySelectorAll("[id^='page-']").forEach(el=>{
    el.style.display = "none";
  });

  const target = document.getElementById("page-" + page);
  if(target) target.style.display = "block";

  // ここ追加
//  updateUIVisibility(page);

  if(page === 'settings') renderSettings();
  if(page === 'home') renderHome();
  if(page === 'series') renderSeries();
  if(page === 'characters') renderCharacters();
  if(page === 'stats') renderStats();
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
//評価取得
//==============================
function getFavLabel(val){
	if(val >= 4) return "👑";
	return "★".repeat(val || 0);
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
	d.style.opacity = "0.65";
	d.style.filter = "grayscale(0.15)";
	}

  const title = document.createElement('div');
  title.textContent = b.title;

  title.className = "spine-title";

  const fav = document.createElement('div');
  const val = Math.min(b.fav || 0, 4);
  
  fav.className = "spine-fav";
  
  fav.textContent = val === 4 ? "👑" : "★".repeat(val)
//  +"\n"+${book.dates?.length || 0}+"回読了";

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
//今年・今月◯冊取得
//==============================
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


//==============================
//タグ色=====
//==============================
function getTagColor(tagId){
  const t = tagMaster.find(x => x.id === tagId);
  return t?.color || "#999";
}



//==============================
//シリーズ名を取得
//==============================
function openSeriesById(id){
console.log("byid~~");
  const series = seriesMaster.find(
    s => String(s.id) === String(id)
  );

  if(!series) return;

  openSeries(series);
}




//==============================
//汎用設定
//==============================

//==============================
//====モーダルを閉じる（汎用）
//==============================
function closeModal(id){

  document
    .getElementById(id)
    ?.remove();
}

//==============================
//====汎用サジェスト
//==============================
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



//==============================
//ホーム（メイン本棚）
//==============================
//==============================
// ⬛︎ホーム（本のリスト表示）HOME====
//ホーム画面の「骨組みだけ」にする！
//==============================
function renderHome(){

  const el = document.getElementById("page-home");
  if(!el) return;

  el.innerHTML = `
 
    <div id="home-top"></div>
    <div id="home-main"></div>
  `;


  renderSearchArea();
  
  renderTagFilter();

//  renderRecentBooks();
  
  renderBookList();
}
//==============================
//======本の一覧だけ表示させる役
//==============================
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

//==============================
//====カードビューモード
//==============================
function renderCardView(main, books){

  books.forEach(b=>{

    const d = document.createElement("div");
    
    main.className = "book-grid";
    d.className = "card honlist";

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

    d.onclick = ()=> openBookDetailModal(b);

    main.appendChild(d);
  });
}


//==============================
//====リストビューモード
//==============================
function renderListView(main, books){

  books.forEach(b=>{

    const row = document.createElement("div");

    main.className = "list-view";
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

    row.onclick = ()=> openBookDetailModal(b);

    main.appendChild(row);
  });
}


//==============================
//====背表紙ビューモード❤️
//==============================
function renderShelfView(main, books){

  const shelf = document.createElement("div");

  main.className = "";
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


//==============================
//本棚背表紙モード
//==============================
function renderShelf(el, list, mode = "main"){
  el.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.flexWrap = "wrap";
  wrap.style.alignItems = "flex-end";

  list.forEach(b=>{
    const spine = createBookSpine(b, mode);
    wrap.appendChild(spine);
  });

  el.appendChild(wrap);
}


//==============================
//======🔍検索用エリア===========
//====検索UIだけの役割
//==============================
function renderSearchArea(){

  const top = document.getElementById("home-top");
  if(!top) return;
 
  top.innerHTML = `
    <button onclick="openAddBookModal()" class="add-btn">
      ➕ 本を追加
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

      <option value="title-asc">タイトル↓</option>
      <option value="title-desc">タイトル↑</option>

      <option value="rating-desc">高評価</option>
      <option value="rating-asc">低評価</option>

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
        ‖ 
      </button>
      <select
  id="type-filter"
  onchange="changeTypeFilter()">

  <option value="all"
    ${typeFilter === "all" ? "selected" : ""}
  >
    全部
  </option>

  <option value="normal"
    ${typeFilter === "normal" ? "selected" : ""}
  >
    本棚
  </option>

  <option value="wish"
    ${typeFilter === "wish" ? "selected" : ""}
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



//==============================
//⬛︎本の追加モーダル==========
//==============================
function openAddBookModal(){

  const modal = document.createElement("div");
  modal.className = "modal-bg";
  modal.id = "add-book-modal";

  modal.innerHTML = `
    <div class="modal-box">
 <div class="title-line">
         <span style="font-size:20px;font-weight:bold;margin-right:auto;">本を追加</span>
         <button onclick="closeModal('add-book-modal')" style="margin-left:auto;">✖️</button></div>

      <input class="addin"
       id="add-title"
        type="text"
        placeholder="タイトル"
        oninput="renderTitleSuggest()"
        >
      <div id="title-suggest"></div>
      
      <div class="field">
        <div class="field-label">読了日</div>

        <input type="date" id="add-date">
        
	  			<button
				  type="button"
				  id="new-book-fav-btn"
				  class="fav-cycle-btn"
			  		onclick="cycleNewBookFav()"
				>
				  評価：0
				</button>

        
      </div>
      
      	<div class="tag-select-area">
			
				${tagMaster.map(tag=>{

				const isActive =
					newBookTagIds.includes(tag.id);

				return `
				<span
					class="
						tag-chip detail-tag-chip
						${isActive ? "active" : ""}
					"
					
					data-tag-id="${tag.id}"
					
 					onclick="
 						toggleNewBookTag(
 							'${tag.id}',
 							 this,
 							 '${tag.color}'
 							)
 						"
 						
					style="
						background:
							${isActive ? tag.color : '#fffffc'};
						color:
							${isActive ? '#fffffc' : tag.color};
						border:
							1px solid ${tag.color};
					"
				>
				${tag.name}
			</span>
		`;

	}).join("")}
			</div>
      

      ${enableMemo ? `
      <textarea id="add-memo"
        placeholder="メモ"></textarea>` : ""}


      <div class="end-btn">
        <button onclick="saveNewBook()">
          ➕本棚
        </button>

        <button onclick="addBook('wish')">
          ➕WishList
        </button>
            </div></div>
  `;

  document.body.appendChild(modal);
}



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
//====タイプフィルター切り替え
//==============================
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



//==============================
//====再読本のチェック切替え
//==============================
function toggleReread(id){

  const book =
    books.find(
      b=>String(b.id)===String(id)
    );

  if(!book) return;

  book.reread =
    document.getElementById(
      "reread-check"
    ).checked;

  saveData();

  renderHome();
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
//====本棚のビューモード切替え
//==============================
function changeViewMode(mode){

  viewMode = mode;

  localStorage.setItem(
    "viewMode",
    viewMode
  );
  
  renderSearchArea();

  renderBookList();
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
//====本詳細モーダル========
//==============================
function openBookDetailModal(book){

  currentDetailFav = book.fav || 0;
  
  const relatedSeries = seriesMaster.filter(s=>{
  return Array.isArray(s.bookIds) && s.bookIds.includes(book.id);
  });
  
  const sortedDates =
    [...(book.dates || [])]
      .sort((a,b)=>b.localeCompare(a));
  
  const latestDate =
    sortedDates[0];
  
  const modal = document.createElement("div");
  modal.className = "modal-bg";
  modal.id = "open-book-modal";
	
  modal.innerHTML = `
    <div class="modal-box detail-modal">
    <div class="title-line">
      <input id="detail-title" class="detail-title"
        value="${book.title || ""}">
    
      <button onclick="closeModal('open-book-modal')" style="margin-left:auto;">
        ✖️
      </button>
    </div>

      <div class="detail-row" style="display:flex;
  justify-content:space-between;">
        状態 ＝ 
        ${
          book.type === "wish"
          ? "❤️ウィッシュ"
          : "📚本棚"
        }
   
        <div class="detail-fav-wrap">

       <button
         class="fav-cycle-btn"
         onclick="cycleFav('${book.id}')">評価：
           ${
              ["0","★","★★","★★★","👑"][book.fav || 0]
            }
       </button>

     </div>
   
        <label class="reread-check">

  <input
    type="checkbox"
    id="reread-check"
    ${book.reread ? "checked" : ""}

    onchange="
      toggleReread('${book.id}')
    "
  >

  再読予定
</label>
      </div>

     <div class="detail-row" style="display:flex;
  align-items:center;">
  読了日：

  ${
    latestDate
    ? `
      <div class="date-tag">
        ${latestDate}
        <button
              class="mini-delete-btn"
              onclick="removeReadDate('${book.id}','${latestDate}')"
            >
              ✕
            </button>
      </div>
      <span class="book-stat">${book.dates?.length || 0}回読了</span>
    </div>
      
      <div class="detail-date-add">
      <input type="date" id="readDate-${book.id}">
      <button onclick="addReadDate('${book.id}')" style="margin-left:auto;">
        ➕読了日追加
      </button>
      </div>
      
      
          <div class="detail-row">
      <div
        class="toggle-history"
        onclick="
          toggleDateHistory('${book.id}')
        "
      >
        ▼ 履歴を見る
      </div>
      
      <div
        id="date-history-${book.id}"
        class="date-history-grid"
        style="display:none;"
      >
      
        ${sortedDates.slice(1).map(date=>`
        
          <div class="mini-date-row">
            ${date}
            <button
              class="mini-delete-btn"
              onclick="removeReadDate('${book.id}','${date}')"
            >
              ✕
            </button>
          </div>
        
        `).join("")}
      </div>
    `
    : "未読"
  }
</div>
      
      
      <hr style="border:1px dashed #c29f8b;width:100%;">
		
			<div class="tag-select-area">
			
						${tagMaster.map(tag=>{

  const isActive =
    (book.tagIds || []).includes(tag.id);

  return `
    <span
      class="tag-chip detail-tag-chip"
      onclick="toggleBookTag('${book.id}','${tag.id}')"

      style="
        background:
          ${isActive ? tag.color : '#fffffc'};

        color:
          ${isActive ? '#fffffc' : tag.color};

        border:
          1px solid ${tag.color};
      "
    >
      ${tag.name}
    </span>
  `;

}).join("")}
			</div>
      
    <div style="font-size:10px">
      ${relatedSeries.map(s=>`
        シリーズ : 
        <button class="detail-series"
				  onclick="
				    closeModal('open-book-modal');
				    openSeriesById('${s.id}');
				  "
				>
 				 ${s.name}
				</button>
      `).join(", ") || ""}
    </div>

      ${enableMemo ? `
      <textarea id="editMemo">${book.memo || ""}</textarea>
      ` : ""}

		<div class="end-btn">
      
      <button class="danger-btn"
        onclick="deleteBook('${book.id}')">
        🗑 削除
      </button>
      
      <button onclick="saveDetail('${book.id}')">
        🪎 保存
      </button>
      
    </div>
      
    </div>
  `;

  document.body.appendChild(modal);
}

//==============================
//====読了日の取得
//==============================
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

  closeModal("open-book-modal");

  openBookDetailModal(book);

  renderHome();
}



//==============================
//====読了日のトグル表示（モーダル）
//==============================
function toggleDateHistory(bookId){

  const el =
    document.getElementById(
      `date-history-${bookId}`
    );

  if(!el) return;

  el.style.display =
    el.style.display === "none"
    ? "grid"
    : "none";
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
//タグ収納トグル
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
//====タグフィルター描画
//==============================
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
//====最新読了日を取得するやつ
//==============================
function getLatestReadDate(book){

  return (
  [...(book.dates || [])]
    .sort()
    .at(-1)
  ) || "";
}


//==============================
//====本を削除==================
//==============================
async function deleteBook(id){

  const book =
    books.find(b=>b.id==id);

  if(!book) return;

  const title = book.title;

  books =
    books.filter(b=>b.id!=id);

  await saveData();

  closeModal("open-book-modal");

  renderHome();

  showToast(`「${title}」を削除しました`);
}

//==============================
//====詳細保存================
//==============================
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

  closeModal("open-book-modal");

  renderHome();
}

//==============================
//====保存通知
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
//====本を追加保存================
//=============================
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
    document.getElementById("add-memo")?.value || "";

  const book = {
    id: Date.now().toString(),
    title,
    memo: memo,
    fav: newBookFav,
    dates: date ? [date] : [],
    tagIds: [...newBookTagIds],
    type: date ? "normal" : "wish"
  };

  books.unshift(book);

  await saveData();
  showToast(`「${book.title}」を追加しました`);

  closeModal("add-book-modal");

  renderHome();
}

//==============================
//======ウィッシュリストに本を追加
//==============================
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

  closeModal("add-book-modal");

  renderHome();
}

//==============================
//====モーダル版日付削除処理
//==============================
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

  closeModal("open-book-modal");
  openBookDetailModal(book);
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
//====サジェスト
//====検索候補のみ表示させる役
//==============================
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
//==============================
//====タイトル用サジェスト
//==============================
function renderTitleSuggest(){

  renderSuggestList({

    inputId: "add-title",

    suggestId: "title-suggest",

    list:
      books.map(b=>b.title)

  });
}


//==============================
//シリーズ
//==============================
//====シリーズホーム
//◼️シリーズ一覧表示（骨組みだけ）
//==============================
function renderSeries(){
  const list = document.getElementById('page-series');
  list.innerHTML = `
  		
  		<div id="series-top"></div>
  		<div class="series-main" id="series-main"></div>
  `;
	
	
	renderSeriesSearchArea();
	renderSeriesBookList();
	
}

//==============================
//====シリーズ一覧だけを表示する
//==============================
function renderSeriesBookList(){


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
	//ソート
	const sorted = sortSeries(filtered);
			
		sorted.forEach(s=>{
		
			const d = document.createElement('div');
			d.className = "card ";
			d.textContent = s.name;

		d.onclick = ()=> openSeries(s);
		main.appendChild(d);
	});
	
}

//============================
// シリーズ：詳細画面の表示
//============================
function renderSeriesDetail(s){

console.log(
"render detail"
);
  const el = document.getElementById('page-detail');

	//シリーズ→本
  const relatedBooks = books.filter(b=>{
    return Array.isArray(s.bookIds) && s.bookIds.includes(b.id);
  });
  	
 	 //シリーズ→人物
  const relatedCharacters =
  characters.filter(c =>

    Array.isArray(s.characterIds)
    && s.characterIds.includes(c.id)

  );
  

//シリーズ関連：本HTML表示
  el.innerHTML = `
    <div class="seriesp-head">
    <button onclick="go('series')">戻る</button>
    <span class="satu">登録 : ${relatedBooks.length}冊</span>
    <button onclick="openSeriesEditModal('${s.id}')">✏️ 編集</span>
    </div>
   
    <h3 class="stitle">${s.name}</h3>

<div class="series-detail-layout">
 <div class="series-section">

  <div
    class="series-section-title"
    onclick="toggleSeriesSection('books')"
  >
   ${seriesSections.books
     ? "▽"
     : "▶︎"}
     関連作品</div>
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
    onclick="toggleSeriesSection('chars')"
  >
  ${seriesSections.chars
  ? "▽"
  : "▶︎"}
  関連人物</div>

  ${
    seriesSections.chars
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

  const list =
  document.getElementById(
    'series-books'
  );

if(list){

  if(viewMode.startsWith("shelf")){

    renderShelf(
      list,
      relatedBooks,
      "detail"
    );


  } else {

    relatedBooks.forEach(b=>{

      const d =
        document.createElement('div');

      d.className = "card";

      d.textContent =
        b.title;

      d.onclick =
        ()=> openBookDetailModal(b);

      list.appendChild(d);

    });

  }

}

  const list2 =
  document.getElementById(
    "series-chars"
  );

if(list2){

  if(!relatedCharacters.length){

    list2.innerHTML = `
      <div style="color:gray;">
        （人物なし）
      </div>
    `;

  } else {

    relatedCharacters.forEach(c=>{

      const d =
        document.createElement('div');

      d.className = "card";

      d.textContent =
        c.name;

      d.onclick =
        ()=> openCharacterModal(c);

      list2.appendChild(d);

    });

  }

}
}

//==============================
//シリーズソート
//==============================
function sortSeries(list){

	const arr = [...list];

//シリーズ名順	
	if(seriesSortMode === "stitle-asc"){
		arr.sort((a,b)=>
			(a.name || "")
			.localeCompare(
				b.name || "",
				"ja"
			)
		);
	}
	
	if(seriesSortMode === "stitle-desc"){
		arr.sort((a,b)=>
			(b.name || "")
			.localeCompare(
				a.name || "",
				"ja"
			)
		);
	}
	
//読了日順	
//	if(seriesSortMode === "sread-asc"){
//		arr.sort((a,b)=>
//			toDateNum(b) - toDateNum(a)
//		);
//	}
	
//	if(seriesSortMode === "sread-desc"){
//		arr.sort((a,b)=>
//			toDateNum(a) - toDateNum(b)
//		);
//	}
	
	
	return arr;
}

//==============================
//シリーズ詳細を開く
//==============================
function openSeries(series){

  currentSeriesId = series.id;
  
  go('detail');

  renderSeriesDetail(series);

}



//==============================
//====シリーズページの検索エリア
//==============================
function renderSeriesSearchArea(){

	const top = document.getElementById("series-top");
	if(!top) return;
	
	top.innerHTML = `
	<button onclick="openAddSeriesModal()"
		class="add-btn">
			➕ シリーズ追加
		</button>
		
		<input
			id="series-search"
			placeholder="シリーズ検索..."
			value="${seriesSearchKeyword}"
			oninput="handleSeriesSearchInput()"
		>
		
			<select id="series-sort-select"
				onchange="changeSeriesSortMode()">
			
			<option value="sread-desc">読了日新</option>
			<option value="sread-asc">読了日古</option>
			
			<option value="stitle-asc">タイトル↓</option>
			<option value="stitle-desc">タイトル↑</option>
			</select>
		
		<div id="series-suggest"></div>
	`;
	renderSeriesSuggest();
}



//==============================
//====キーワード検索（シリーズ一覧用）
//==============================
function handleSeriesSearchInput(){

	renderSuggestList({
	
		inputId:
			"series-search",
		
		suggestId:
			"series-suggest",
		
		list:
			seriesMaster.map(
				s => s.name
			)
	});

  renderSeriesSuggest();
  renderSeriesBookList();
}

//==============================
//====シリーズ詳細ページトグル開閉設定
//==============================
function toggleSeriesSection(key){
console.log(seriesSections);
  seriesSections[key] =
    !seriesSections[key];
    
  const series =
    seriesMaster.find(
      s => s.id === currentSeriesId
    );
  
  if(series){
    renderSeriesDetail(series);
  }
  
}


//==============================
//====シリーズの追加モーダル
//==============================
function openAddSeriesModal(){

	const modal = document.createElement("div");
	modal.className = "modal-bg";
	modal.id = "add-series-modal";
	
	modal.innerHTML = `
		<div class="modal-box">
		<div class="title-line">
					<span style="font-size:20px;font-weight:bold;margin-right:auto;">シリーズを追加</span>
						<button onclick="closeModal('add-series-modal')" style="margin-left:auto;">✖️</button></div>
			
			<input class="addin"
				id="add-series-title"
				type="text"
				placeholder="シリーズタイトル"
				oninput="renderTitleSuggest()">
			<div id="title-suggest"></div>
			
			
				<div>関連対象を登録</div>
				<div class="addin2">
				<input class="addinput"
				 id="series-for-one"
					type="text"
					placeholder="作品／人物名"
					oninput="renderSeriesSuggest();
						renderCharacterSuggest();">
				
				<button onclick="">
					➕
				</button>
				</div>
				
				<button onclick="saveNewSeries()">➕追加</button>
				
				
			
		</div>
`;
	document.body.appendChild(modal);
	//関連対象一時表示エリア、複数は最新3件まで表示とかに制限したい
}


//==============================
//シリーズ編集モーダル
//==============================
function openSeriesEditModal(id){

  const modal = document.createElement("div");
  
  const series =
    seriesMaster.find(
      s => String(s.id) === String(id)
    );
    
  if(!series) return;

  editingSeriesBookIds =
    [...(series.bookIds || [])];

  editingSeriesCharacterIds =
    [...(series.characterIds || [])];
    


  modal.className = "modal-bg";
  modal.id = "edit-series-modal";

  modal.innerHTML = `
    <div class="modal-box">

      <h2>シリーズ編集</h2>

      <input
        id="edit-series-name"
        class="addin"
        value="${series.name || ""}"
      >
      
      
      <input class="addin"
        id="series-related-search"
        type="text"
        placeholder="本・人物を追加"
        oninput="
          renderSeriesBookSuggest();
          renderSeriesCharacterSuggest();
        "
      >
<div class="suggest-box">

  <div id="series-book-suggest"></div>

  <div id="series-character-suggest"></div>

</div>
      <div
        class="toggle-head"
        onclick="
          toggleSeriesEditSection('series-edit-books')
        "
      >
      ▼ 関連作品
      </div>
     <div id="series-edit-books" class="toggle-content"></div>

      <div class="toggle-head"
        onclick="
          toggleSeriesEditSection('series-edit-characters')
        "
      >
       ▼ 人物関連
      </div>
        <div id="series-edit-characters" class="toggle-content"></div>


    <div class="end-btn">
      <button
        onclick="saveSeriesEdit('${series.id}')"
      >
        🪎 保存
      </button>

      <button
        onclick="closeModal('edit-series-modal')"
      >
        ✖️
      </button>
     </div>

    </div>
  `;

  document.body.appendChild(modal);
  renderSeriesEditBooks();

renderSeriesEditCharacters();

}




//==============================
//編集モーダル内開閉トグル
//==============================
function toggleSeriesEditSection(id){

  document.getElementById(id)?.classList.toggle("open");

//  const el =
//    document.getElementById(id);

//  if(!el) return;
  
//  const isHidden = getComlutedStyle(el).display === "none";

//  el.style.display = isHidden ? "block" : "none";
}

//==============================
//編集内：関連削除（本）
//==============================
function removeBookFromSeries(id){

  editingSeriesBookIds =
    editingSeriesBookIds.filter(
      bId => String(bId) !== String(id)
    );

  renderSeriesEditBooks();

}



//==============================
//編集内：関連削除（人物）
//==============================
function removeCharacterFromSeries(id){

  editingSeriesCharacterIds =
    editingSeriesCharacterIds.filter(
      cId => String(cId) !== String(id)
    );

  renderSeriesEditCharacters();

}



//==============================
//シリーズ編集モーダル保存処理
//==============================
async function saveSeriesEdit(id){

  const series =
    seriesMaster.find(
      s => String(s.id) === String(id)
    );

  if(!series) return;

  series.name =
    document.getElementById(
      "edit-series-name"
    ).value;

  series.bookIds =
    [...editingSeriesBookIds];

  series.characterIds =
    [...editingSeriesCharacterIds];

  await saveData();

  closeModal("edit-series-modal");

  renderSeries();
  
  renderSeriesDetail(series);

  showToast("保存しました！");
}



//==============================
//関連本の一覧描画
//==============================
function renderSeriesEditBooks(){

  const relatedBooks =
    books.filter(b =>

      editingSeriesBookIds.includes(b.id)

    );

  document.getElementById(
    "series-edit-books"
  ).innerHTML = `

    <div>

      ${relatedBooks.map(b=>`

        <div class="related-chip">

          ${b.title}

          <button
            class="mini-delete-btn"
            onclick="
              removeBookFromSeries(
                '${b.id}'
              )
            "
          >
            ✕
          </button>

        </div>

      `).join("")}

    </div>
  `;
}


//==============================
//関連本の検索
//==============================
function renderSeriesBookSuggest(){

  const keyword =
    document.getElementById(
      "series-related-search"
    ).value.toLowerCase();

  const filtered = books.filter(b=>{

    const match =
      (b.title || "")
        .toLowerCase()
        .includes(keyword);

    const notAdded =
      !editingSeriesBookIds.includes(b.id);

    return match && notAdded;

  });

  document.getElementById(
  "series-book-suggest"
).innerHTML =

  filtered.length
  ? `
    <div class="suggest-label">
      📘 本
    </div>

    ${filtered.map(b=>`

      <div
        class="search-item"
        onclick="
          addBookToSeries('${b.id}')
        "
      >
        ${b.title}
      </div>

    `).join("")}
  `
  : "";

}


//==============================
//関連本の追加処理
//==============================
function addBookToSeries(id){

  if(
    !editingSeriesBookIds.includes(id)
  ){
    editingSeriesBookIds.push(id);
  }

  renderSeriesEditBooks();

}


//==============================
//関連キャラの一覧描画
//==============================
function renderSeriesEditCharacters(){

  const relatedCharacters =
    characters.filter(c =>

      editingSeriesCharacterIds.includes(c.id)

    );

  document.getElementById(
    "series-edit-characters"
  ).innerHTML = `

    <div>

      ${relatedCharacters.map(c=>`

        <div class="related-chip">

          ${c.name}

          <button
            class="mini-delete-btn"
            onclick="
              removeCharacterFromSeries(
                '${c.id}'
              )
            "
          >
            ✕
          </button>

        </div>

      `).join("")}

    </div>
  `;
}



//==============================
//関連キャラの検索
//==============================
function renderSeriesCharacterSuggest(){


  const keyword =
    document.getElementById(
      "series-related-search"
    ).value.toLowerCase();

  const filtered = characters.filter(c=>{

  const match =
    (c.name || "")
      .toLowerCase()
      .includes(keyword);

  const notAdded =
    !editingSeriesCharacterIds.includes(c.id);

  return match && notAdded;

});



document.getElementById(
  "series-character-suggest"
).innerHTML =

  filtered.length
  ? `
    <div class="suggest-label">
      👤 人物
    </div>

    ${filtered.map(c=>`

      <div
        class="search-item"
        onclick="
          addCharacterToSeries('${c.id}')
        "
      >
        ${c.name}
      </div>

    `).join("")}
  `
  : "";



}




//==============================
//関連キャラの追加処理
//==============================
function addCharacterToSeries(id){

  if(
    !editingSeriesCharacterIds.includes(id)
  ){
    editingSeriesCharacterIds.push(id);
  }

  renderSeriesEditCharacters();

}


//==============================
//====ソートモード切替え（シリーズ）
//==============================
function changeSeriesSortMode(){

	seriesSortMode =
		document.getElementById("series-sort-select").value;
		
		renderSeriesBookList();

}

//==============================
//====新規シリーズ追加処理
//==============================
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
      title,
    
    bookIds:
      []

  });

  await saveData();

  closeModal(
    "add-series-modal"
  );

  renderSeries();

}

//==============================
//====シリーズ用サジェスト
//==============================
function renderSeriesSuggest(){

  renderSuggestList({

    inputId: "add-series",

    suggestId: "series-suggest",

    list:
      seriesMaster.map(s => s.name)

  });
}

//==============================
//====シリーズ削除
//==============================
//async function deleteSeries(id){

//	const s

//}



//====================
//シリーズ内作品の最新読了日取得
//====================
//function getSeriesLastRead(series){
//関連作品から最新の日付を取得するやーつ
//}






//==============================
//キャラクター・人物メモ
//==============================

//==============================
//◼️キャラクターホーム（骨組み）だけ
//==============================
function renderCharacters(){
	
	const el = document.getElementById('page-characters');
	el.innerHTML = `
  
  		<div id="chars-top"></div>
  		<div class="chars-main" id="chars-main"></div>
  
	`;
	
	renderCharactersSearchArea();
	renderCharacterList();

}


//==============================
//====キャラクター一覧だけ表示====
//==============================
function renderCharacterList(){

	const main = document.getElementById("chars-main");
	if(!main) return;
	main.innerHTML = "";
	
	const filtered = 
		characters.filter(c =>
			(c.name || "")
				.toLowerCase()
				.includes(charsSearchKeyword)
		);
	
	//ソート
	const sorted = sortCharacters(filtered);

		sorted.forEach(c=>{
			const d = document.createElement('div');
			d.className = "card";
			d.textContent = c.name;

			d.onclick = ()=> openCharacterModal(c);

			main.appendChild(d);
		});

}

//==============================
//====キャラクター詳細モーダル====
//==============================
function openCharacterModal(c){

	const relatedSeries = seriesMaster.filter(s=>{
	return Array.isArray(c.seriesIds) && c.seriesIds.includes(s.id);
	});

	const modal = document.createElement("div");
	modal.className = "modal-bg";
	modal.id = "open-chars-modal";
	
	modal.innerHTML = `
		<div class="modal-box detail-modal">
			<input id="character-name" class="character-name"
			value="${c.name || ""}">
	
			<div style="font-size:10px">
				シリーズ : 
				${relatedSeries.map(s => `
					<button class="detail-series"
						onclick="
							closeModal('open-chars-modal');
							openSeriesById('${s.id}');
						"
					>
						${s.name}
					</button>
				`).join(", ")}
			</div>
						
			<textarea id="character-memo">${c.memo || ""}</textarea>
		
		      
    <div style="font-size:10px">
      ${relatedSeries.map(s=>`
        シリーズ : 
        <button class="detail-series"
				  onclick="
				    closeModal('open-book-modal');
				    openSeriesById('${s.id}');
				  "
				>
 				 ${s.name}
				</button>
      `).join(", ") || ""}
    </div>
		
			<button onclick="saveCharacter('${c.id}')">🪎 保存</button>
			<button style="margin-bottom:10px;">🗑️ 削除</button>
			<button onclick="closeModal('open-chars-modal')">✖️</button>
	
		</div>
	`;
	document.body.appendChild(modal);
}


//==============================
//====キャラクター詳細の保存====
//==============================
async function saveCharacter(id){

	const chars =
		characters.find(c => String(c.id) === String(id));
		
		if(!chars) return;
		
		console.log(
			document.getElementById("character-name").value
		);
		
		chars.name =
			document.getElementById("character-name").value;
		
		chars.memo =
			document.getElementById("character-memo").value;
		
		console.log("after edit", chars);
		
		await saveData();
		
		showToast("保存しました！");
		
		closeModal("open-chars-modal");
		
		renderCharacters();

}


//==============================
//====（ページ）キャラクター詳細====
//==============================
//function openCharacter(c){
//  go('detail');

//  const el = document.getElementById('page-detail');

 // 人物→シリーズ
//  const relatedSeries = seriesMaster.filter(s=>{
//    return Array.isArray(c.seriesIds) && c.seriesIds.includes(s.id);
//  });

  // 人物→本
//  const relatedBooks = books.filter(b=>{
//    return relatedSeries.some(s =>
//     Array.isArray(s.bookIds) && s.bookIds.includes(b.id)
//   );
//  });

  // HTML
//  el.innerHTML = `
//    <h2>${c.name}</h2>

//    <div style="margin-bottom:10px;">
//      ${c.memo || ""}
//    </div>

//   <hr>

//    <div>シリーズ:</div>
//    <div id="char-series"></div>

//    <button onclick="go('characters')">戻る</button>
//  `;

  // 本セクション追加
//  el.innerHTML += `
//    <hr>
//    <div>登場作品:</div>
//    <div id="char-books"></div>
//  `;

  // シリーズ描画
//  const list = document.getElementById('char-series');

//  relatedSeries.forEach(s=>{
//    const d = document.createElement('div');
//    d.className = "card";
//    d.textContent = s.name;

//    d.onclick = ()=> renderSeriesDetail(s);

//    list.appendChild(d);
//  });

  // 本描画
//  const list3 = document.getElementById('char-books');

//  relatedBooks.forEach(b=>{
//    const d = document.createElement('div');
//    d.className = "card";
//    d.textContent = b.title;

//    d.onclick = ()=> openBookDetailModal(b);

//    list3.appendChild(d);
//  });
//}

//==============================
//====キャラクター用サジェスト
//==============================
function renderCharacterSuggest(){

  renderSuggestList({

    inputId: "add-character",

    suggestId: "chars-suggest",

    list:
      characters.map(c=>c.name)

  });
}


//==============================
//キャラクターソート
//==============================
function sortCharacters(list){

	const arr = [...list];
	
	//名前順
	if(charsSortMode === "cname-asc"){
		arr.sort((a,b)=>
			(a.name || "")
			.localeCompare(
				b.name || "",
				"ja"
			)
		);
	}
	
	if(charsSortMode === "cname-desc"){
		arr.sort((a,b)=>
			(b.name || "")
			.localeCompare(
				a.name || "",
				"ja"
			)
		);
	}
	return arr;
}



//==============================
//キャラクター検索エリア
//==============================
function renderCharactersSearchArea(){

	const top = document.getElementById("chars-top");
	if(!top) return;
	
	top.innerHTML = `
	
	<button onclick="openAddCharacterModal()"
		class="add-btn">
		➕ 人物追加
	</button>
	
	<input
		id="chars-search"
		placeholder="人物検索..."
		value="${charsSearchKeyword}"
		oninput="handleCharactersSearchInput()"
	>
	
		<select id="chars-sort-select"
			onchange="changeCharactersSortMode()">
			
		<option value="cname-asc">名前↓</option>
		<option value="cname-desc">名前↑</option>
		</select>
		
		<div id="chars-suggest"></div>
	
	`;
	renderCharacterSuggest();

}



//==============================
//キーワード検索（キャラ）
//==============================
function handleCharactersSearchInput(){

	renderSuggestList({
	
		inputId:
			"chars-search",
		
		suggestId:
			"chars-suggest",
		
		list:
			characters.map(
				c => c.name
			)
	
	});
	
	renderCharacterSuggest();
	renderCharacterList();

}

//==============================
//ソートモード切替（キャラ）
//==============================
function changeCharactersSortMode(){

	charsSortMode =
		document.getElementById("chars-sort-select").value;
		
		renderCharacterList();

}



//==============================
//新規キャラクター登録
//==============================
function openAddCharacterModal(){

	const modal = document.createElement("div");
	modal.className = "modal-bg";
	modal.id = "add-chars-modal";
	
	modal.innerHTML = `
		<div class="modal-box">
					<button onclick="closeModal('add-chars-modal')" style="margin-left:auto;">✖️</button>
	
			<h2>人物を追加</h2>
			
			<input class="addin"
				id="add-chars-name"
				type="text"
				placeholder="人物名">
				
			<div>関連シリーズを登録</div>
			<div class="addin2">
			<input class="addinput"
				id="chars-for-series"
				type="text"
				placeholder="関連シリーズ名"
				oninput="renderSeriesSuggest()">
				<div id="series-suggest"></div>
				
			
			<button>
				➕
			</button>
			</div>
			
				<textarea id="add-chars-memo"
				placeholder="メモ"></textarea>
			
			<button onclick="saveNewCharacter()">➕追加</button>
			
	
		</div>
	`;

	document.body.appendChild(modal);
}

//==============================
//新規人物追加処理
//==============================
async function saveNewCharacter(){

	const name =
		document.getElementById(
			"add-chars-name"
		).value.trim();
		
	if(!name){
	alert("名前を入力してね！");
	return;
	}
	
	const memo =
		document.getElementById("add-chars-memo")?.value || "";
	
	
	
	characters.push({
	
		id:
			"ch" + Date.now(),
		
		name:
			name,
		
		seriesIds:
			[],
		
		memo:
			memo
	
	});
	
	await saveData();
	
	closeModal(
		"add-chars-modal"
	);

	renderCharacters();

}


//==============================
//統計
//==============================
//==============================
//====カレンダー、統計ページの表示
//==============================
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
  
//  renderSummary(main);
  renderMiniCalendar(main);
  renderMonthlyGraph(main, year);

// renderReadingHistory(main);
}
//==============================
//====小さめ表示のカレンダー（統計ページ用）
//==============================
function renderMiniCalendar(main){

  const now = miniMonth;
  const year = statsYear;
  const month = now.getMonth();

  // ===== ヘッダー =====

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.justifyContent = "top";
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
        "2px solid #f8a484"
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

//==============================
//====グラフ、年間目標年送り
//==============================
function changeStatsYear(diff){
  statsYear += diff;
  renderStats();
}

//==============================
//====ヒートマップカラー
//==============================
function getHeatColor(count){
  if(count === 0) return "#9b8e82"; //鼯鼠
  if(count === 1) return "#f8d8c6"; //乙女
  if(count === 2) return "#f7ed92"; //承和
  if(count === 3) return "#fddb5d"; //くちなし
  if(count === 4) return "#aacf53"; //萌葱
  return "#78ccd2"; //白群
  }

//==============================
//====年間読了数の取得
//==============================
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

//==============================
//カレンダーの日モーダル設定====
//==============================
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
      openBookDetailModal(b);
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





//==============================
//設定
//==============================

//==============================
//🔧====設定ページ====
//==============================
function renderSettings(){
  const el = document.getElementById("page-settings");
  if(!el) return;
  
 
  
  el.innerHTML = `
    <button onclick="go('home')" style="margin:16px;">← 戻る</button>
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
    ➕タグ追加
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
             🪎 保存
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


  `;  
}


//==============================
//====タグエディタ「編集開く」
//==============================
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

//==============================
//====タグエディタ「閉じる」
//==============================
function closeTagEditor(){

  editingTagId = null;

  renderSettings();
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
//====タグ削除処理
//==============================
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

//==============================
//====タグ保存処理
//==============================
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
//==============================
//====新規タグ追加用：色の処理
//==============================
function selectNewTagColor(color){

  newTagColor = color;

  renderSettings();
}

//==============================
//====タグ編集用：色の処理
//==============================
function selectTagColor(color){

  editingTagColor = color;
  
  renderSettings();
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
//====新規タグ追加
//==============================
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
//====月間読書グラフ表示
//==============================
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



//==============================
//なんかわからん系
//==============================















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


    // UI初期化
    renderTagFilter();
 //   renderColorMode();
 //   renderViewMode();
//    renderSort();
//    setupTagToggle();

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
