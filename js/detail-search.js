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

//本
let bookResults =
  books.filter(b=>{
    if(!keyword) return true;

    return (b.title || "")
      .toLowerCase()
      .includes(keyword);
  });

//シリーズ
let seriesResults =
  seriesMaster.filter(s=>{
    if(!keyword) return true;

    return (s.name || "")
      .toLowerCase()
      .includes(keyword);
  });

//人物
let characterResults =
  characters.filter(c=>{
    if(!keyword) return true;

    return (c.name || "")
      .toLowerCase()
      .includes(keyword);
  });
  
  //本・シリーズ・人物のチェック判定
  if(!detailSearch.targets.books){
  bookResults = [];
}

if(!detailSearch.targets.series){
  seriesResults = [];
}

if(!detailSearch.targets.characters){
  characterResults = [];
}
  


  safeRender({
    mountId:"page-detail-search",

    html:`
    
    <div class="detail-row">
      <h2 class="left-yose">🔍 詳細検索</h2>

     <input
  id="detail-search-keyword"
  class="input-common search-search right-yose"
  value="${detailSearch.keyword || ""}"

  oninput="
    detailSearch.keyword =
      this.value;

    saveDetailSearchState();
  "

  onkeydown="
    if(event.key === 'Enter'){
      runDetailSearch();
    }
  "
>

<button
  class="btn-main"
  onclick="runDetailSearch()"
>
  🔍 検索
</button>

</div>

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

          <!-- ここに今作った検索対象/タイプ/再読/データ整備を全部入れる -->
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
</div>
      `
      : ""
  }
</div>

${renderDetailSearchResults(
    bookResults,
    seriesResults,
    characterResults
  )}

    `
  });



}



//==============================
//検索結果エリア
//==============================
function renderDetailSearchResults(
  bookResults,
  seriesResults,
  characterResults
){
  return `
  
    
    <div class="detail-search-results">
${detailSearch.targets.books ? `
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
          bookResults.length
            ? bookResults.map(b=>`
              <div
                class="detail-result-item"
                onclick="openBookDetailModalById('${b.id}')"
              >
                ${b.title}
                ${
                  b.volume
                    ? ` ${b.volume}`
                    : ""
                }
              </div>
            `).join("")
            : "検索結果なし"
        }
      </div>
    `
    : ""
}
  </div>
` : ""}



${detailSearch.targets.series ? `
  <div class="detail-result-section">
  <div
    class="detail-result-title"
    onclick="
      detailSearchResults.series =
        !detailSearchResults.series;

      renderDetailSearch();
    "
  >
    ${
      detailSearchResults.series
        ? "▽"
        : "▶︎"
    }
    📖 シリーズ（${seriesResults.length}件）
  </div>

  ${
    detailSearchResults.series
      ? `
        <div class="detail-result-list">
          ${
            seriesResults.length
              ? seriesResults.map(s=>`
                <div
                  class="detail-result-item"
                  onclick="
                    openSeriesById('${s.id}')
                  "
                >
                  ${s.name}
                </div>
              `).join("")
              : `検索結果なし`
          }
        </div>
      `
      : ""
  }
  </div>
` : ""}


${detailSearch.targets.characters ? `
  <div class="detail-result-section">

  <div
    class="detail-result-title"
    onclick="
      detailSearchResults.characters =
        !detailSearchResults.characters;

      renderDetailSearch();
    "
  >
    ${
      detailSearchResults.characters
        ? "▽"
        : "▶︎"
    }
    👤 人物（${characterResults.length}件）
  </div>

  ${
    detailSearchResults.characters
      ? `
        <div class="detail-result-list">
          ${
            characterResults.length
              ? characterResults.map(c=>`
                <div
                  class="detail-result-item"
                  onclick="
                    openCharacterById('${c.id}')
                  "
                >
                  ${c.name}
                </div>
              `).join("")
              : "検索結果なし"
          }
        </div>
      `
      : ""
  }
  </div>
` : ""}
  `;
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


//==============================
//キーワード検索ボタン
//==============================
function runDetailSearch(){

  detailSearch.keyword =
    document.getElementById(
      "detail-search-keyword"
    ).value;

  saveDetailSearchState();

  renderDetailSearch();

}



