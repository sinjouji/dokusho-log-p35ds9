//
// ベース ＝ app.js 私用 共通化チェックOK
//    メイン処理：render / save / 初期化
//
// 共通化：go(page),saveData()のローカル保存部分、newBookFavの初期値を2にする
// syncのみ：loadDataFromLocal,getSyncData,読み込み失敗時のtry/catch,
//※確認後に整理するやつ：rebuildBookMap、最後に開いていたシリーズ詳細画面を復元する処理
//
// 2026/10/19：起動時の表示ページを本一覧に統一
//
//

//🟦①====状態（let）====
//初期設定

let books = [];
let characters = [];
let tagMaster = [];

//デイリーログ・ハビット
let dailyLogs = {};

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

//保護機能のオンオフ切り替え
let enableProtect = localStorage.getItem("enableProtect");
 enableProtect =
  enableProtect === null
   ? true
   : enableProtect === "true";


//メモ機能のオンオフ切り替え
let enableMemo = localStorage.getItem("enableMemo");
 enableMemo =
  enableMemo === null
   ? true
   : enableMemo === "true";


//テーマカラーの設定
let themeColor = localStorage.getItem("themeColor") || "var(--color-main)";
 document.body.style.background = themeColor;

let sortKey = localStorage.getItem("sortKey") || "title"; //なにで並べるか
let sortOrder = localStorage.getItem("sortOrder") || "asc"; // asc / desc
let selectedType = "all"; // "all" | "normal" | "wish"※ウィッシュリスト切替
let currentMonth = new Date();

//====年間目標設定
let yearlyGoal = Number(localStorage.getItem("yearlyGoal")) || 100;

let enableGoal = localStorage.getItem("enableGoal");
enableGoal = enableGoal === null ? true : (enableGoal === "true");//年間読破目標設定

// 今日の日付表示
let enableDate =
  localStorage.getItem("enableDate");

enableDate =
  enableDate === null
    ? true
    : enableDate === "true";

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
    textImport: true,
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
let newBookFav = 2;

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
//設定P引用初期表示
let quoteViewMode =
  localStorage.getItem("quoteViewMode")
  || "horizontal";



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
// ローカルからデータを読み込む
//==============================

function loadDataFromLocal(){

  const saved =
    localStorage.getItem(
      "dokushoLogData"
    );

  if(!saved){
    return null;
  }

  return JSON.parse(saved);
}


//=============================
// 新：ロード 置き換え予定
//=============================
// ==============================
// データ読み込み・初期化
// ==============================
let themeLoaded = false;

function applyLoadedData(data){
  books = data.books || [];

  rebuildBookMap();

  characters = data.characters || [];

  // 旧データ救済
  characters.forEach(person => {
    person.personType ??= "character";
  });

  tagMaster = data.tagMaster || [];

  seriesMaster = (data.series || [])
    .concat(data.seriesMaster || []);

  dailyLogs = data.dailyLogs || {};
}

async function loadData(){

  if(!themeLoaded){
    loadTheme();
    themeLoaded = true;
  }

  // =========================
  // ① まずローカルデータを表示
  // =========================
  let localData = null;

  try{
    localData = loadDataFromLocal();
  }catch(e){
    console.error("ローカルデータ読み込み失敗", e);
  }

  if(localData){
    applyLoadedData(localData);
    console.log("◆ローカルから読み込み");
  }else{
    console.log("⚠️ ローカルデータがありません");
  }

  viewMode =
    localStorage.getItem("viewMode") || "card";

  renderTagFilter();
  go("home");

  // ローカル表示ができたので、読み込み画面を閉じる
  const loading = document.getElementById("loading");

  if(loading){
    loading.classList.add("hidden");
  }

  // =========================
  // ② Firestoreをバックグラウンドで取得
  // =========================

  // 読み込み開始時点で未同期の変更があれば、
  // 今回の取得結果ではローカルを更新しない
  const hadPendingChanges = hasPendingSyncChanges();

  try{
    const remoteData = await getSyncData(false);

    // 取得中に編集された場合も、上書きしない
    if(
      hadPendingChanges ||
      hasPendingSyncChanges()
    ){
      console.log(
        "⚠️ 未同期の変更があるため、Firestoreの取得結果は反映しません"
      );
      return;
    }

    // Firestoreの取得結果を反映
    applyLoadedData(remoteData);

    // 反映が安全と判断できた場合だけローカル保存
    localStorage.setItem(
      "dokushoLogData",
      JSON.stringify(remoteData)
    );

    console.log("Firestore読み込み完了");

    // 現在のページを再描画
    renderTagFilter();
    go(currentPage || "home");

  }catch(e){
    console.error("Firestore読み込み失敗", e);

    // ローカル表示は維持する
    console.log(
      "ローカルデータで表示を継続します"
    );
  }
}

// 初回ロード
window.addEventListener("load", () => {
  loadData();
});




