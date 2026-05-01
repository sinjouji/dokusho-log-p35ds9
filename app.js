// ★ あなたのJSON URL
const DATA_URL = "https://raw.githubusercontent.com/sinjouji/my-b0o0oksd6t6/main/data.json";



let books = [];

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

function go(name){
  document.querySelectorAll('.page').forEach(p=>{
    p.classList.add('hidden');
  });

  document.getElementById('page-' + name).classList.remove('hidden');
}

// 初回ロード

loadData();


