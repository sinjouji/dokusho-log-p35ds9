// ★ JSON URL
const DATA_URL = "https://raw.githubusercontent.com/sinjouji/my-b0o0oksd6t6/main/data.json";

let books = [];
let series = [];
let characters = [];

// ページ切替
function go(name){
  document.querySelectorAll('.page').forEach(p=>{// ★ JSON URL
const DATA_URL = "https://raw.githubusercontent.com/sinjouji/my-b0o0oksd6t6/main/data.json";

let books = [];
let series = [];
let characters = [];

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


// ホーム（本のリスト）
function renderHome(){
  const el = document.getElementById('page-home');
  el.innerHTML = "";

  books.forEach(b=>{
    const d = document.createElement('div');
    d.className = "card";
    d.innerHTML = `
      <div style="font-weight:bold">${b.title}</div>
      <div style="font-size:12px;color:gray">
        ${b.dates?.[0] || ""}
      </div>
    `;

    d.onclick = ()=> openDetail(b);
    el.appendChild(d);
  });
}

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

//本→登場人物の描画
const list = document.getElementById('book-chars');

relatedCharacters.forEach(c=>{
  const d = document.createElement('div');
  d.className = "card";
  d.textContent = c.name;

  d.onclick = ()=> openCharacter(c);

  list.appendChild(d);
});


//本の詳細でシリーズを開く
function openSeriesById(id){
  const s = series.find(x=>x.id === id);
  if(s) openSeries(s);
}



// シリーズ一覧
function renderSeries(){
  const el = document.getElementById('page-series');
  el.innerHTML = "";

  series.forEach(s=>{
    const d = document.createElement('div');
    d.className = "card";
    d.textContent = s.name;

    d.onclick = ()=> openSeries(s);
    el.appendChild(d);
  });
}


// シリーズ詳細
function openSeries(s){
  go('detail');

  const el = document.getElementById('page-detail');

  const relatedBooks = books.filter(b=>{
    return Array.isArray(s.bookIds) && s.bookIds.includes(b.id);
  });

  el.innerHTML = `
    <h2>${s.name}</h2>
    <div>冊数: ${relatedBooks.length}</div>
    <hr>
    <div id="series-books"></div>
    <button onclick="go('series')">戻る</button>
  `;

  const list = document.getElementById('series-books');

  relatedBooks.forEach(b=>{
    const d = document.createElement('div');
    d.className = "card";
    d.textContent = b.title;

    d.onclick = ()=> openDetail(b);
    list.appendChild(d);
  });
}


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

  // この人物のシリーズ
  const relatedSeries = series.filter(s=>{
    return Array.isArray(c.seriesIds) && c.seriesIds.includes(s.id);
  });
  
  const relatedBooks = books.filter(b=>{
  return relatedSeries.some(s =>
    Array.isArray(s.bookIds) && s.bookIds.includes(b.id)
  );
});

  el.innerHTML = `
    <h2>${c.name}</h2>

    <div style="margin-bottom:10px;">
      ${c.memo || ""}
    </div>

    <hr>

    <div>シリーズ:</div>
    <div id="char-series"></div>
    <div>本</div>
    <div id=""></div>

    <button onclick="go('characters')">戻る</button>
  `;

  const list = document.getElementById('char-series');

  relatedSeries.forEach(s=>{
    const d = document.createElement('div');
    d.className = "card";
    d.textContent = s.name;

    d.onclick = ()=> openSeries(s);

    list.appendChild(d);
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
    p.classList.add('hidden');
  });

  const target = document.getElementById('page-' + name);
  if(target){
    target.classList.remove('hidden');
  }

  if(name === 'series') renderSeries();
  if(name === 'characters') renderCharacters(); // ★追加
}


// ホーム（本のリスト）
function renderHome(){
  const el = document.getElementById('page-home');
  el.innerHTML = "";

  books.forEach(b=>{
    const d = document.createElement('div');
    d.className = "card";
    d.innerHTML = `
      <div style="font-weight:bold">${b.title}</div>
      <div style="font-size:12px;color:gray">
        ${b.dates?.[0] || ""}
      </div>
    `;

    d.onclick = ()=> openDetail(b);
    el.appendChild(d);
  });
}

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
  
  
  el.innerHTML += `
  <hr>
  <div>登場人物:</div>
  <div id="book-chars"></div>
`;

  <button onclick="go('home')">戻る</button>
`;
}

//本→登場人物の描画
const list = document.getElementById('book-chars');

relatedCharacters.forEach(c=>{
  const d = document.createElement('div');
  d.className = "card";
  d.textContent = c.name;

  d.onclick = ()=> openCharacter(c);

  list.appendChild(d);
});


//本の詳細でシリーズを開く
function openSeriesById(id){
  const s = series.find(x=>x.id === id);
  if(s) openSeries(s);
}



// シリーズ一覧
function renderSeries(){
  const el = document.getElementById('page-series');
  el.innerHTML = "";

  series.forEach(s=>{
    const d = document.createElement('div');
    d.className = "card";
    d.textContent = s.name;

    d.onclick = ()=> openSeries(s);
    el.appendChild(d);
  });
}


// シリーズ詳細
function openSeries(s){
  go('detail');

  const el = document.getElementById('page-detail');

  const relatedBooks = books.filter(b=>{
    return Array.isArray(s.bookIds) && s.bookIds.includes(b.id);
  });

  el.innerHTML = `
    <h2>${s.name}</h2>
    <div>冊数: ${relatedBooks.length}</div>
    <hr>
    <div id="series-books"></div>
    <button onclick="go('series')">戻る</button>
  `;

  const list = document.getElementById('series-books');

  relatedBooks.forEach(b=>{
    const d = document.createElement('div');
    d.className = "card";
    d.textContent = b.title;

    d.onclick = ()=> openDetail(b);
    list.appendChild(d);
  });
}


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

  // この人物のシリーズ
  const relatedSeries = series.filter(s=>{
    return Array.isArray(c.seriesIds) && c.seriesIds.includes(s.id);
  });
  
  const relatedBooks = books.filter(b=>{
  return relatedSeries.some(s =>
    Array.isArray(s.bookIds) && s.bookIds.includes(b.id)
  );
});

  el.innerHTML = `
    <h2>${c.name}</h2>

    <div style="margin-bottom:10px;">
      ${c.memo || ""}
    </div>

    <hr>

    <div>シリーズ:</div>
    <div id="char-series"></div>
    <div>本</div>
    <div id=""></div>

    <button onclick="go('characters')">戻る</button>
  `;

  const list = document.getElementById('char-series');

  relatedSeries.forEach(s=>{
    const d = document.createElement('div');
    d.className = "card";
    d.textContent = s.name;

    d.onclick = ()=> openSeries(s);

    list.appendChild(d);
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
