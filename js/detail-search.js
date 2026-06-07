//
//
// PAGE-SEARCH.JS
// 詳細検索ページ用JS
//
//


//==============================
//初期設定
//==============================
let detailSearch = {

  keyword:"",

  targets:{
    books:true,
    series:true,
    characters:true
  },

  tagStates:{},

  type:"all",

  reread:"all",

  noSeriesBook:false,

  noSeriesCharacter:false,

  noTags:false,

  noVolume:false
};


//==============================
//状態保存
//==============================
const saved =
  localStorage.getItem(
    "detailSearchState"
  );

if(saved){

  detailSearch =
    JSON.parse(saved);

}




//==============================
//描画
//==============================
function renderDetailSearch(){

  safeRender({
    mountId:"page-detail-search",

    html:`

      <h2>🔍 詳細検索</h2>

      <input
        class="input-common"
        placeholder="キーワード検索"
      >

      <div
        class="toggle-head"
      >
        ▶︎ 条件を絞り込む
      </div>

      <div>
        <input
  type="checkbox"
  checked
  onchange="
    detailSearch.targets.books =
      this.checked;
      
    saveDetailSearchState();
  "
>
本
      </div>

    `
  });

}




//==============================
//保存
//==============================
function saveDetailSearchState(){

  localStorage.setItem(
    "detailSearchState",
    JSON.stringify(detailSearch)
  );

}