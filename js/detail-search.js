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

  noVolume:false,
  
  fav:"all",
  
  sort:"date"

};
//検索条件保存枠
let savedDetailSearches =
  JSON.parse(
    localStorage.getItem("savedDetailSearches")
    || "null"
  )
  || [
    { name:"保存条件1", state:null },
    { name:"保存条件2", state:null }
  ];

//保存条件の概要トグル
let savedSearchSummaryOpen = {};


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
//検索条件の保存
//==============================
function saveSavedDetailSearches(){

  localStorage.setItem(
    "savedDetailSearches",
    JSON.stringify(savedDetailSearches)
  );
}

//==============================
//保存済みの検索条件の呼び出し
//==============================
function loadSavedDetailSearch(index){

  const saved =
    savedDetailSearches[index];

  if(!saved || !saved.state) return;

  detailSearch =
    JSON.parse(
      JSON.stringify(saved.state)
    );

  saveDetailSearchState();
  renderDetailSearch();
}



//==============================
//保存済みの検索条件の上書き保存
//==============================
function overwriteSavedDetailSearch(index){

  savedDetailSearches[index].state =
    JSON.parse(
      JSON.stringify(detailSearch)
    );

  saveSavedDetailSearches();

  renderDetailSearch();
}


//==============================
//保存条件の表示カード
//==============================
function renderSavedDetailSearchCards(){

  return `
    <div class="saved-search-area detail-row">
      ${savedDetailSearches.map((saved,index)=>`
        <div class="saved-search-card">
        
        <div class="saved-search-card-head">
          <button
            class="btn-sub"
            onclick="loadSavedDetailSearch(${index})"
          >
            📌 ${saved.name}
          </button>
          

          <button
  class="btn-sub"
  onclick="renameSavedDetailSearch(${index})"
>
  ✏️
</button>

<button
  class="btn-sub"
  onclick="
    savedSearchSummaryOpen[${index}] =
      !savedSearchSummaryOpen[${index}];

    renderDetailSearch();
  "
>
  ${
    savedSearchSummaryOpen[index]
      ? "閉じる"
      : "表示"
  }
</button>
</div>


${
  savedSearchSummaryOpen[index]
    ? `
      <div class="saved-search-summary">
        ${getDetailSearchSummary(saved.state)}
      </div>
    `
    : ""
}
        </div>
      `).join("")}
    </div>
  `;
}

//==============================
//保存条件の名前変更
//==============================
function renameSavedDetailSearch(index){

  const name =
    prompt(
      "保存条件の名前",
      savedDetailSearches[index].name
    );

  if(!name) return;

  savedDetailSearches[index].name =
    name.trim();

  saveSavedDetailSearches();

  renderDetailSearch();
}

//==============================
//保存条件の概要トグル
//==============================
function getDetailSearchSummary(state){

  if(!state) return "未保存";

  const list = [];

  if(state.keyword){
    list.push(`キーワード：${state.keyword}`);
  }

  if(state.targets){
    const targets = [];
    if(state.targets.books) targets.push("本");
    if(state.targets.series) targets.push("シリーズ");
    if(state.targets.characters) targets.push("人物");
    list.push(`対象：${targets.join(" / ")}`);
  }

  if(state.types){
    if(!state.types.normal) list.push("ウィッシュのみ");
    if(!state.types.wish) list.push("本棚のみ");
  }

  if(state.reread) list.push("再読予定");

  if(state.noSeriesBook) list.push("シリーズ未設定本");
  if(state.noSeriesCharacter) list.push("シリーズ未設定人物");
  if(state.noTags) list.push("タグ未設定本");
  if(state.noVolume) list.push("巻数未設定本");

  const tagTexts =
    Object.keys(state.tagStates || {}).map(tagId=>{

      const tag =
        tagMaster.find(t =>
          String(t.id) === String(tagId)
        );

      return `${tag?.name || "？"}(${state.tagStates[tagId]})`;
    });

  if(tagTexts.length){
    list.push(`タグ：${tagTexts.join(" / ")}`);
  }

  return list.length
    ? list.join("、")
    : "条件なし";
}




//==============================
//★描画
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
  

    // タイプ

    if(
      !detailSearch.types.normal &&
      b.type !== "wish"
    ){
      return false;
    }

    if(
      !detailSearch.types.wish &&
      b.type === "wish"
    ){
      return false;
    }

    // 再読予定

    if(
      detailSearch.reread &&
      !b.reread
    ){
      return false;
    }
    
    //シリーズ未設定
    if(
  detailSearch.noSeriesBook &&
  (b.seriesIds || []).length > 0
){
  return false;
}

//タグ未設定
if(
  detailSearch.noTags &&
  (b.tagIds || []).length > 0
){
  return false;
}

//巻数未設定
if(
  detailSearch.noVolume &&
  b.volume
){
  return false;
}

//表示タグ
if(!matchDetailSearchTags(b)){
  return false;
}

if(
  detailSearch.fav !== "all" &&
  Number(b.fav || 0) !== Number(detailSearch.fav)
){
  return false;
}

    // キーワード

    if(!keyword) return true;

    return (b.title || "")
      .toLowerCase()
      .includes(keyword);

  });
  
  
  //ソート
  if(detailSearch.sort === "title"){

  bookResults.sort(
    (a,b)=>

      (a.title || "")
        .localeCompare(
          b.title || "",
          "ja"
        )
  );
}



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
  
  if(
  detailSearch.noSeriesCharacter &&
  (c.seriesIds || []).length > 0
){
  return false;
}
  
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
  class="input-common input-small search-search right-yose"
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


<div class="detail-search-sort-row flex-between">
 <button
  class="btn-sub"
  onclick="resetDetailSearch()"
>
  🧹 条件リセット
</button>

<span class="right-yose">
  並び順：
  <select
    onchange="
      detailSearch.sort = this.value;
      saveDetailSearchState();
      renderDetailSearch();
    "
  >

    <option
      value="date"
      ${
        detailSearch.sort === "date"
          ? "selected"
          : ""
      }
    >
      読了日順
    </option>

    <option
      value="title"
      ${
        detailSearch.sort === "title"
          ? "selected"
          : ""
      }
    >
      タイトル順
    </option>

  </select>
  </span>
  
</div>


${renderSavedDetailSearchCards()}


  ${renderDetailSearchConditions()}


${renderDetailSearchResults(
    bookResults,
    seriesResults,
    characterResults
  )}

    `
  });

}


//==============================
//詳細条件
//==============================
function renderDetailSearchConditions(){

  return `
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
        <div
  id="detail-search-condition-body"
  class="detail-search-condition-body"
>

<!-- ここに今作った検索対象/タイプ/再読/データ整備を全部入れる -->

<div class="detail-search-group">
  <div class="detail-search-group-title">
    条件保存
  </div>

  <button
    class="btn-sub"
    onclick="overwriteSavedDetailSearch(0)"
  >
    条件1に上書き保存
  </button>

  <button
    class="btn-sub"
    onclick="overwriteSavedDetailSearch(1)"
  >
    条件2に上書き保存
  </button>
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
    📘 本
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
    📖 シリーズ
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
    👤 人物
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

    📚 本棚

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

    ❤️ ウィッシュ

  </label>

</div>

<div class="flex-between">
<div class="detail-search-group">

  <div class="detail-search-group-title">
    評価
  </div>

  <select
    class="input-common input-small"
    onchange="
      detailSearch.fav =
        this.value;

      saveDetailSearchState();

      renderDetailSearch();
    "
  >
    <option value="all" ${detailSearch.fav === "all" ? "selected" : ""}>
      全部
    </option>

    <option value="0" ${detailSearch.fav === "0" ? "selected" : ""}>
      0
    </option>

    <option value="1" ${detailSearch.fav === "1" ? "selected" : ""}>
      ★
    </option>

    <option value="2" ${detailSearch.fav === "2" ? "selected" : ""}>
      ★★
    </option>

    <option value="3" ${detailSearch.fav === "3" ? "selected" : ""}>
      ★★★
    </option>

    <option value="4" ${detailSearch.fav === "4" ? "selected" : ""}>
      👑
    </option>
  </select>

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

  🔖 再読予定

</label>
</div>
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
    📖シリーズ未設定の📘<b>本</b>
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
    📖シリーズ未設定の👤<b>人物</b>
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
    🏷️タグ未設定の📘<b>本</b>
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
    #️⃣巻数未設定📘<b>本</b>
  </label>
  </div>
  
  
  <div class="detail-search-group">

  <div class="detail-search-group-title">
    タグ
  </div>

  <div class="tag-filter-area">

    ${
  tagMaster
    .filter(tag => !tag.isHidden)
    .map(tag=>{

      const mode =
        detailSearch.tagStates[
          String(tag.id)
        ];

      return `

        <button

          class="
            tag-chip
            ${
              mode
                ? `tag-mode-${mode.toLowerCase()}`
                : ""
            }
          "

          onclick="
            cycleDetailSearchTagState(
              '${tag.id}'
            )
          "
        >

          ${tag.name}

          ${
            mode
              ? ` (${mode})`
              : ""
          }

        </button>

      `;

    }).join("")
}

  </div>

</div>


${renderManagementTagSection()}

  
</div>

      `
      : ""
  }
</div>
  `;
}



//==============================
//検索結果エリア描画枠
//==============================
function renderDetailSearchResults(
  bookResults,
  seriesResults,
  characterResults
){

  return `
  
     <div class="detail-search-results">

    ${renderBookSearchResults(
      bookResults
    )}

    ${renderSeriesSearchResults(
      seriesResults
    )}


    ${renderCharacterSearchResults(
      characterResults
    )}

  `;
}
    


//==============================
//結果表示エリア：📘本
//==============================
function renderBookSearchResults(
  bookResults
){

  return `

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

  `;
}



//==============================
//結果表示エリア：📖シリーズ
//==============================
function renderSeriesSearchResults(
  seriesResults
){

  return `

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


  `;
}


//==============================
//結果表示エリア：👤人物
//==============================
function renderCharacterSearchResults(
  characterResults
){

  return `

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





//==============================
// 詳細検索：タグ
//==============================
//==============================
//表示タグ絞込み
//==============================
function cycleDetailSearchTagState(tagId){

  const body =
    document.getElementById(
      "detail-search-condition-body"
    );

  const scrollTop =
    body ? body.scrollTop : 0;

  const strId = String(tagId);

  const current =
    detailSearch.tagStates[strId];

  if(!current){
    detailSearch.tagStates[strId] = "AND";

  }else if(current === "AND"){
    detailSearch.tagStates[strId] = "OR";

  }else if(current === "OR"){
    detailSearch.tagStates[strId] = "NOT";

  }else{
    delete detailSearch.tagStates[strId];
  }

  saveDetailSearchState();

  renderDetailSearch();

  setTimeout(()=>{

    const newBody =
      document.getElementById(
        "detail-search-condition-body"
      );

    if(newBody){
      newBody.scrollTop = scrollTop;
    }

  }, 0);
}


//==============================
//表示タグ絞込みのタグ判定
//==============================
function matchDetailSearchTags(book){

  const itemTags =
    (book.tagIds || []).map(String);

  const states =
    detailSearch.tagStates || {};
    
  const andTags =
    Object.keys(states).filter(
      id => states[id] === "AND"
    );
    
  if(
    !andTags.every(id =>
      itemTags.includes(id)
    )
  ){
    return false;
  }

  const orTags =
    Object.keys(states).filter(
      id => states[id] === "OR"
    );

  if(
    orTags.length &&
    !orTags.some(id =>
      itemTags.includes(id)
    )
  ){
    return false;
  }

  const notTags =
    Object.keys(states).filter(
      id => states[id] === "NOT"
    );

  if(
    notTags.some(id =>
      itemTags.includes(id)
    )
  ){
    return false;
  }

  return true;
}


//==============================
//管理タグエリア表示内容
//==============================
function renderManagementTagSection(){

  return `

    <div class="detail-search-group">

      <div
        class="detail-search-group-title"
      >
        管理タグ
      </div>

      <div class="tag-filter-area">

        ${
          tagMaster

            .filter(
              tag => tag.isHidden
            )

            .map(tag=>{

              const mode =
                detailSearch.tagStates[
                  String(tag.id)
                ];

              return `

                <button

                  class="
                    tag-chip
                    ${
                      mode
                        ? `tag-mode-${mode.toLowerCase()}`
                        : ""
                    }
                  "

                  onclick="
                    cycleDetailSearchTagState(
                      '${tag.id}'
                    )
                  "
                >

                  ${tag.name}

                  ${
                    mode
                      ? ` (${mode})`
                      : ""
                  }

                </button>

              `;

            }).join("")
        }

      </div>

    </div>

  `;
}


//==============================
//検索条件リセットボタン
//==============================
function resetDetailSearch(){

  detailSearch = {

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

  saveDetailSearchState();

  renderDetailSearch();
}

