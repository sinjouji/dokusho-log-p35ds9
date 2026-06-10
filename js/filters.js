//===============================
// FILTERS
//
// 絞込みふぃるたぁぁああああ
//===============================


//==============================
//★共通フィルタ関数ちゃん
//==============================
function shouldShowItem(item){

  return shouldShowByType(item)
    && matchTagsAdvanced(item);
}




//==============================
//★フィルタを判定する子ちゃん
//==============================
function matchTags(item){

  if(
    filterState.tagMode === "OFF"
    ||
    !filterState.tags.length
  ){
    return true;
  }

  const itemTags =
    (item.tagIds || []).map(String);

  if(filterState.tagMode === "AND"){

    return filterState.tags.every(tagId =>

      itemTags.includes(String(tagId))

    );
  }

  if(filterState.tagMode === "OR"){

    return filterState.tags.some(tagId =>

      itemTags.includes(String(tagId))

    );
  }

  if(filterState.tagMode === "NOT"){

    return !filterState.tags.some(tagId =>

      itemTags.includes(String(tagId))

    );
  }

  return true;
}


//==============================
//★フィルタの判定個別Verちゃん
//==============================
function matchTagsAdvanced(item){

  const itemTags =
    (item.tagIds || []).map(String);

  const states =
    filterState.tagStates;


  //AND判定
  const andTags = Object.keys(states)
    .filter(
      tagId => states[tagId] === "AND"
    );

  //AND全部持ってないと除外
  const andOk =
    andTags.every(
      tagId => itemTags.includes(tagId)
    );

  if(!andOk) return false;


  //OR判定
  const orTags = Object.keys(states)
  .filter(
    tagId => states[tagId] === "OR"
  );
  
  if(orTags.length){

  const orOk =
    orTags.some(
      tagId => itemTags.includes(tagId)
    );

    if(!orOk) return false;
  }
  
  //NOT判定
  const notTags = Object.keys(states)
  .filter(
    tagId => states[tagId] === "NOT"
  );
  
  const hasNot =
  notTags.some(
    tagId => itemTags.includes(tagId)
  );

  if(hasNot) return false;
  

  return true;
}



//==============================
//★フィルタの状態更新用ちゃん
//==============================
function setTagMode(mode){
  filterState.tagMode = mode;
  renderHome();
  updateTagModeUI();
}



//==============================
//★新型タグフィルタちゃん（しばし共存
//==============================
function toggleFilterTag(id){

  const strId = String(id);

  if(filterState.tags.includes(strId)){

    filterState.tags =
      filterState.tags.filter(
        t => t !== strId
      );

    delete filterState.tagStates[strId];

  } else {

    filterState.tags.push(strId);

    filterState.tagStates[strId] =
      filterState.tagMode;
  }
  
  console.log(filterState.tagStates);

  renderHome();
  saveFilterState();
}


//==============================
//★絞込み切り替えちゃん
//==============================
function cycleTagMode(){

  if(filterState.tagMode === "AND"){

    filterState.tagMode = "OR";

  } else if(
    filterState.tagMode === "OR"
  ){

    filterState.tagMode = "NOT";

  } else if(
    filterState.tagMode === "NOT"
  ){

    filterState.tagMode = "OFF";

  } else {

    filterState.tagMode = "AND";
  }

  renderHome();
  saveFilterState();
}


//==============================
//★タグ単体で絞込み条件変更ちゃん
//==============================
function cycleTagState(tagId){

  const strId = String(tagId);

  const current =
    filterState.tagStates[strId];

  if(!current){

    filterState.tagStates[strId] =
      "AND";

  } else if(current === "AND"){

    filterState.tagStates[strId] =
      "OR";

  } else if(current === "OR"){

    filterState.tagStates[strId] =
      "NOT";

  } else {

    delete filterState.tagStates[strId];
  }

  filterState.tags =
    Object.keys(filterState.tagStates);

  saveFilterState();

  renderHome();
}




//==============================
//★フィルタをまとめるベースちゃん
//==============================
function shouldShowByType(item){
  if(item.type === "book") return filterState.types.book;
  if(item.type === "series") return filterState.types.series;
  if(item.type === "character") return filterState.types.character;

  return true;
}



//==============================
//★フィルタの状態保存ちゃん
//==============================
function saveFilterState(){

  localStorage.setItem(

    "filterState",

    JSON.stringify(filterState)

  );

}



//==============================
//固定バー用タイプ切り替え
//==============================
function changeTypeFilterFromFixed(){

  typeFilter =
    document.getElementById(
      "type-filter-fixed"
    ).value;

  localStorage.setItem(
    "typeFilter",
    typeFilter
  );

  renderHome();
}

//==============================
//====タイプフィルター切り替え
//==============================
function changeTypeFilter(){

  typeFilter =
    document.getElementById(
      "type-filter"
    ).value;

  localStorage.setItem(
    "typeFilter",
    typeFilter
  );

  renderHome();
}




//==============================
//★フィルタの選択状態見た目ちゃん
//==============================
function updateTagModeUI(){

  document.querySelectorAll(".filter-mode button")
    .forEach(btn => {

      if(btn.textContent === filterState.tagMode){
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }

    });
}



//==============================
//絞込み状態リセットちゃん
//==============================
function resetHomeSearchFilter(){

  // タグ条件リセット
  filterState.tags = [];
  filterState.tagStates = {};

  // 検索欄リセット
  searchKeyword = "";

  saveFilterState();

  renderHome();
}

//======🔍検索用エリア===========
//★====検索UIだけの役割
//==============================
function renderSearchArea(){

  const top = document.getElementById("home-top");
  if(!top) return;
  
  const items = books;//応急処置、後で変更
  
  const visibleItems = items.filter(item =>
  shouldShowByType(item) &&
  matchTags(item)
  );
 
  top.innerHTML = `
  <div class="filter-actions">
    <input class="input-common input-small"
      id="search"
      placeholder="検索..."
      value="${searchKeyword}"
      oninput="handleSearchInput()"
    >
    
    
      <select id="sort-select" class="select-chip"
        onchange="changeSortMode()">

      <option value="read-desc">読了日新</option>
      <option value="read-asc">読了日古</option>

      <option value="title-asc">タイトル↓</option>
      <option value="title-desc">タイトル↑</option>

      <option value="rating-desc">高評価</option>
      <option value="rating-asc">低評価</option>

      </select>
      
      <button class="tag-chip"
        data-open="🏷️タグ非表示"
        data-close="🏷️タグ表示"

        onclick="togglesSection(
        'tag-filter',
        this
        )
      "
     >🏷️タグ表示
       </button>
       <div class="mini-text usui-text">
        タグ切替<br>
        AND/OR/NOT
      </div>
       </div>
       
      
       <div class="filter-actions">
       
         <div
           id="active-filter-view"
           class="active-filter-view"
         ></div>
       </div>
       
   
<div class="
  toggle-content
  ${homeSections.tags ? "open" : ""}
  "
  id="tag-filter"></div>

    <div id="suggest"></div>
  `;
  
  renderSuggest();
}

   // toggleTagFilter()



//==============================
//★絞込み現状表示ちゃん
//==============================
function renderActiveFilterView(){

  const area =
    document.getElementById(
      "active-filter-view"
    );

  if(!area) return;

  if(!filterState.tags.length){

  area.innerHTML = "";
  area.style.display = "none";

  return;
}

area.style.display = "block";
    
    
  function getTagNames(tagIds){

  return tagIds.map(tagId=>{

    const tag =
      tagMaster.find(
        t => String(t.id) === String(tagId)
      );

    return tag?.name || "？";

  }).join(" / ");

}

  //AND選択中タグ抽出
  const andTags = Object.keys(
    filterState.tagStates
  ).filter(

    tagId =>

    filterState.tagStates[tagId]
      === "AND"
  );
  
  //OR抽出
  const orTags = Object.keys(
    filterState.tagStates
  ).filter(

    tagId =>

    filterState.tagStates[tagId]
      === "OR"
  );
  
  //NOT抽出
  const notTags = Object.keys(
    filterState.tagStates
  ).filter(

    tagId =>

    filterState.tagStates[tagId]
      === "NOT"
  );

  area.innerHTML = `

    <div class="active-filter-row">

      <span class="filter-mode-label">

        ${andTags.length ? `
          <div>
            AND：${getTagNames(andTags)}
         </div>
         ` : ""}
         
        ${orTags.length ? `
          <div>
            OR：${getTagNames(orTags)}
           </div>
        ` : ""}
         
        ${notTags.length ? `
          <div>
            NOT：${getTagNames(notTags)}
          </div>
        ` : ""}
       
        </span>

      <span class="filter-tag-list">

      </span>

    </div>

  `;
}



//==============================
//====キーワード検索（ホーム本棚用）
//==============================
function handleSearchInput(){

  searchKeyword =
    (document.getElementById(
    "search"
    )?.value || "")
    .toLowerCase();

  renderSuggest();
  renderBookList();
}


//==============================
//====ソートモードの切替え（本）
//==============================
function changeSortMode(){

  sortMode =
    document.getElementById("sort-select").value;

  renderBookList();
}


//==============================
//====★タグフィルター描画※旧になる予定20260519
//==============================
function renderTagFilter(){

  const area =
    document.getElementById("tag-filter");

  if(!area) return;

  area.innerHTML = "";

  tagMaster
    .filter(tag => !tag.isHidden)
    .forEach(tag=>{

    const btn =
      document.createElement("button");

    btn.className = "tag-chip";
    btn.textContent = tag.name;

    btn.style.background = "#fffffc";
    btn.style.color = tag.color || "#666";
    btn.style.border = `1px solid ${tag.color || "#ccc"}`;
    btn.style.borderRadius = "999px";

    const isActive =
      filterState.tags.includes(String(tag.id));
      
    const mode =
      filterState.tagStates[String(tag.id)];

    if(isActive){
      btn.classList.add("active");
      
       if(mode){
         btn.classList.add(
          `tag-mode-${mode.toLowerCase()}`
         );
       }
      
      btn.style.background = tag.color;
      btn.style.color = "#fffffc";
    }

  btn.onclick = () => {

    cycleTagState(tag.id);

    renderHome();
  };

    area.appendChild(btn);
  });
}


//==============================
//★フィルタの状態
//==============================
const filterState = {
  tags: [],        // 選択中タグID
  tagMode: "AND",  // AND / OR / NOT
  tagStates: {},
  types: {
    book: true,
    series: true,
    character: true
  },
  search: ""
};




//==============================
//タグ収納トグル※旧になる予定20260519
//==============================
function toggleTagFilter(){

  showTagFilter = !showTagFilter;
  
  localStorage.setItem(
    "showTagFilter",
    showTagFilter
  );

  renderHome();
}



//==============================
//★フィルタの状態読み込みちゃん
//==============================
const savedFilterState =
  localStorage.getItem(
    "filterState"
  );

if(savedFilterState){

  Object.assign(

    filterState,

    JSON.parse(savedFilterState)

  );

}
