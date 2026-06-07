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

  types:{
    normal:true,
    wish:true
  },

  reread:false,

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
    
  if(!detailSearch.types){

  detailSearch.types = {
    normal:true,
    wish:true
  };

}

  safeRender({
    mountId:"page-detail-search",

    html:`

      <h2>🔍 詳細検索</h2>

      <input
  class="input-common"

  placeholder="キーワード検索"

  value="${detailSearch.keyword || ""}"

  oninput="
    detailSearch.keyword =
      this.value;

    saveDetailSearchState();
  "
>

      <div
        class="toggle-head"
      >
        ▶︎ 条件を絞り込む
      </div>

      <div class="detail-search-group">

  <div class="detail-search-group-title">
    検索対象
  </div>

  <label>
    <input
      type="checkbox"
      ${detailSearch.targets.books ? "checked" : ""}
      onchange="
        detailSearch.targets.books =
          this.checked;

        saveDetailSearchState();
      "
    >
    本
  </label>

  <label>
    <input
      type="checkbox"
      ${detailSearch.targets.series ? "checked" : ""}
      onchange="
        detailSearch.targets.series =
          this.checked;

        saveDetailSearchState();
      "
    >
    シリーズ
  </label>

  <label>
    <input
      type="checkbox"
      ${detailSearch.targets.characters ? "checked" : ""}
      onchange="
        detailSearch.targets.characters =
          this.checked;

        saveDetailSearchState();
      "
    >
    人物
  </label>

</div>



<div class="detail-search-group">

  <div class="detail-search-group-title">
    タイプ
  </div>

  <label>

    <input
      type="checkbox"
      ${detailSearch.types.normal ? "checked" : ""}
      onchange="
        detailSearch.types.normal =
          this.checked;

        saveDetailSearchState();
      "
    >

    本棚

  </label>

  <label>

    <input
      type="checkbox"
      ${detailSearch.types.wish ? "checked" : ""}
      onchange="
        detailSearch.types.wish =
          this.checked;

        saveDetailSearchState();
      "
    >

    ウィッシュ

  </label>

</div>


<div class="detail-search-group">

<div class="detail-search-group-title">
    再読
  </div>
<label>

  <input
    type="checkbox"
    ${detailSearch.reread ? "checked" : ""}
    onchange="
      detailSearch.reread =
        this.checked;

      saveDetailSearchState();
    "
  >

  再読予定

</label>
</div>

<div class="detail-search-group">

  <div class="detail-search-group-title">
    データ整備
  </div>

  <label>
    <input
      type="checkbox"
      ${detailSearch.noSeriesBook ? "checked" : ""}
      onchange="
        detailSearch.noSeriesBook =
          this.checked;

        saveDetailSearchState();
      "
    >
    シリーズ未設定の本
  </label>

  <label>
    <input
      type="checkbox"
      ${detailSearch.noSeriesCharacter ? "checked" : ""}
      onchange="
        detailSearch.noSeriesCharacter =
          this.checked;

        saveDetailSearchState();
      "
    >
    シリーズ未設定の人物
  </label>

  <label>
    <input
      type="checkbox"
      ${detailSearch.noTags ? "checked" : ""}
      onchange="
        detailSearch.noTags =
          this.checked;

        saveDetailSearchState();
      "
    >
    タグ未設定の本
  </label>

  <label>
    <input
      type="checkbox"
      ${detailSearch.noVolume ? "checked" : ""}
      onchange="
        detailSearch.noVolume =
          this.checked;

        saveDetailSearchState();
      "
    >
    巻数未設定の本
  </label>

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