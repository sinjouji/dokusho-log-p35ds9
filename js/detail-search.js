//
//
// PAGE-SEARCH.JS
// 詳細検索ページ用JS
//
//



//==============================
//初期設定
//==============================

//条件トグル用
let detailSearchUi = {

  conditionsOpen:false

};

//結果エリア用
let detailSearchResults = {

  books:true,

  series:true,

  characters:true

};


//検索条件
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

  setActiveMenu("menu-detail-search");
    
  if(!detailSearch.types){

  detailSearch.types = {
    normal:true,
    wish:true
  };
}

//キーワード検索の部分
const keyword =
  (detailSearch.keyword || "")
    .trim()
    .toLowerCase();

const bookResults =
  books.filter(b=>{

    if(!keyword) return true;

    return (b.title || "")
      .toLowerCase()
      .includes(keyword);

  });


  safeRender({
    mountId:"page-detail-search",

    html:`

      <h2>🔍 詳細検索</h2>

      <input
  class="input-common search-search"

  placeholder="キーワード検索"

  value="${detailSearch.keyword || ""}"

  oninput="
    detailSearch.keyword =
      this.value;
    
    renderDetailSearch();
    saveDetailSearchState();
  "
>

      <div class="detail-search-control-box">

  <div
    class="detail-search-condition-head"
    onclick="
      detailSearchUi.conditionsOpen =
        !detailSearchUi.conditionsOpen;
      renderDetailSearch();
    "
  >
    ${
      detailSearchUi.conditionsOpen
        ? "▽"
        : "▶︎"
    }
    条件を絞り込む
  </div>

  ${
    detailSearchUi.conditionsOpen
      ? `
        <div class="detail-search-condition-body">
      
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
      : ""
  }
</div></div>
        </div>



<div class="detail-search-results">

  <div class="detail-result-section">
    <div
  class="toggle-head detail-result-title"
  onclick="
    detailSearchResults.books =
      !detailSearchResults.books;

    renderDetailSearch();
  "
>

  ${
    detailSearchResults.books
      ? "▽"
      : "▶︎"
  }

  📚 本（${bookResults.length}件）

</div>

${
  detailSearchResults.books
    ? `
      <div class="detail-result-list">

  ${
    bookResults.map(b=>`

      <div
        class="card mini-s-card"
        onclick="
          openBookDetailModalById(
            '${b.id}'
          )
        "
      >

        ${b.title}

      </div>

    `).join("")
  }

</div>
    `
    : ""
}
  </div>

  <div class="detail-result-section">
    <div class="detail-result-title">
      📖 シリーズ（0件）
    </div>
  </div>

  <div class="detail-result-section">
    <div class="detail-result-title">
      👤 人物（0件）
    </div>
  </div>

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