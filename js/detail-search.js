// 私用
//
// PAGE-SEARC.JS
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
  keywordOr:"",
  keywordNot:"",

  targets:{
    books:true,
    series:true,
    characters:true,
    hasQuotes:false,
    hasFavoriteQuotes:false
  },

  tagStates:{},

  types:{
    normal:true,
    wish:true
  },

  personTypes:[],

  reread:false,

  protect:"all",          // ←追加

  noSeriesBook:false,

  noSeriesCharacter:false,

  noBookSeries:false,     // ←追加（本未登録シリーズ）

  noTags:false,

  noHiddenTags:false,     // ←追加（管理タグ未設定）

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

//タグ一括追加用
let selectedBooks = [];


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

  // ===== 古い保存データを補完 =====
  detailSearch.targets ??= {
    books:true,
    series:true,
    characters:true,
    hasQuotes:false,
    hasFavoriteQuotes:false
  };

  detailSearch.types ??= {
    normal:true,
    wish:true
  };

  detailSearch.personTypes ??= [];

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

  // ★追加（古い保存データの補完）
  detailSearch.targets ??= {
    books:true,
    series:true,
    characters:true,
    hasQuotes:false,
    hasFavoriteQuotes:false
  };

  detailSearch.types ??= {
    normal:true,
    wish:true
  };

  detailSearch.personTypes ??= [];

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
  
  if(state.personTypes?.length){

  const personTypeNames = {
    author:"著者",
    illustrator:"イラスト",
    original:"原作者",
    character:"登場人物"
  };

  list.push(
    `人物タイプ：${
      state.personTypes
        .map(p=>personTypeNames[p] || p)
        .join(" / ")
    }`
  );

}
if(state.fav && state.fav !== "all"){

  const favNames = {
    "0":"評価なし",
    "1":"★",
    "2":"★★",
    "3":"★★★",
    "4":"👑"
  };

  list.push(
    `評価：${favNames[state.fav] || state.fav}`
  );

}

  if(state.reread) list.push("再読予定");

  if(state.hasQuotes) list.push("引用あり");
  if(state.hasFavoriteQuotes) list.push("お気に入り引用あり")
  if(state.noSeriesBook) list.push("シリーズ未設定本");
  if(state.noSeriesCharacter) list.push("シリーズ未設定人物");
  if(state.noTags) list.push("タグ未設定本");
  if(state.noVolume) list.push("巻数未設定本");
  
  if(state.noBookSeries){
  list.push("本未登録シリーズ");
}
if(state.noHiddenTags){
  list.push("管理タグ未設定本");
}

if(state.protect==="on"){
    list.push("🔒 保護あり");
}

if(state.protect==="off"){
    list.push("🔓 保護なし");
}


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
// 詳細検索：初期値補完
//==============================
function ensureDetailSearchDefaults(){

  if(!detailSearch.types){

    detailSearch.types = {
      normal:true,
      wish:true
    };

  }

  if(!detailSearch.personTypes){
    detailSearch.personTypes = [];
  }

  if(!detailSearch.fav){
    detailSearch.fav = "all";
  }
  
  //再読の初期設定
  if(!detailSearch.rereadMode){
    detailSearch.rereadMode = "all";
  }

}


//==============================
// 詳細検索：検索結果生成
//==============================
function getDetailSearchResults(){

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
  detailSearch.rereadMode === "reread" &&
  !b.reread
){
  return false;
}

if(
  detailSearch.rereadMode === "non-reread" &&
  b.reread
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
//引用メモ
if(
  detailSearch.hasQuotes &&
  (!b.quotes || b.quotes.length === 0)
){
  return false;
}
if(
  detailSearch.hasFavoriteQuotes
){

  const hasFavorite =
    (b.quotes || []).some(
      q => q.favorite
    );

  if(!hasFavorite){
    return false;
  }

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
const quoteText =
  (b.quotes || [])
    .map(q =>
      [
        q.text,
        q.memo
      ]
        .filter(Boolean)
        .join(" ")
    )
    .join(" ");
    //キーワード：シリーズ名
    const seriesText =
  (b.seriesIds || [])
    .map(id =>
      seriesMaster.find(
        s =>
          String(s.id) === String(id)
      )?.name || ""
    )
    .join(" ");

const bookText =
  [
    b.title,
    b.subtitle,
    quoteText,
    seriesText
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

return matchKeywordGroups(bookText);
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

if(detailSearch.sort === "date"){

  bookResults.sort((a,b)=>{

    const aDate =
      a.readDates?.length
        ? a.readDates[a.readDates.length - 1]
        : "";

    const bDate =
      b.readDates?.length
        ? b.readDates[b.readDates.length - 1]
        : "";

    // 両方読了日あり
    if(aDate && bDate){
      return bDate.localeCompare(aDate);
    }

    // aだけ読了日なし → 下へ
    if(!aDate && bDate){
      return 1;
    }

    // bだけ読了日なし → 下へ
    if(aDate && !bDate){
      return -1;
    }

    // 両方未読 → 登録順（新しい順）
    return Number(b.id) - Number(a.id);
  });
}

if(detailSearch.sort === "register"){

  bookResults.sort(
    (a,b)=>
      Number(b.id) - Number(a.id)
  );

}


//シリーズ
let seriesResults =
  seriesMaster.filter(s=>{

    const seriesText =
      (s.name || "")
        .toLowerCase();

    return matchKeywordGroups(seriesText);

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

    // 人物タイプ
    const personTypes =
  detailSearch.personTypes || [];

if(
  personTypes.length > 0 &&
  !personTypes.includes(c.personType)
){
  return false;
}

    const seriesText =
  (c.seriesIds || [])
    .map(id =>
      seriesMaster.find(
        s => String(s.id) === String(id)
      )?.name || ""
    )
    .join(" ");

const characterText = [
  c.name || "",
  getPersonTypeLabel(c.personType) || "",
  seriesText
]
.join(" ")
.toLowerCase();

    return matchKeywordGroups(characterText);

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


//保護状態
if(detailSearch.protect === "on"){
  bookResults = bookResults.filter(
    b => b.protect === true
  );
  seriesResults = seriesResults.filter(
    s => s.protect === true
  );
  characterResults = characterResults.filter(
    c => c.protect === true
  );
}

if(detailSearch.protect === "off"){
  bookResults = bookResults.filter(
    b => !b.protect
  );
  seriesResults = seriesResults.filter(
    s => !s.protect
  );
  characterResults = characterResults.filter(
    c => !c.protect
  );
}

//本未登録のシリーズ
if(detailSearch.noBookSeries){

  seriesResults =
    seriesResults.filter(series => {

      const ids =
        [...new Set(series.bookIds || [])];

      return ids.length === 0;

    });

}

//管理タグ未登録の本
if(detailSearch.noHiddenTags){

  bookResults =
    bookResults.filter(book => {

      const hasHiddenTag =
        (book.tagIds || [])
          .some(tagId => {

            const tag =
              tagMaster.find(t =>
                String(t.id) === String(tagId)
              );

            return tag?.isHidden;

          });

      return !hasHiddenTag;

    });

}

return {
  bookResults,
  seriesResults,
  characterResults
};

}



//==============================
//★描画
//==============================
function renderDetailSearch(){

  setActiveMenu("menu-detail-search");

  const conditionBody =
    document.getElementById(
      "detail-search-condition-body"
    );

  const scrollTop =
    conditionBody
      ? conditionBody.scrollTop
      : 0;

  ensureDetailSearchDefaults();


//検索条件の処理部分
const {
  bookResults,
  seriesResults,
  characterResults
} = getDetailSearchResults();


//HTML描画部分
  safeRender({
    mountId:"page-detail-search",

    html:`
    
    <div class="flex-between">
      <h2>🔍 詳細検索</h2>


<div class="detail-search-sort-row">
<span class="right-yose select-chip-wrap">
  並び順：
  <select class="select-chip"
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
      読了日順（新〜）
    </option>

    <option
      value="title"
      ${
        detailSearch.sort === "title"
          ? "selected"
          : ""
      }
    >
      タイトル順（あ〜）
    </option>

<option
      value="register"
      ${
        detailSearch.sort === "register"
          ? "selected"
          : ""
      }
    >
      登録順（新〜）
    </option>

  </select>
  </span>
  
</div>
 
</div>



     <input
  id="detail-search-keyword"
  class="input-common yohaku10 and-bar"
  value="${detailSearch.keyword || ""}"
  
  placeholder="AND検索：全てを含む（, またはスペース区切り）"

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

<input
  class="input-common yohaku10 or-bar"
  placeholder="OR検索：どれか含む（, またはスペース区切り）"
  value="${detailSearch.keywordOr || ""}"
  oninput="
    detailSearch.keywordOr = this.value;
    saveDetailSearchState();
  "
  onkeydown="
    if(event.key === 'Enter'){
      runDetailSearch();
    }
  "
>

<input
  class="input-common yohaku10 not-bar"
  placeholder="NOT検索：含めない（, またはスペース区切り）"
  value="${detailSearch.keywordNot || ""}"
  oninput="
    detailSearch.keywordNot = this.value;
    saveDetailSearchState();
  "
  onkeydown="
    if(event.key === 'Enter'){
      runDetailSearch();
    }
  "
>

<div class="flex-between yohaku15">
<button
  class="btn-sub"
  onclick="resetDetailSearch()"
>
  🧹 条件リセット
</button>

<button
  class="btn-main ken-btn"
  onclick="runDetailSearch()"
>
  🔍 検索
</button>
</div>

<hr class="kugiri">

${renderSavedDetailSearchCards()}


  ${renderDetailSearchConditions()}


${renderDetailSearchResults(
    bookResults,
    seriesResults,
    characterResults
  )}

${renderBulkTagArea()}

${renderBulkProtectArea()}

${renderBulkRereadArea()}
    `
  });

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


<div class="flex-between">
<div class="detail-search-group search-min-rows">

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
        renderDetailSearch();
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
        renderDetailSearch();
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
        renderDetailSearch();
      "
    >
    👤 人物
  </label>
  </div>

<div class="detail-search-group search-min-rows">
  <div class="detail-search-group-title">
    保護状態
  </div>

  <label>
    <input
      type="radio"
      name="protect-filter"
      value="all"
      ${detailSearch.protect === "all" ? "checked" : ""}
      onchange="
        detailSearch.protect = 'all';
        renderDetailSearch();
      "
    >
    すべて
  </label>

  <label>
    <input
      type="radio"
      name="protect-filter"
      value="on"
      ${detailSearch.protect === "on" ? "checked" : ""}
      onchange="
        detailSearch.protect = 'on';
        renderDetailSearch();
      "
    >
    🔒保護あり
  </label>

  <label>
    <input
      type="radio"
      name="protect-filter"
      value="off"
      ${detailSearch.protect === "off" ? "checked" : ""}
      onchange="
        detailSearch.protect = 'off';
        renderDetailSearch();
      "
    >
    🔓保護なし
  </label>
</div>
</div>


<div class="flex-between">

<div class="detail-search-group search-min-rows">

  <div class="detail-search-group-title">
    本タイプ
  </div>

  <label>

    <input
      type="checkbox"
      ${detailSearch.types.normal ? "checked" : ""}
      onchange="
        detailSearch.types.normal =
          this.checked;

        saveDetailSearchState();
        renderDetailSearch();
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
        renderDetailSearch();
      "
    >

    ❤️ ウィッシュ

  </label>

</div>

<div class="detail-search-group search-min-rows">
<div class="detail-search-group-title">
    人物タイプ
  </div>
  <label>

    <input
      type="checkbox"
      ${detailSearch.personTypes.includes("author") ? "checked" : ""}
      onchange="
  if(this.checked){

    if(
      !detailSearch.personTypes.includes('author')
    ){
      detailSearch.personTypes.push('author');
    }

  }else{

    detailSearch.personTypes =
      detailSearch.personTypes.filter(
        p => p !== 'author'
      );

  }

  saveDetailSearchState();
  renderDetailSearch();
"
    >

    📖 著者

  </label>
  
  <label>

    <input
      type="checkbox"
      ${detailSearch.personTypes.includes("illustrator") ? "checked" : ""}
      onchange="
  if(this.checked){

    if(
      !detailSearch.personTypes.includes('illustrator')
    ){
      detailSearch.personTypes.push('illustrator');
    }

  }else{

    detailSearch.personTypes =
      detailSearch.personTypes.filter(
        p => p !== 'illustrator'
      );

  }

  saveDetailSearchState();
  renderDetailSearch();
"
    >

    🖼️ イラスト

  </label>
  
  <label>

    <input
      type="checkbox"
      ${detailSearch.personTypes.includes("original") ? "checked" : ""}
      onchange="
  if(this.checked){

    if(
      !detailSearch.personTypes.includes('original')
    ){
      detailSearch.personTypes.push('original');
    }

  }else{

    detailSearch.personTypes =
      detailSearch.personTypes.filter(
        p => p !== 'original'
      );

  }

  saveDetailSearchState();
  renderDetailSearch();
"
    >

    ✒️ 原作者

  </label>
  
  <label>

    <input
      type="checkbox"
      ${detailSearch.personTypes.includes("character") ? "checked" : ""}
      onchange="
  if(this.checked){

    if(
      !detailSearch.personTypes.includes('character')
    ){
      detailSearch.personTypes.push('character');
    }

  }else{

    detailSearch.personTypes =
      detailSearch.personTypes.filter(
        p => p !== 'character'
      );

  }

  saveDetailSearchState();
  renderDetailSearch();
"
    >

    👤 登場人物

  </label>
  
</div>

</div>


<div class="flex-between">
<div class="detail-search-group search-min-rows">

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


<div class="detail-search-group search-min-rows">

  <div class="detail-search-group-title">
    再読
  </div>
<label>

  <input
    type="radio"
    name="detail-search-reread"
    value="all"
    ${detailSearch.rereadMode === "all"
        ? "checked"
        : ""
     }
    onchange="
      detailSearch.rereadMode =
        this.value;

      saveDetailSearchState();
      renderDetailSearch();
    "
  >
  全て
  </label>


<input
    type="radio"
    name="detail-search-reread"
    value="reread"
    ${detailSearch.rereadMode === "reread"
        ? "checked"
        : ""
     }
    onchange="
      detailSearch.rereadMode =
        this.value;

      saveDetailSearchState();
      renderDetailSearch();
    "
  >
  🔖 再読予定

</label>

<input
    type="radio"
    name="detail-search-reread"
    value="non-reread"
    ${detailSearch.rereadMode === "non-reread"
        ? "checked"
        : ""
     }
    onchange="
      detailSearch.rereadMode =
        this.value;

      saveDetailSearchState();
      renderDetailSearch();
    "
  >

  再読なし

</label>
</div>
</div>

<div class="detail-search-group">



  <div class="detail-search-group-title">
    データ整備
  </div>
  
  <label class="check-row">
  <input
    type="checkbox"
    ${
      detailSearch.hasQuotes
        ? "checked"
        : ""
    }
    onchange="
  detailSearch.hasQuotes =
    this.checked;

  saveDetailSearchState();
  renderDetailSearch();
"
  >
  引用あり
</label>

<label class="check-row">
  <input
    type="checkbox"
    ${
      detailSearch.hasFavoriteQuotes
        ? "checked"
        : ""
    }
    onchange="
  detailSearch.hasFavoriteQuotes =
    this.checked;

  saveDetailSearchState();
  renderDetailSearch();
"
  >
  ⭐お気に入り引用あり
</label>
  
  <label>
    <input
      type="checkbox"
      ${detailSearch.noSeriesBook ? "checked" : ""}
      onchange="
        detailSearch.noSeriesBook =
          this.checked;

        saveDetailSearchState();
        renderDetailSearch();
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
        renderDetailSearch();
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
        renderDetailSearch();
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
        renderDetailSearch();
      "
    >
    #️⃣巻数未設定📘<b>本</b>
  </label>

  <label>
    <input
      type="checkbox"
      ${detailSearch.noBookSeries ? "checked" : ""}
      onchange="
        detailSearch.noBookSeries =
          this.checked;

        saveDetailSearchState();
        renderDetailSearch();
      "
    >
    📘本未登録📚<b>シリーズ</b>
  </label>
  
<label>
    <input
      type="checkbox"
      ${detailSearch.noHiddenTags ? "checked" : ""}
      onchange="
        detailSearch.noHiddenTags =
          this.checked;

        saveDetailSearchState();
        renderDetailSearch();
      "
    >
    🏷️管理タグ未設定📘<b>本</b>
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

          class="main-tag-text
            tag-chip
            ${
              mode
                ? `tag-mode-${mode.toLowerCase()}`
                : ""
            }
          "
          
          style="background:${tag.color}"

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
  class="detail-result-item flex-between"
  onclick="openBookDetailModalById('${b.id}')"
>

  <div class="detail-result-book-info">

    ${
      b.protect
        ? `<span class="mini-info">🔒</span>`
        : ""
    }

    ${b.title}

    ${
      b.subtitle
        ? ` <span class="book-subtitle">${b.subtitle}</span>`
        : ""
    }

    ${
      b.volume
        ? ` ${b.volume}`
        : ""
    }

    ${
      b.reread
        ? `<span class="mini-info">🔁</span>`
        : ""
    }

    ${
      (b.quotes || []).length
        ? `<span class="mini-info">(引用：${b.quotes.length} 件)</span>`
        : ""
    }

    ${
      (b.quotes || []).some(q => q.favorite)
        ? `<span class="mini-info">⭐</span>`
        : ""
    }

  </div>

  <label
    class="book-select-row"
    onclick="event.stopPropagation()"
  >
    <input
      type="checkbox"
      onclick="event.stopPropagation()"
      ${
        selectedBooks.includes(String(b.id))
          ? "checked"
          : ""
      }
      onchange="
        toggleBookSelect(
          '${b.id}'
        );
      "
    >
  </label>


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
    
    personTypes:[],

    reread:false,

    noSeriesBook:false,

    noSeriesCharacter:false,

    noTags:false,

    noVolume:false
  };

  saveDetailSearchState();

  renderDetailSearch();
}


//==============================
//キーワード複数検索用のつなぎ部分
//==============================
function splitSearchWords(text){

  return (text || "")
    .trim()
    .toLowerCase()
    .split(/[,\s]+/)
    .filter(Boolean);
}


//==============================
//キーワード検索（AND、OR、NOT）
//==============================
function matchKeywordGroups(searchText){

  const text =
    (searchText || "").toLowerCase();

  const andWords =
    splitSearchWords(detailSearch.keyword);

  const orWords =
    splitSearchWords(detailSearch.keywordOr);

  const notWords =
    splitSearchWords(detailSearch.keywordNot);

  // 全部空なら通す
  if(
    !andWords.length &&
    !orWords.length &&
    !notWords.length
  ){
    return true;
  }

  if(
    andWords.length &&
    !andWords.every(word =>
      text.includes(word)
    )
  ){
    return false;
  }

  if(
    orWords.length &&
    !orWords.some(word =>
      text.includes(word)
    )
  ){
    return false;
  }

  if(
    notWords.some(word =>
      text.includes(word)
    )
  ){
    return false;
  }

  return true;
}



//==============================
// タグ一括追加用：選択
//==============================
function toggleBookSelect(bookId){

  const id = String(bookId);

  if(
    selectedBooks.includes(id)
  ){
    selectedBooks =
      selectedBooks.filter(
        x => x !== id
      );
  }else{
    selectedBooks.push(id);
  }

}



//==============================
// タグ一括追加処理
//==============================
function addBulkTag(){

  const tagName =
    document
      .getElementById(
        "bulk-tag-name"
      )
      ?.value
      ?.trim();

  if(!tagName){
    alert("タグ名を入力してください");
    return;
  }

  if(
    selectedBooks.length === 0
  ){
    alert(
      "本を選択してください"
    );
    return;
  }

  const tagType =
    document.querySelector(
      'input[name="bulk-tag-type"]:checked'
    )?.value;

  const tag =
  findOrCreateBulkTag(
    tagName,
    tagType === "hidden"
  );

if(!tag) return;

  books.forEach(book=>{

    if(
      !selectedBooks.includes(
        String(book.id)
      )
    ){
      return;
    }

    book.tagIds =
      book.tagIds || [];

    if(
      !book.tagIds.includes(
        tag.id
      )
    ){
      book.tagIds.push(
        tag.id
      );
    }

  });

  saveData();

showToast(
  `${selectedBooks.length}冊に追加しました`
);

renderDetailSearch();

}


//==============================
// タグ一括追加用：タグ検索or追加
//==============================
function findOrCreateBulkTag(name, isHidden){

  let tag =
    tagMaster.find(t =>
      t.name === name &&
      !!t.isHidden === !!isHidden
    );

  if(tag) return tag;

  const ok =
    confirm(
      `「${name}」を新規${
        isHidden ? "管理タグ" : "表示タグ"
      }として作成しますか？`
    );

  if(!ok) return null;

  tag = {
    id:"t" + Date.now().toString(),
    name,
    color:"#d8c7b8",
    isHidden
  };

  tagMaster.push(tag);

  return tag;
}



//==============================
// タグ一括追加用：タグ検索サジェスト
//==============================
function renderBulkTagSuggest(){

  const input =
    document.getElementById("bulk-tag-name");

  const box =
    document.getElementById("bulk-tag-suggest");

  if(!input || !box) return;

  const keyword =
    input.value.trim().toLowerCase();

  if(!keyword){
    box.innerHTML = "";
    box.style.display = "none";
    return;
  }

  const tagType =
    document.querySelector(
      'input[name="bulk-tag-type"]:checked'
    )?.value;

  const isHidden =
    tagType === "hidden";

  const hits =
    tagMaster
      .filter(t =>
        !!t.isHidden === isHidden &&
        (t.name || "")
          .toLowerCase()
          .includes(keyword)
      )
      .slice(0,8);

  if(hits.length === 0){
    box.innerHTML = "";
    box.style.display = "none";
    return;
  }

  box.innerHTML =
    hits.map(t=>`
      <div
        class="suggest-item bulk-suggest-items"
        onclick="
          document.getElementById('bulk-tag-name').value =
            '${t.name}';

          document.getElementById('bulk-tag-suggest').innerHTML =
            '';

          document.getElementById('bulk-tag-suggest').style.display =
            'none';
        "
      >
        ${t.name}
      </div>
    `).join("");

  box.style.display = "block";
}

/*function getHiddenTagSuggestionsForBook(book){
  // 1. 類似タイトル
  // 2. 選択済み管理タグとの共起
  // 3. 重複除外
  // 4. 多い順
}*/



//==============================
//一括タグ追加エリアの描画
//==============================
function renderBulkTagArea(){

  return `
    <div class="bulk-tag-area">

      <h4>
        🏷️ 一括タグ追加
      </h4>

      <input
        id="bulk-tag-name"
        class="input-common yohaku15"
        placeholder="タグ名"
        oninput="renderBulkTagSuggest()"
      >

      <div
        id="bulk-tag-suggest"
        class="suggest-box bulk-tag-suggest yohaku15"
        style="display:none;"
      ></div>

      <label>
        <input
          type="radio"
          name="bulk-tag-type"
          value="display"
          checked
        >
        表示タグ
      </label>

      <label>
        <input
          type="radio"
          name="bulk-tag-type"
          value="hidden"
        >
        管理タグ
      </label>

      <button
        onclick="addBulkTag()"
      >
        選択した本へ追加
      </button>

    </div>
  `;

}



//==============================
//一括保護エリアの描画
//==============================
function renderBulkProtectArea(){

  return `
    <div class="bulk-protect-area">

      <h4>
        🔒 一括保護
      </h4>

      <button
        onclick="bulkProtectBooks()"
      >
        選択した本を保護
      </button>

      <button
        onclick="bulkUnprotectBooks()"
      >
        選択した本の保護を解除
      </button>

    </div>
  `;

}


//==============================
//一括再読追加エリアの描画
//==============================
function renderBulkRereadArea(){

  return `
    <div class="bulk-reread-area">

      <h4>
        🔁 一括再読
      </h4>

      <button
        onclick="bulkRereadBooks()"
      >
        選択した本を再読にする
      </button>

      <button
        onclick="bulkUnrereadBooks()"
      >
        選択した本の再読を解除
      </button>

    </div>
  `;

}

//==============================
//一括保護
//==============================
function bulkProtectBooks(){

  if(selectedBooks.length === 0){

    alert(
      "本を選択してください"
    );

    return;
  }

  const ok =
    confirm(
      `${selectedBooks.length}冊を保護しますか？`
    );

  if(!ok) return;

  books.forEach(book=>{

    if(
      !selectedBooks.includes(
        String(book.id)
      )
    ){
      return;
    }

    book.protect = true;

  });

  saveData();

  showToast(
    `${selectedBooks.length}冊を保護しました`
  );
  
  selectedBooks = [];

  renderDetailSearch();

}



//==============================
//一括保護解除
//==============================

function bulkUnprotectBooks(){

  if(selectedBooks.length === 0){

    alert(
      "本を選択してください"
    );

    return;
  }

  const ok =
    confirm(
      `${selectedBooks.length}冊の保護を解除しますか？`
    );

  if(!ok) return;

  books.forEach(book=>{

    if(
      !selectedBooks.includes(
        String(book.id)
      )
    ){
      return;
    }

    book.protect = false;

  });

  saveData();

  showToast(
    `${selectedBooks.length}冊の保護を解除しました`
  );
  
  selectedBooks = [];

  renderDetailSearch();

}



//==============================
//一括再読
//==============================
// 選択された本を再読予定にする
function bulkRereadBooks(){

  if(selectedBooks.length === 0){
    alert("本を選択してください");
    return;
  }

  const ok =
    confirm(
      `選択した${selectedBooks.length}冊を再読予定にしますか？`
    );

  if(!ok) return;

  books.forEach(book => {

    if(
      selectedBooks.includes(
        String(book.id)
      )
    ){
      book.reread = true;
    }

  });

  saveData();

  showToast(
    `${selectedBooks.length}冊を再読予定にしました`
  );

  selectedBooks = [];

  renderDetailSearch();

}



//==============================
//一括再読解除
//==============================

function bulkUnrereadBooks(){

  if(selectedBooks.length === 0){

    alert(
      "本を選択してください"
    );

    return;
  }

  const ok =
    confirm(
      `${selectedBooks.length}冊の再読を解除しますか？`
    );

  if(!ok) return;

  books.forEach(book=>{

    if(
      !selectedBooks.includes(
        String(book.id)
      )
    ){
      return;
    }

    book.reread = false;

  });

  saveData();

  showToast(
    `${selectedBooks.length}冊の再読を解除しました`
  );
  
  selectedBooks = [];

  renderDetailSearch();

}
