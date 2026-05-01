// ★ あなたのJSON URL
const DATA_URL = "https://raw.githubusercontent.com/sinjouji/my-b0o0oksd6t6/main/data.json";

let books = [];
let series = [];







function go(name){
  console.log("clicked", name);

  document.querySelectorAll('.page').forEach(p=>{
    p.classList.add('hidden');
  });

  const target = document.getElementById('page-' + name);
  console.log("target:", target); // ★これ追加

  if(target){
    target.classList.remove('hidden');
  }
  
    // ★ここ追加

  if(name === 'series'){
    renderSeries();
  }
}


//ホーム表示
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

    d.onclick = ()=> openDetail(b); // ★追加

    el.appendChild(d);
  });
}


//シリーズ一覧
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


//本詳細ページ
function openDetail(book){
  go('detail');

  const el = document.getElementById('page-detail');

 el.innerHTML = `
  <h2>${book.title}</h2>

  <div>⭐ ${book.fav || 0}</div>

  <div>
    読了日: ${book.dates?.[0] || "未読"}
  </div>

  <div style="margin-top:10px;">
    ${book.memo || ""}
  </div>

  <button onclick="go('home')">戻る</button>
`;
}


//シリーズ詳細
function openSeries(s){
  go('detail');

  const el = document.getElementById('page-detail');

  // このシリーズの本を取得
  const relatedBooks = books.filter(b=>{
  return b.seriesId == s.id || b.series == s.id;
});
// ★ あなたのJSON URL
const DATA_URL = "https://raw.githubusercontent.com/sinjouji/my-b0o0oksd6t6/main/data.json";

let books = [];
let series = [];







function go(name){
  console.log("clicked", name);

  document.querySelectorAll('.page').forEach(p=>{
    p.classList.add('hidden');
  });

  const target = document.getElementById('page-' + name);
  console.log("target:", target); // ★これ追加

  if(target){
    target.classList.remove('hidden');
  }
  
    // ★ここ追加

  if(name === 'series'){
    renderSeries();
  }
}


//ホーム表示
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

    d.onclick = ()=> openDetail(b); // ★追加

    el.appendChild(d);
  });
}


//シリーズ一覧
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


//本詳細ページ
function openDetail(book){
  go('detail');

  const el = document.getElementById('page-detail');

 el.innerHTML = `
  <h2>${book.title}</h2>

  <div>⭐ ${book.fav || 0}</div>

  <div>
    読了日: ${book.dates?.[0] || "未読"}
  </div>

  <div style="margin-top:10px;">
    ${book.memo || ""}
  </div>

  <button onclick="go('home')">戻る</button>
`;
}


//シリーズ詳細
function openSeries(s){
  go('detail');

  const el = document.getElementById('page-detail');

  // このシリーズの本を取得
  const relatedBooks = books.filter(b=>{
  return b.seriesId == s.id || b.series == s.id;
});

console.log("series:", s);
console.log("books sample:", books[0]);

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


async function loadData(){
  try{
    const res = await fetch(DATA_URL + "?t=" + Date.now());
    const text = await res.text();
    const data = JSON.parse(text);

    books = data.books || [];
    series = data.series || [];

    renderHome();

  }catch(e){
    console.error(e);
    alert("読み込み失敗: " + e.message);
  }

  // ★ここに入れる（中に戻す）
  go('home');

  const l = document.getElementById('loading');
  if(l) l.classList.add('hidden');
}



// 初回ロード

loadData();



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


async function loadData(){
  try{
    const res = await fetch(DATA_URL + "?t=" + Date.now());
    const text = await res.text();
    const data = JSON.parse(text);

    books = data.books || [];
    series = data.series || [];

    renderHome();

  }catch(e){
    console.error(e);
    alert("読み込み失敗: " + e.message);
  }

  // ★ここに入れる（中に戻す）
  go('home');

  const l = document.getElementById('loading');
  if(l) l.classList.add('hidden');
}



// 初回ロード

loadData();


