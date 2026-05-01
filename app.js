// ★ あなたのJSON URL
const DATA_URL = "https://raw.githubusercontent.com/sinjouji/my-b0o0oksd6t6/main/data.json";

let books = [];








function go(name){
  document.querySelectorAll('.page').forEach(p=>{
    p.classList.add('hidden');
  });

  document.getElementById('page-' + name).classList.remove('hidden');
}


//ホーム表示
function renderHome(){

typeof go
  
  const el = document.getElementById('page-home');
  el.innerHTML = "";

  books.forEach(b=>{
    const d = document.createElement('div');
    d.className = "card";
    d.textContent = b.title;

    d.onclick = ()=> openDetail(b);

    el.appendChild(d);
  });
}

//詳細ページ
function openDetail(book){
  go('detail');

  const el = document.getElementById('page-detail');

  el.innerHTML = `
    <h2>${book.title}</h2>
    <div>お気に入り: ${book.fav}</div>
    <div>${book.memo || ""}</div>
    <button onclick="go('home')">戻る</button>
  `;
}


async function loadData(){

  try{

    const res = await fetch(DATA_URL + "?t=" + Date.now());

    const text = await res.text();

    const data = JSON.parse(text);

    books = data.books || [];

    render();

  }catch(e){

    console.error(e);

    alert("読み込み失敗: " + e.message);

  }

  // ★絶対最後に実行

  const l = document.getElementById('loading');

  if(l) l.classList.add('hidden');

}

function render(){

  const el = document.getElementById('list');

  el.innerHTML = "";

  books.forEach(b=>{

    const d = document.createElement('div');

    d.className = "card";

    d.innerHTML = `

      <div>${b.title || "（タイトルなし）"}</div>

    `;

    el.appendChild(d);

  });

}

// 初回ロード

loadData();


