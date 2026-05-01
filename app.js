// ★ あなたのJSON URL
const DATA_URL = "https://raw.githubusercontent.com/sinjouji/my-b0o0oksd6t6/main/data.json";

let books = [];








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
}


//ホーム表示
function renderHome(){
  const el = document.getElementById('page-home');
  el.innerHTML = "";

  books.forEach(b=>{
    const d = document.createElement('div');
    d.className = "card";
    d.textContent = b.title;

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

    renderHome(); // ★ここに変更

  }catch(e){
    console.error(e);
    alert("読み込み失敗: " + e.message);
  }

  // ★最後に必ず
  go('home');
}

  // ★絶対最後に実行

  const l = document.getElementById('loading');

  if(l) l.classList.add('hidden');

}

function render(){

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


