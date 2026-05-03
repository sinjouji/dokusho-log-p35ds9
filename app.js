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

let viewMode = localStorage.getItem("viewMode") || "card"; // "list"or "shelf"



// ページ切替
function go(name){
  document.querySelectorAll('.page').forEach(p=>{
    p.classList.add('hidden');
  });

  const target = document.getElementById('page-' + name);
  if(target){
    target.classList.remove('hidden');
  }

  if(name === 'series') renderSeries();
  if(name === 'characters') renderCharacters(); // ★追加
}



// ホーム（本のリスト表示）
function renderHome(){
  const el = document.getElementById('page-home');
  el.innerHTML = "";

  const keyword = (document.getElementById('search')?.value || "").toLowerCase();

  const filtered = books.filter(b =>{
    const matchTitle = (b.title || "").toLowerCase().includes(keyword);

    const matchTag = !selectedTagId ||
      (Array.isArray(b.tagIds) && b.tagIds.includes(selectedTagId));

    return matchTitle && matchTag;
  });


  // ⭐ここでソート
  //filtered.sort((a,b)=> (b.fav || 0) - (a.fav || 0)); //評価順
 //  filtered.sort((a,b)=> (b.dates?.[0] || "").localeCompare(a.dates?.[0] || "")); //日付順
  // filtered.sort((a,b)=> a.title.localeCompare(b.title)); //タイトル順


//分岐
	//if(viewMode === "shelf"){
	//	renderShelf(el, filtered);
	//	return;
	//}
	
	if(viewMode === "shelf"){
		renderSeriesShelf(el, filtered);
		return;
	}
	
	
	
  // 本棚リスト表示
  filtered.forEach(b=>{
    const d = document.createElement('div');
    d.className = "card";
        
    d.innerHTML = `
    				<div style="font-weight:bold">${b.title}</div>
    	`;

    d.onclick = ()=> openDetail(b);
    el.appendChild(d);
  });
}



function renderViewMode(){
  const el = document.getElementById('view-mode');
  el.innerHTML = "";

  const modes = [
    { id: "card", label: "カード" },
    { id: "shelf", label: "本棚" }
  ];

  modes.forEach(m=>{
    const btn = document.createElement('button');
    btn.textContent = m.label;

    // 共通スタイル（チップ風）
    btn.style.margin = "3px";
    btn.style.padding = "2px 8px";
    btn.style.fontSize = "12px";
    btn.style.borderRadius = "999px";
    btn.style.border = "1px solid #333";
    btn.style.background = "transparent";
    btn.style.color = "#333";

    // 選択中
    if(m.id === viewMode){
      btn.style.background = "#333";
      btn.style.color = "#fff";
    }

    btn.onclick = ()=>{
      viewMode = m.id;
      localStorage.setItem("viewMode", viewMode);

      renderHome();
      renderViewMode(); // 見た目更新
    };

    el.appendChild(btn);
  });
}




//本棚背表紙モード
function renderShelf(el, books){
  el.innerHTML = "";
  
  const perRow = 10; //好きに調整OK
  
  for(let i = 0; i < books.length; i += perRow){
  const rowBooks = books.slice(i, i + perRow);

  const row = document.createElement('div');
  row.style.display = "flex";
  row.style.alignItems = "flex-end";

  rowBooks.forEach(b=>{
    const d = document.createElement('div');

    const c1 = getTagColor(b.tagIds?.[0]);
    const c2 = getTagColor(b.tagIds?.[1] || b.tagIds?.[0]);
    const c3 = getTagColor(b.tagIds?.[2] || b.tagIds?.[0]);

    const h = 120 + Math.floor(Math.random()*10);
    const base = 28;
    const extra = Math.min((b.title || "").length * 1.2, 40);

    d.style.width = (base + extra) + "px";
    d.style.borderRight = "3px solid rgba(0, 0, 0, 0.2)";
    d.style.height = h + "px";
    d.style.margin = "4px 2px";
    d.style.borderRadius = "3px";
    d.style.display = "flex";
    d.style.flexDirection = "column";
    d.style.overflow = "visible";
    d.style.transform = `rotate(${Math.random()*3 - 1}deg)`;

    // 🎨 背表紙カラー
    if(colorMode === "single"){
      d.style.background = c1;
    }
    if(colorMode === "gradient"){
      d.style.background = `linear-gradient(${c1}, ${c2})`;
    }
    if(colorMode === "split"){
      d.style.background = `linear-gradient(${c1} 0%, ${c1} 75%, ${c2} 75%, ${c2} 100%)`;
    }
    if(colorMode === "stripe"){
      d.style.background = `linear-gradient(
        ${c1} 0%,
        ${c1} 10%,
        ${c3} 10%,
        ${c3} 15%,
        ${c1} 15%,
        ${c1} 75%,
        ${c2} 75%,
        ${c2} 100%
      )`;
    }

    const title = document.createElement('div');
	title.textContent = b.title;

	title.style.writingMode = "vertical-rl";
	title.style.whiteSpace = "normal";
	title.style.overflow = "visible";
	title.style.wordBreak = "break-all";

	title.style.fontSize = "9px";
	title.style.color = "#fff";
	title.style.padding = "6px 2px";
	title.style.alignItems = "center";
	title.style.flex = "1";

    const fav = document.createElement('div');
    fav.style.height = "30px";
    fav.style.display = "flex";
    fav.style.alignItems = "center";
    //fav.style.textAlign = "left";
    fav.style.justifyContent = "right";
    fav.style.fontSize = "8px";
    fav.style.color = "#fff";
    fav.style.flexShrink = "0";
    fav.style.writingMode = "vertical-rl";
    fav.textContent = "★".repeat(b.fav || 0);

    d.appendChild(title);
    d.appendChild(fav);

    d.onclick = ()=> openDetail(b);

    // ❗ここが重要
    row.appendChild(d);
  });

  // 本の行を追加
  el.appendChild(row);

  // 棚板
  const shelf = document.createElement('div');
  shelf.style.width = "100%";
  shelf.style.height = "6px";
  shelf.style.background = "#caa46a";
  shelf.style.margin = "0 0 12px";
  shelf.style.borderRadius = "3px";

  el.appendChild(shelf);
}}

//本のビュー切り替え
function setView(mode){
  viewMode = mode;
  localStorage.setItem("viewMode", mode);
  renderHome();
}



//タグ色
function getTagColor(tagId){
  const t = tagMaster.find(x => x.id === tagId);
  return t?.color || "#999";
}

//背表紙（単色）
function getBookColor(book){
  if(Array.isArray(book.tagIds) && book.tagIds.length){
    return getTagColor(book.tagIds[0]);
  }
  return "#ccc";
}



//タグで絞込み
function renderTagFilter(){
  const el = document.getElementById('tag-filter');
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
}

//文字色対策
function getTextColor(bg){
  return "#fff"; // とりあえず白固定でもOK
}


//背表紙カラーモード変更描画
function renderColorMode(){
  const el = document.getElementById('color-mode');
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
    
      btn.style.background = "transparent";
      btn.style.color = "#999";
      btn.style.margin = "3px";
      btn.style.padding = "2px 8px";
      btn.style.fontSize = "12px";
      btn.style.borderRadius = "999px";
      btn.style.border = "1px solid #999";

    if(m.id === colorMode){
   btn.style.background = "#666";
   btn.style.color = "#fff";
    }

    btn.onclick = ()=>{
      colorMode = m.id;
      
      localStorage.setItem("colorMode", colorMode);
      
      renderHome();
      renderColorMode();
    };

    el.appendChild(btn);
  });
}





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

 // ① まず全部セット
el.innerHTML = `
  <h2>${book.title}</h2>

  <div>⭐ ${book.fav || 0}</div>

  <div>
    読了日: ${book.dates?.[0] || "未読"}
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

  <button onclick="go('home')">戻る</button>
`;

// ② そのあとに追加
el.innerHTML += `
  <hr>
  <div>登場人物:</div>
  <div id="book-chars"></div>
`;

//本→登場人物の描画★完了
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
}}

//本詳細でシリーズを開く
function openSeriesById(id){
  const s = series.find(x=>x.id === id);
  if(s) openSeries(s);
}

//シリーズで表示をまとめる
function renderSeriesShelf(el, books){
  el.innerHTML = "";

  series.forEach(s=>{
    const relatedBooks = books.filter(b=>{
      return Array.isArray(s.bookIds) && s.bookIds.includes(b.id);
    });

    if(!relatedBooks.length) return;

    // タイトル
    const title = document.createElement('div');
    title.textContent = s.name;
    title.style.margin = "12px 4px 4px";
    title.style.fontWeight = "bold";
    title.style.cursor = "pointer";
    title.onclick = ()=> openSeries(s);

    el.appendChild(title);

    // 本棚
    const shelfBox = document.createElement('div');
    renderShelf(shelfBox, relatedBooks);

    el.appendChild(shelfBox);
  });
}


//★★ここまで本表示関連



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
}




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
if(viewMode === "shelf"){
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
}}


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
}

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
}



// データ読み込み
async function loadData(){
  try{
    const res = await fetch(DATA_URL + "?t=" + Date.now());
    const text = await res.text();
    const data = JSON.parse(text);

    books = data.books || [];
    series = data.series || [];
    characters = data.characters || [];
    tagMaster = data.tagMaster || [];
    renderTagFilter();
    renderColorMode();
    renderViewMode();
    

    renderHome();

  }catch(e){
    console.error(e);
    alert("読み込み失敗: " + e.message);
  }

  go('home');

  const l = document.getElementById('loading');
  if(l) l.classList.add('hidden');


}

// 初回ロード
loadData();
