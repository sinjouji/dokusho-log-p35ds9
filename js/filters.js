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

