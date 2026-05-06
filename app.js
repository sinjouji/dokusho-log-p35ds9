// ★ JSON URL
const DATA_URL = "https://raw.githubusercontent.com/sinjouji/my-b0o0oksd6t6/main/data.json";

let books = [];
let series = [];
let characters = [];
let tagMaster = [];
let selectedTagId = localStorage.getItem("selectedTagId");
if(!selectedTagId) selectedTagId = null;

const savedMode = localStorage.getItem("colorMode");

let colorMode = ["single","gradient","split","stripe"].includes(savedMode)
? savedMode
: "split"; // 背表紙カラー：single/gradient/split/stripe
let viewMode = localStorage.getItem("viewMode") || "card"; // "card"/"shelf"/"shelf-series"
let sortMode = localStorage.getItem("sortMode") || "title";
let openedSeries = {};
let showTags = localStorage.getItem("showTags") === "true";
let sortKey = localStorage.getItem("sortKey") || "title"; //なにで並べるか
let sortOrder = localStorage.getItem("sortOrder") || "asc"; // asc / desc
let selectedType = "all"; // "all" | "normal" | "wish"※ウィッシュリスト切替
let currentMonth = new Date();

let yearlyGoal = Number(localStorage.getItem("yearlyGoal"));
if(!yearlyGoal) yearlyGoal = 12; // 初期値（好きに変えてOK）

let enableGoal = localStorage.getItem("enableGoal");
if(enableGoal === null){
  enableGoal = true; // 初期ON
} else {
  enableGoal = enableGoal === "true";
}//年間読破目標設定

// UI設定（保存＋初期値）
let uiSettings = {
  recent: true,
  summary: true,
  tags: true,
  type: true,
  ...JSON.parse(localStorage.getItem("uiSettings") || "{}")
};

//let uiSettings = JSON.parse(localStorage.getItem("uiSettings") || "{}");//↓のif使うバージョン
//if(uiSettings.recent === undefined) uiSettings.recent = true;
//if(uiSettings.summary === undefined) uiSettings.summary = true;
//if(uiSettings.tags === undefined) uiSettings.tags = true;
//if(uiSettings.type === undefined) uiSettings.type = true;//表示するページを選ぶやつ
let uiMode = localStorage.getItem("uiMode") || "on";
// "on" or "off"
let recentViewMode = localStorage.getItem("recentViewMode") || "card";
// "card" or "spine"


//★★ここまで状態設定

// ページ切替
function go(page){
  document.querySelectorAll("[id^='page-']").forEach(el=>{
    el.style.display = "none";
  });

  const target = document.getElementById("page-" + page);
  if(target) target.style.display = "block";

  // 🔥 ここ追加
  updateUIVisibility(page);

  if(page === 'settings') renderSettings();
  if(page === 'home') renderHome();
  if(page === 'series') renderSeries();
  if(page === 'characters') renderCharacters();
  if(page === 'calendar') renderCalendar();
}//function go()おわり


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
    btn.style.color = "#fff";
  } else {
    btn.style.background = "transparent";
    btn.style.color = "#333";
  }
}//function styleChip()おわり



//
// ホーム（本のリスト表示）
function renderHome(){

  const el = document.getElementById('page-home');
  if(!el) return;
  el.innerHTML = "";

  renderSummary();
  renderRecentBooks();

  const keyword = (document.getElementById('search')?.value || "").toLowerCase();


  // ① フィルタ
  const filtered = books.filter(b =>{
  const matchTitle = (b.title || "").toLowerCase().includes(keyword);

  const matchTag = !selectedTagId ||
    (Array.isArray(b.tagIds) && b.tagIds.includes(selectedTagId));

  const matchType =
    selectedType === "all" ||
    (selectedType === "unread" && (!b.dates || b.dates.length === 0)) ||
    (b.type || "normal") === selectedType;

  return matchTitle && matchTag && matchType;
});

  // ② ソート（ここ！！）
  const sorted = sortBooks(filtered);

  sorted.sort((a,b)=>{
  	if(a.type === b.type) return 0;
  	return a.type === "wish" ? -1 : 1;
  });

  // ③ 表示分岐
  if(viewMode === "shelf"){
    renderShelf(el, sorted);
    return;
  }

  if(viewMode === "shelf-series"){
    renderSeriesShelf(el, sorted);
    return;
  }
  
  if(recentViewMode === "spine"){
  const spine = createBookSpine(b);
  spine.style.height = "100px";
  box.appendChild(spine);
} else {
  // カード表示（さっきのやつ）◆◆要確認
  const title = document.createElement('div');
title.textContent = b.title;

// 縦書き
spine.style.writingMode = "vertical-rl";
spine.style.textOrientation = "mixed";

// レイアウト安定
spine.style.display = "block"; // ← flexやめる（重要）
spine.style.height = "100%";
spine.style.width = "100%";

// はみ出し対策
spine.style.overflow = "hidden";
spine.style.wordBreak = "break-all";

// 見た目調整
spine.style.fontSize = "8px";
spine.style.lineHeight = "1.2";
spine.style.padding = "4px 2px";

// 色
spine.style.color = "#fff";
}

  // ④ 通常表示
  sorted.forEach(b=>{
    const d = document.createElement('div');
    d.className = "card";

    d.innerHTML = `
  <div class="title">${b.title}</div>

  <div class="meta">
    <span class="date">${getLastDate(b)}</span>
//    <span class="fav">${getFavLabel(b.fav)}</span>
    <span class="count">${(b.dates?.length || 0)}回</span>
  </div>

  <div class="tags">
    ${(b.tagIds || []).map(id=>{
      const t = tagMaster.find(x=>x.id===id);
      if(!t) return "";
      return `<span class="tag" style="background:${t.color}">${t.name}</span>`;
    }).join("")}
  </div>
`;

document.getElementById("tag-filter").style.display =
  uiSettings.showTags ? "flex" : "none";
document.getElementById("type-filter").style.display =
  uiSettings.showTypeFilter ? "flex" : "none";

if(uiSettings.showSummary){
  renderSummary();
}

if(uiSettings.showRecent){
  renderRecentBooks();
}

    d.onclick = ()=> openDetailById(b.id);
    el.appendChild(d);
  });
}//function renderHome()おわり


//表示制御
function applyUIVisibility(page){
  const master = (uiMode === "on");

  const search = document.getElementById("search");
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


function renderViewMode(targetId = "view-mode"){
  const el = document.getElementById(targetId);
  if(!el) return;

  el.innerHTML = "";

  const modes = [
    { id: "card", label: "カード" },
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

      renderHome();                 // 🔥 これ必須
      renderViewMode(targetId);     // 見た目更新
    };

    el.appendChild(btn);
  });
}//function renderViewMode()おわり


//本生成の関数
function createBookSpine(b){
  const d = document.createElement('div');

  const c1 = getTagColor(b.tagIds?.[0]);
  const c2 = getTagColor(b.tagIds?.[1] || b.tagIds?.[0]);
  const c3 = getTagColor(b.tagIds?.[2] || b.tagIds?.[0]);

  const base = 15;
  const extra = Math.min((b.title || "").length * 1.5, 40);

  d.style.width = (base + extra) + "px";
  d.style.height = "130px";
  d.style.margin = "1px";
  d.style.borderRadius = "3px 5px 5px 3px";
  d.style.display = "flex";
  d.style.flexDirection = "column";
  d.style.borderRight = "3px solid rgba(0, 0, 0, 0.2)";
  d.style.overflow = "visible";

  if(colorMode === "single") d.style.background = c1;
  if(colorMode === "gradient"){
  d.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
}
  if(colorMode === "split") {d.style.background = `linear-gradient(${c1} 0%, ${c1} 75%, ${c2} 75%)`;}
  if(colorMode === "stripe"){
    d.style.background = `linear-gradient(
      ${c1} 0%, ${c1} 3%,
      ${c3} 3%, ${c3} 6%,
      ${c1} 6%, ${c1} 75%,
      ${c2} 75%, ${c2} 100%
    )`;
  }
  
  if(b.type === "wish"){
	d.style.opacity = "0.8";
	}

  const title = document.createElement('div');
  title.textContent = b.title;
  
  //縦書き
  title.style.writingMode = "vertical-rl"; //!
  title.style.textOrientation = "mixed";
  
  //レイアウト安定
  title.style.display = "flex"; //!
  title.style.width = "100%";
  title.style.height = "100%";

  //はみ出し対策
  title.style.overflow = "visible";//visible:hidden
  title.style.wordBreak = "break-all";
  
  //見た目調整
  title.style.fontSize = "9px"; //!
  title.style.lineHeight = "1.2";
  title.style.paddingTop = "8px";
  title.style.letterSpacing = "0.05em";
  
  //色
  title.style.color = "#fff"; //!
  
//  title.style.flex = "1";
  title.style.alignItems = "center"; //! flex-start
  title.style.justifyContent = "flex-start"; //! center
  title.style.textAlign = "left";
//  title.style.textOverflow = "ellipsis";
//  title.style.whiteSpace = "nowrap";
  title.style.paddingBottom = "4px";
//  title.style.maxHeight = "100%";

  const fav = document.createElement('div');
  const val = Math.min(b.fav || 0, 4);
  fav.textContent = val === 4 ? "👑" : "★".repeat(val);
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
const badge = document.createElement("div");
//badge.textContent = getFavLabel(b.fav);
badge.style.position = "absolute";
badge.style.bottom = "2px";
badge.style.right = "2px";
badge.style.fontSize = "10px";
badge.style.opacity = "0.8";
badge.style.writingMode = "vertical-rl";
badge.style.height = "30px";
badge.style.alignItems = "center";
badge.style.justifyContent = "flex-end";
badge.style.paddingBottom = "5px";

d.style.position = "relative";
d.appendChild(badge);


  return d;
}//function createBookSpine()おわり





//本棚背表紙モード
function renderShelf(el, sorted){
console.log("renderShelf start", sorted.length);

  el.innerHTML = "";

  const container = document.createElement('div');
  container.style.width = "100%";
  el.appendChild(container);

  const tempRow = document.createElement('div');
  tempRow.style.display = "flex";
  tempRow.style.flexWrap = "wrap";
  tempRow.style.alignItems = "flex-end";

  const items = [];

  // ① 一旦全部入れる（行判定用）
  sorted.forEach(b=>{
  try{
    const d = createBookSpine(b);
    tempRow.appendChild(d);
    items.push(d);
  }catch(e){
    console.error("createBookSpine error", b, e);
  }
});

  container.appendChild(tempRow);

  // ② 行ごとに分解
  requestAnimationFrame(()=>{
  	
    let rows = [];
    let currentRow = [];
    let currentTop = null;

    items.forEach(item=>{
      if(currentTop === null){
        currentTop = item.offsetTop;
      }

      if(item.offsetTop !== currentTop){
        rows.push(currentRow);
        currentRow = [];
        currentTop = item.offsetTop;
      }

      currentRow.push(item);
    });

    if(currentRow.length) rows.push(currentRow);

    // ③ 再構築
    container.innerHTML = "";
    
      rows.forEach(rowItems=>{
      const row = document.createElement('div');
      row.style.display = "flex";
      row.style.alignItems = "flex-end";

      rowItems.forEach(item=>{
        row.appendChild(item);
      });

      container.appendChild(row);

      // 棚板
      const shelf = document.createElement('div');
      shelf.style.width = "100%";
      shelf.style.height = "6px";
      shelf.style.background = "#caa46a";
      shelf.style.margin = "4px 0 12px";
      shelf.style.borderRadius = "3px";

      container.appendChild(shelf);
    });
});
}//function renderShelf()おわり


//本のビュー切り替え
function setView(mode){
  viewMode = mode;
  localStorage.setItem("viewMode", mode);
  renderHome();
}//function setView()おわり




//★★タグ関連ここから
//タグ色
function getTagColor(tagId){
  const t = tagMaster.find(x => x.id === tagId);
  return t?.color || "#999";
}//function getTagColor()おわり

//背表紙（単色）
function getBookColor(book){
  if(Array.isArray(book.tagIds) && book.tagIds.length){
    return getTagColor(book.tagIds[0]);
  }
  return "#ccc";
}//function getBookColor()おわり



//タグで絞込み
function renderTagFilter(){
  const el = document.getElementById('tag-filter')
  if(!el) return;
  el.innerHTML = "";

  // 全解除ボタン
  const all = document.createElement('button');
	all.textContent = "すべて"; 
  
	all.style.margin = "3px";
	all.style.padding = "2px 8px";
	all.style.fontSize = "12px";
	all.style.borderRadius = "999px";
	all.style.border = "1px solid #999";
	all.style.background = "transparent";
	all.style.color = "#666";
  
 if(selectedTagId === null){
  all.style.background = "#666";
  all.style.color = "#fff";
}
  
  all.onclick = ()=>{
    selectedTagId = null;
        
    localStorage.setItem("selectedTagId", "");
    
    renderHome();
    renderTagFilter(); //選択状態更新
  };
  
  el.appendChild(all);

  // タグ一覧
  tagMaster.forEach(t=>{
    const btn = document.createElement('button');
    btn.textContent = t.name;
    
   btn.style.margin = "3px";
   btn.style.padding = "2px 8px";
   btn.style.fontSize = "12px";
   btn.style.borderRadius = "999px"; // ★丸くする
   btn.style.cursor = "pointer";
   btn.style.border = `1px solid ${t.color}`;
   btn.style.background = "transparent";
   btn.style.color = t.color;
       
    //選択中の見た目
   if(t.id === selectedTagId){
  btn.style.background = t.color;
  btn.style.color = "#fff";
}

    btn.onclick = ()=>{
      selectedTagId = t.id;
      
      localStorage.setItem("selectedTagId", selectedTagId || "");
      
      renderHome();
      renderTagFilter(); //見た目更新
    };

    el.appendChild(btn);
  });
}//function renderTagFilter()おわり

//文字色対策
function getTextColor(bg){
  return "#fff"; // とりあえず白固定でもOK
}//function getTextColor()おわり


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
}//function getTextColor()おわり
//★★タグ関連ここまで



//★★タイプフィルター（ウィッシュリスト）
function renderTypeFilter(){
  const el = document.getElementById("type-filter");
  if(!el) return;

  el.innerHTML = `
    <button 
		class="${selectedType==='all' ? 'active' : ''}"
		onclick="setTypeFilter('all')">
      すべて
    </button>

    <button 
      class="${selectedType==='normal' ? 'active' : ''}"
      onclick="setTypeFilter('normal')">
      読書
    </button>
    
    <button
      class="${selectedType==='unread' ? 'active' : ''}"
      onclick="setTypeFilter('unread')">
      未読
    </button>

    <button 
      class="${selectedType==='wish' ? 'active' : ''}"
      onclick="setTypeFilter('wish')">
      ウィッシュ
    </button>
  `;
}//function renderTypeFilter()おわり

function setTypeFilter(type){
  selectedType = type;
  renderTypeFilter(); //再描画で色変更
  renderHome();
}//function setTypeFilter()おわり


//★★ワンクリックでタイプ切替
function toggleType(book){
	book.type = (book.type === "wish") ? "normal" : "wish";
	saveData();
	openDetail(book);
}//function toggleTypeおわり



function markAsRead(book){
  const today = new Date().toISOString().slice(0,10);

  book.type = "normal";

  if(!Array.isArray(book.dates)){
    book.dates = [];
  }

  book.dates.push(today);

  saveData();
  openDetail(book);
}//function markAsRead()おわり


//★★タイプフィルターおわり



//背表紙カラーモード変更描画
function renderColorMode(targetId = "color-mode"){
  const el = document.getElementById(targetId);
  if(!el) return;

  el.innerHTML = "";

  const modes = [
    { id: "single", label: "単色" },
    { id: "gradient", label: "グラデ" },
    { id: "split", label: "分割" },
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

      renderHome();              // 🔥
      renderColorMode(targetId);
    };

    el.appendChild(btn);
  });
}//function renderColorMode()おわり


//★★ソートここから
function sortBooks(list){
  return [...list].sort((a,b)=>{
    let result = 0;

    if(sortKey === "title"){
      result = (a.title || "").localeCompare(
        (b.title || ""),
        'ja',
        { numeric: true }
      );
    }

    if(sortKey === "fav"){
      result = (a.fav || 0) - (b.fav || 0);
    }

    if(sortKey === "date"){
      result = (a.dates?.[0] || "").localeCompare(b.dates?.[0] || "");
    }

    return sortOrder === "asc" ? result : -result;
  });
}//function sortBooks()おわり


//ソートUI
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

      renderHome();          // 🔥
      renderSort(targetId);
    };

    el.appendChild(btn);
  });
}//function renderSort()おわり




//★★ソートここまで


//ボタンエフェクト
function pressEffect(el){
	el.style.transform = "scale(0.95)";
	setTimeout(()=>{
		el.style.transform = "scale(1)";
	},100);
}//function pressEffect()おわり


//常に正しい本を取得
function getBookById(id){
	return books.find(x => String(x.id) === String(id));
}//function getBookById()おわり


function getFavLabel(val){
	if(val >= 4) return "👑";
	return "★".repeat(val || 0);
	}//function getFavLabel()おわり
	
//日付削除
function removeDate(bookId, index){
  const b = getBookById(bookId);
  if(!b || !b.dates) return;

  b.dates.splice(index,1);

  saveData();
  openDetail(b);
}//function removeDate()おわり

//日付編集
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
}//function editDate()おわり

//補助
function getLastDate(book){
  if(!book.dates || !book.dates.length) return "未読";
  return book.dates[book.dates.length-1];
}


//読書状態ステータス
function getReadStatus(book){
	if(book.type === "wish") return "ウィッシュ";

  const count = book.dates?.length || 0;
  if(count === 0) return "🔖未読";
  if(count === 1) return "✔️読了";
  return `🔂再読 ${count}回`;
}//function getReadStatus()おわり


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
    span.style.color = "#fff";
  } else {
    span.textContent = `再読 ${count}回`;
    span.style.background = "#4c808d";
    span.style.color = "#fff";
  }

  return span;
}//function createReadBadge()おわり


//★★ここから本表示関連
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
		<button id="type-btn">${book.type === "wish" ? "📥 本棚に入れる" : "⭐️ ウィッシュに追加"}</button>
		<button id="add-date-btn">
		${book.dates?.length ? "🔂再読" : "✔️読了にする"}</button>
	</div>
<br>

<div>
  読了日:${(book.dates && book.dates.length > 0)
    ? book.dates.map((d,i)=>`
      <div>
        ${d}
        <span onclick="removeDate('${book.id}', ${i})" style="color:red;cursor:pointer;">  ：  ❎  ：  </span>
        <span onclick="editDate('${book.id}', ${i})" style="cursor:pointer;">✏️</span>
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


  // ⭐ 評価ボタン
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
}//function openDetail()おわり
		

//本詳細でシリーズを開く
function openSeriesById(id){
  const s = series.find(x=>x.id === id);
  if(s) openSeries(s);
}//function openSeriesById()おわり

//シリーズで表示をまとめる
function renderSeriesShelf(el, sorted){
  el.innerHTML = "";

  series.forEach(s=>{
    const relatedBooks = sorted.filter(b =>
      Array.isArray(s.bookIds) && s.bookIds.includes(b.id)
    );

    if(!relatedBooks.length) return;

    const title = document.createElement('div');
    title.textContent = `▶︎ ${s.name} (${relatedBooks.length})`;
    title.style.margin = "12px 4px 4px";
    title.style.fontWeight = "bold";
    title.style.cursor = "pointer";
    
    const isOpen = openedSeries[s.id];
    
    if(isOpen){
      title.textContent = `▽ ${s.name} (${relatedBooks.length})`;
    }
    	
    title.onclick = ()=>{
      openedSeries[s.id] = !openedSeries[s.id];
      renderHome();
    };

    el.appendChild(title);

    if(isOpen){
      const shelfBox = document.createElement('div');
      renderShelf(shelfBox, relatedBooks);
      el.appendChild(shelfBox);
    }
  });
}//function renderSeriesShelf()おわり

//★★ここまで本表示関連


//★★カレンダー


function getReadingMap(){
  const map = {};

  books.forEach(b=>{
    (b.dates || []).forEach(d=>{
      map[d] = (map[d] || 0) + 1;
    });
  });

  return map;
}//function getReadingMap()おわり



//カレンダー月送り

function changeMonth(diff){
  const y = currentMonth.getFullYear();
  const m = currentMonth.getMonth();
  
  currentMonth = new Date(y, m + diff, 1);
  renderCalendar();
}


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
  		cell.style.color = count >= 3 ? "#fff" : "#333";
  		//textColor = alpha > 0.4 ? "#fff" : "#333";
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
    
    // ✅ ここが超重要
    grid.appendChild(cell);
  }

  el.appendChild(grid);
}//function renderCalendar()おわり

//カレンダー開くやつ
function openCalendar(){
  go('calendar');
  renderCalendar();
}


function getHeatColor(count){
  if(count === 0) return "";
  if(count === 1) return "#f8d8c6"; //乙女
  if(count === 2) return "#f7ed92"; //承和
  if(count === 3) return "#fddb5d"; //くちなし
  if(count === 4) return "#aacf53"; //萌葱
  return "#78ccd2"; //白群
  }



  
//★★ここまでカレンダー


//モーダル設定

function openDayModal(list){
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
  m.style.borderRadius = "8px";

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
      <div style="font-weight:bold">${b.title}</div>
      <div style="font-size:12px;color:#666">${getReadStatus(b)}</div>`;

    d.onclick = ()=>{
      m.remove();
      openDetail(b);
    };
    
    box.appendChild(d);
  });

  m.appendChild(box);
  m.onclick = ()=> m.remove();

  document.body.appendChild(m);
}//openDayModal()おわり

//ここまでモーダル設定


//今年・今月◯冊取得
function getMonthlyCount(){
  const now = new Date();
  const ym = now.toISOString().slice(0,7);

  let count = 0;
  books.forEach(b=>{
    (b.dates || []).forEach(d=>{
      if(d.startsWith(ym)) count++;
    });
  });
  return count;
}

function getYearlyCount(){
  const now = new Date();
  const y = now.getFullYear();

  let count = 0;
  books.forEach(b=>{
    (b.dates || []).forEach(d=>{
      if(d.startsWith(String(y))) count++;
    });
  });
  return count;
}

//今年：今月◯冊の表示
function renderSummary(){
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

    html += `
  <div class="goal-box">
    🎯 ${year} / ${yearlyGoal}冊 (${rate}%)
    <div class="goal-bar">
      <div class="goal-fill" style="width:${rate}%"></div>
    </div>
  </div>
`;
  }

  el.innerHTML = html;
}


//最近読んだ3冊
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
      <div class="meta">${getLastDate(b)}</div>
    `;

    d.onclick = ()=> openDetail(b);
    el.appendChild(d);
  });
}


//小カードで最近読んだ本
function renderRecentBooks(){
  const el = document.getElementById("recent-books");
  if(!el) return;

  // 日付でソート（新しい順）
  const sorted = [...books]
    .filter(b => b.dates?.length)
    .sort((a,b)=>{
      return getLastDate(b).localeCompare(getLastDate(a));
    })
    .slice(0,10);

  el.innerHTML = `
    <div class="section-title">📚 最近読んだ本</div>
    <div class="carousel" id="recent-carousel"></div>
  `;

  const box = document.getElementById("recent-carousel");

  sorted.forEach(b=>{
    const d = document.createElement("div");
    d.className = "carousel-item";

    d.innerHTML = `
      <div style="font-weight:bold;">${b.title}</div>
      <div style="font-size:12px;color:#666;">
        ${getLastDate(b)}
      </div>
      <div style="margin-top:4px;">
        ${getFavLabel(b.fav)}
      </div>
    `;

    d.onclick = ()=> openDetail(b);
    box.appendChild(d);
  });
}



//★★ここからシリーズ表示関連
// シリーズ一覧
function renderSeries(){
  const list = document.getElementById('page-series');
  list.innerHTML = "";

	series.forEach(s=>{
			const d = document.createElement('div');
			d.className = "card";
			d.textContent = s.name;

    d.onclick = ()=> openSeries(s);
    list.appendChild(d);
  });
}//function renderSeries()おわり




// シリーズ詳細
function openSeries(s){
  go('detail');

  const el = document.getElementById('page-detail');

	//シリーズ→本★完了
  const relatedBooks = books.filter(b=>{
    return Array.isArray(s.bookIds) && s.bookIds.includes(b.id);
  });
  	
 	 //シリーズ→人物★完了
  const relatedCharacters = characters.filter(c=>{
  return Array.isArray(c.seriesIds) && c.seriesIds.includes(s.id);
  });
  

//シリーズ関連：本HTML表示
  el.innerHTML = `
    <h2>${s.name}</h2>
    <div>冊数: ${relatedBooks.length}</div>
    <hr>
    <div id="series-books"></div>
    <button onclick="go('series')">戻る</button>
  `;

//シリーズ関連：人物HTML表示
el.innerHTML += `
  <hr>
  <div>登場人物:</div>
  <div id="series-chars"></div>
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
}//function openSeries()おわり


//★★ここまでシリーズ表示関連




//人物一覧
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
}//function renderCharacters()おわり

//人物詳細
function openCharacter(c){
  go('detail');

  const el = document.getElementById('page-detail');

 // 人物→シリーズ★完了
  const relatedSeries = series.filter(s=>{
    return Array.isArray(c.seriesIds) && c.seriesIds.includes(s.id);
  });

  // 人物→本★完了
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


console.log("ここまでOK");
//設定ページ
function renderSettings(){
  const el = document.getElementById("page-settings");
  if(!el) return;

  el.innerHTML = `
    <h2 style="padding:12px;">設定</h2>

    <div class="settings-group">
      <div class="settings-header">表示</div>
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

    <div class="settings-group">
      <div class="settings-header">並び</div>
      <div class="settings-list">
        <div class="settings-item" onclick="openSettingSelect('sort')">
          並び順
          <div class="settings-value">${getSortLabel()}</div>
        </div>
      </div>
    </div>

<div class="settings-group">
  <div class="settings-header">ホームUI</div>
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
<div class="settings-group">
  <div class="settings-header">目標</div>
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

//UIの表示制御ベース
function applyUIVisibility(page){
  const show = (uiMode === "on");

  // 要素取得
  const search = document.getElementById("search");
  const summary = document.getElementById("home-summary");
  const tags = document.getElementById("tag-filter");
  const type = document.getElementById("type-filter");
  const recent = document.getElementById("recent-books");

  // 🔍 検索バー
  if(search){
    if(show && ["home","series","characters","calendar"].includes(page)){
      search.style.display = "block";
    } else {
      search.style.display = "none";
    }
  }

  // 🏠 ホーム限定UI
  const homeOnly = (show && page === "home");

  if(summary) summary.style.display = homeOnly ? "block" : "none";
  if(tags) tags.style.display = homeOnly ? "flex" : "none";
  if(type) type.style.display = homeOnly ? "flex" : "none";
  if(recent) recent.style.display = homeOnly ? "block" : "none";
}


function updateUIVisibility(page){

  const showUI = uiSettings; // 略

  const search = document.getElementById("topbar");
  const summary = document.getElementById("home-summary");
  const recent = document.getElementById("recent-books");
  const tags = document.getElementById("tag-filter");
  const type = document.getElementById("type-filter");

  // 🔴 全OFF
  if(!showUI.recent && !showUI.summary && !showUI.tags && !showUI.type){
    if(search) search.style.display = "none";
    if(summary) summary.style.display = "none";
    if(recent) recent.style.display = "none";
    if(tags) tags.style.display = "none";
    if(type) type.style.display = "none";
    return;
  }

  // 🔵 検索バー
  const showSearchPages = ["home","calendar","series","characters"];
  if(search){
    search.style.display =
      showSearchPages.includes(page) ? "flex" : "none";
  }

  // 🟢 ホームだけ
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



function toggleUIMode(e){
  e.stopPropagation();

  uiMode = (uiMode === "on") ? "off" : "on";
  localStorage.setItem("uiMode", uiMode);

  renderSettings();
  go('home'); // 再適用
}


//トグル動作
function toggleTags(e){
  e.stopPropagation();

  showTags = !showTags;
  localStorage.setItem("showTags", showTags);

  setupTagToggle(); // ←追加
  renderSettings();
  renderHome();
}


function toggleUI(e){
  e.stopPropagation();

  uiMode = (uiMode === "on") ? "off" : "on";
  localStorage.setItem("uiMode", uiMode);

  renderSettings();
  renderHome();
  applyUIVisibility("home"); // ←即反映
}


function toggleUIItem(e, key){
  e.stopPropagation();

  uiSettings[key] = !uiSettings[key];
  localStorage.setItem("uiSettings", JSON.stringify(uiSettings));

  renderSettings();
  updateUIVisibility("home"); // ←追加
  renderHome();
}


function toggleGoal(e){
  e.stopPropagation();

  enableGoal = !enableGoal;
  localStorage.setItem("enableGoal", enableGoal);

  renderSettings();
  renderHome(); // 🔥 即反映
}

function changeGoal(val){
  yearlyGoal = Number(val) || 0;
  localStorage.setItem("yearlyGoal", yearlyGoal);

  renderHome(); // 🔥 即反映
}



//完全UIOFFフラグ
function isUIAllOff(){
  return !uiSettings.recent &&
         !uiSettings.summary &&
         !uiSettings.tags &&
         !uiSettings.type;
}


//「次の画面」っぽいやつ
function openSettingSelect(type){
  const el = document.getElementById("page-settings");

  let list = [];

  if(type === "view"){
    list = [
      {id:"card", label:"カード"},
      {id:"shelf", label:"本棚"},
      {id:"shelf-series", label:"シリーズ"}
    ];
  }

  if(type === "color"){
    list = [
      {id:"single", label:"単色"},
      {id:"gradient", label:"グラデ"},
      {id:"split", label:"分割"},
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


//ラベル表示
function getViewLabel(){
  return {
    card:"カード",
    shelf:"本棚",
    "shelf-series":"シリーズ"
  }[viewMode];
}

function getColorLabel(){
  return {
    single:"単色",
    gradient:"グラデ",
    split:"分割",
    stripe:"目印"
  }[colorMode];
}

function getSortLabel(){
  return {
    title:"名前",
    fav:"評価",
    date:"日付"
  }[sortKey];
}

function getRecentViewLabel(){
  return {
    card:"カード",
    spine:"背表紙"
  }[recentViewMode];
}



// データ読み込み
async function loadData(){

  // ⭐ ここに入れる（関数の一番上）
  if(!window.db || !window.doc || !window.getDoc){
    console.log("⏳ Firebase待機中...");
    setTimeout(loadData, 100);
    return;
  }

  try{
    // 🔥 Firestoreから取得
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

      console.log("🔥 Firestoreから読み込み");

    } else {

      // 🔸 Firestore空ならローカル
      const saved = localStorage.getItem("bookAppData");

      if(saved){
        const data = JSON.parse(saved);

        books = data.books || [];
        series = data.series || [];
        characters = data.characters || [];
        tagMaster = data.tagMaster || [];

        console.log("📦 ローカルから読み込み");

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

    // UI初期化
    renderTagFilter();
    renderColorMode();
    renderViewMode();
    renderSort();
    setupTagToggle();
    renderTypeFilter();
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
