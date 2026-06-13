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

let addBookTagSections = {
  tags: false,
  hiddenTags:false
 };
let addBookSeriesSections = { series: false };
let detailSections = {
  tags:false,
  series:false,
  hiddenTags:false,
  quotes:false,
  readHistory:false
};
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
  if(page === "quotes") renderQuotes();
  if(page === "stats") renderStats();
  if(page === "detail-search") renderDetailSearch();
  if(page === "tags") renderTags();

  currentPage = page;

  const titles = {
    home:"ホーム",
    series:"シリーズ",
    characters:"人物",
    quotes:"引用",
    stats:"統計",
    "detail-search":"詳細検索",
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
