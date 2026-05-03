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


//★★ここまで状態設定

// ページ切替
function go(name){
  document.querySelectorAll('.page').forEach(p=>{
    p.classList.add('hidden');
  });

  const target = document.getElementById('page-' + name);
  if(target){
    target.classList.remove('hidden');
  }
  
  //本一覧の検索欄を別の一覧ページでは隠す
  const topbar = document.getElementById('topbar');
  if(topbar){
  	topbar.style.display = (name === "home") ? "flex" : "none";
  	}

  if(name === 'series') renderSeries();
  if(name === 'characters') renderCharacters(); // ★追加
}



// ホーム（本のリスト表示）
function renderHome(){
  const el = document.getElementById('page-home');
  el.innerHTML = "";

  const keyword = (document.getElementById('search')?.value || "").toLowerCase();

  // ① フィルタ
  const filtered = books.filter(b =>{
    const matchTitle = (b.title || "").toLowerCase().includes(keyword);

    const matchTag = !selectedTagId ||
      (Array.isArray(b.tagIds) && b.tagIds.includes(selectedTagId));

    return matchTitle && matchTag;
  });

  // ② ソート（ここ！！）
  const sorted = sortBooks(filtered);

  // ③ 表示分岐
  if(viewMode === "shelf"){
    renderShelf(el, sorted);
    return;
  }

  if(viewMode === "shelf-series"){
    renderSeriesShelf(el, sorted);
    return;
  }

  // ④ 通常表示
  sorted.forEach(b=>{
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
    { id: "shelf", label: "本棚" },
    { id: "shelf-series", label: "シリーズ" }
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
function renderShelf(el, sorted){
  el.innerHTML = "";

  const container = document.createElement('div');
  el.appendChild(container);

  const tempRow = document.createElement('div');
  tempRow.style.display = "flex";
  tempRow.style.flexWrap = "wrap";
  tempRow.style.alignItems = "flex-end";

  const items = [];

  // ① 一旦全部入れる（行判定用）
  sorted.forEach(b=>{
    const d = createBookSpine(b);
    tempRow.appendChild(d);
    items.push(d);
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
}

//本生成の関数
function createBookSpine(b){
  const d = document.createElement('div');

  const c1 = getTagColor(b.tagIds?.[0]);
  const c2 = getTagColor(b.tagIds?.[1] || b.tagIds?.[0]);
  const c3 = getTagColor(b.tagIds?.[2] || b.tagIds?.[0]);

  const base = 10;
  const extra = Math.min((b.title || "").length * 1.5, 40);

  d.style.width = (base + extra + 3) + "px";
  d.style.height = "130px";
  d.style.margin = "1px";
  d.style.borderRadius = "3px 5px 5px 3px";
  d.style.display = "flex";
  d.style.flexDirection = "column";

  if(colorMode === "single") d.style.background = c1;
  if(colorMode === "gradient") d.style.background = `linear-gradient(${c1}, ${c2})`;
  if(colorMode === "split") d.style.background = `linear-gradient(${c1} 0%, ${c1} 75%, ${c2} 75%)`;
  if(colorMode === "stripe"){
    d.style.background = `linear-gradient(
      ${c1} 0%, ${c1} 10%,
      ${c3} 10%, ${c3} 15%,
      ${c1} 15%, ${c1} 75%,
      ${c2} 75%, ${c2} 100%
    )`;
  }

  const title = document.createElement('div');
  title.textContent = b.title;
  title.style.writingMode = "vertical-rl";
  title.style.fontSize = "8px";
  title.style.color = "#fff";
  title.style.flex = "1";

  const fav = document.createElement('div');
  const val = Math.min(b.fav || 0, 4);
  fav.textContent = val === 4 ? "👑" : "★".repeat(val);
  fav.style.fontSize = "8px";
  fav.style.color = "#fff";
  fav.style.writingMode = "vertical-rl";

  d.appendChild(title);
  d.appendChild(fav);

  d.onclick = ()=> openDetail(b);

  return d;
}



//本のビュー切り替え
function setView(mode){
  viewMode = mode;
  localStorage.setItem("viewMode", mode);
  renderHome();
}




//★★タグ関連ここから
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
  const el = document.getElementById('tag-filter')
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


function setupTagToggle(){
  const btn = document.getElementById('toggle-tags');
  const el = document.getElementById('tag-filter'); // ★ここで取得

	function update(){
  // 初期状態反映
	  el.style.display = showTags ? "flex" : "none";
	  
	  btn.style.background = showTags ? "#333" : "transparent";
	  btn.style.color = showTags ? "#fff" : "#333";
	  btn.style.margin = showTags ? "3px" : "3px";
	  btn.style.padding = showTags? "2px 8px" : "2px 8px";
	  btn.style.fontSize = showTags? "12px" : "12px";
	  btn.style.borderRadius = showTags? "999px" : "999px";
	  btn.style.border = showTags? "0px" : "1px solid #333";
	  }

	update();

  btn.onclick = ()=>{
    showTags = !showTags;
    localStorage.setItem("showTags", showTags);

   update();
  };
}
//★★タグ関連ここまで



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


//★★ソートここから
function sortBooks(arr){
  const list = [...arr]; // 元壊さない

	list.sort((a,b)=>{
		let result = 0;

  if(sortKey === "title"){
    result = (a.title || "").localeCompare(b.title || "");
  }

  if(sortKey === "fav"){
    result = (a.fav || 0) - (b.fav || 0);
  }

  if(sortKey === "date"){
    result = (a.dates?.[0] || "").localeCompare(b.dates?.[0] || "");
  }
  return sortOrder === "asc" ? result : -result;
  });

  return list;
}


//ソートUI
function renderSort(){
  const el = document.getElementById('sort-mode');
  el.innerHTML = "";

  const modes = [
    { id: "title", label: "名前" },
    { id: "fav", label: "評価" },
    { id: "date", label: "日付" }
  ];

  modes.forEach(m=>{
    const btn = document.createElement('button');
    
    //ラベルに矢印つける
    let arrow = "";
    if(m.id === sortKey){
    	arrow = sortOrder === "asc" ? " ↑" : " ↓";
    	}
    
    btn.textContent = m.label + arrow;
	
   //見た目 
    btn.style.margin = "3px";
    btn.style.padding = "2px 8px";
    btn.style.fontSize = "12px";
    btn.style.borderRadius = "999px";
    btn.style.border = "1px solid #333";
    btn.style.background = "transparent";
    btn.style.color = "#333";

    if(m.id === sortKey){
      btn.style.background = "#333";
      btn.style.color = "#fff";
    }

    btn.onclick = ()=>{
    		if(sortKey === m.id){
    			//同じボタンを押す→昇降切り替え
    			sortOrder = (sortOrder === "asc") ? "desc" : "asc";
    		} else {
    			//別ボタン→キー変更＋昇降リセット
    			sortKey = m.id;
    			sortOrder = "asc";
    		}
    
      localStorage.setItem("sortKey", sortKey);
      localStorage.setItem("sortOrder", sortOrder);
      
      renderHome();
      renderSort();
    };

    el.appendChild(btn);
  });
}




//★★ソートここまで



function getFavLabel(val){
	if(val >= 4) return "👑";
	return "★".repeat(val || 0);
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

  // ① HTML
  el.innerHTML = `
    <h2>${book.title}</h2>

    <div id="fav-btn" style="cursor:pointer;font-size:18px;">
      ${getFavLabel(book.fav)}
    </div>

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

  // ② 登場人物エリア
  el.innerHTML += `
    <hr>
    <div>登場人物:</div>
    <div id="book-chars"></div>
  `;

  // ⭐ 評価ボタン
  const favBtn = document.getElementById('fav-btn');

//  favBtn.style.transition = "transform 0.1s";

  favBtn.onclick = ()=>{
    book.fav = (book.fav || 0) + 1;

    if(book.fav > 4){
      book.fav = 1;
    }

 //   favBtn.style.transform = "scale(1.2)";
 //  setTimeout(()=>{
 //     favBtn.style.transform = "scale(1)";
 //   },100);

    favBtn.textContent = getFavLabel(book.fav);

    renderHome();
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
	
	function saveData(){
  fetch(DATA_URL, {
    method: "PUT", // GitHub API使ってるなら別対応必要
    body: JSON.stringify({
      books,
      series,
      characters,
      tagMaster
    })
  });
}
	

//本詳細でシリーズを開く
function openSeriesById(id){
  const s = series.find(x=>x.id === id);
  if(s) openSeries(s);
}

//シリーズで表示をまとめる
function renderSeriesShelf(el, list){
  el.innerHTML = "";

  series.forEach(s=>{
  
    const relatedBooks = list.filter(b =>
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
    renderSort();
    setupTagToggle();

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
console.log("ここまで読めてる");
