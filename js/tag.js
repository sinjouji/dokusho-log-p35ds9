//
// TAG.JS
//
// 非表示タグとか入れていくよ〜〜〜


//編集中タグ用
let editingTagPageId = null;


//==============================
//タグ情報を取得
//==============================
function getVisibleBookTagIds(book){

  return (book.tagIds || [])
    .filter(tagId =>
      !isHiddenTag(tagId)
    );
}

function getHiddenBookTagIds(book){

  return (book.tagIds || [])
    .filter(tagId =>
      isHiddenTag(tagId)
    );
}




//==============================
//タグページ描画
//==============================
function renderTags(){

setActiveMenu("menu-tags");

  const main =
    document.getElementById("tags-main");

  if(!main) return;

  main.innerHTML = `
    <div class="tags-header">

  <h2>🏷️ タグ</h2>

  <button
    class="add-tag-btn"
    onclick="openAddTagModal()"
  >
    ＋タグ
  </button>

</div>

<div
  id="add-tag-modal"
  class="modal"
>

  <div class="modal-content">

    <h3>タグ追加</h3>

    <input
      id="new-tag-name"
      class="addin"
      placeholder="タグ名"
    >

    <label>

      <input
        id="new-tag-hidden"
        type="checkbox"
      >

      管理タグ

    </label>

    <div class="modal-actions">

      <button
        onclick="saveNewTag()"
      >
        保存
      </button>

      <button
        onclick="
          closeModal(
            'add-tag-modal'
          )
        "
      >
        キャンセル
      </button>

    </div>

  </div>

</div>


    <div id="visible-tags-area"></div>

    <hr class="kugiri">

    <div id="hidden-tags-area"></div>
  `;

  renderVisibleTags();
  renderHiddenTags();
}

//==============================
//表示タグエリア
//==============================
function renderVisibleTags(){

  const area =
    document.getElementById(
      "visible-tags-area"
    );

  if(!area) return;

  area.innerHTML = `
  <h3>表示タグ</h3>
  <div id="visible-tags-grid" class="visible-tags-grid"></div>
`;

const grid =
  document.getElementById("visible-tags-grid");
  
  tagMaster
    .filter(tag => !tag.isHidden)
    .forEach(tag=>{
    
    const count =
  books.filter(book =>
    (book.tagIds || [])
      .map(String)
      .includes(String(tag.id))
  ).length;

      const card =
        document.createElement("div");

      card.className =
        "tag-card";
      card.style.borderLeft =
        `6px solid ${tag.color}`;

      card.innerHTML = `
  <div class="tag-card-name">
    ${tag.name}
  </div>

  <div class="tag-card-count">
    (${count})
  </div>

  <button
    class="tag-card-edit"
    onclick="
      openTagEditModal(
        '${tag.id}'
      )
    "
  >
    編集
  </button>
`;


if(editingTagPageId === tag.id){

  card.innerHTML = `
    <input
      id="tag-page-name-${tag.id}"
      class="addin"
      value="${tag.name}"
    >

    <label class="tag-page-check">
      <input
        type="checkbox"
        id="tag-page-hidden-${tag.id}"
        ${tag.isHidden ? "checked" : ""}
      >
      管理タグにする
    </label>

    <div class="tag-page-actions">
      <button onclick="saveTagPageEdit('${tag.id}')">
        保存
      </button>

      <button onclick="confirmDeleteTag('${tag.id}')">
        削除
      </button>

      <button onclick="cancelTagPageEdit()">
        キャンセル
      </button>
    </div>
  `;

}else{

  card.innerHTML = `
    <div class="tag-card-name">
      ${tag.name}
    </div>

    <div class="tag-card-count">
      (${count})
    </div>

    <button onclick="startTagPageEdit('${tag.id}')">
      編集
    </button>
  `;
}


      grid.appendChild(card);
    });
}




//==============================
//管理（非表示）タグエリア
//==============================
function renderHiddenTags(){

  const area =
    document.getElementById(
      "hidden-tags-area"
    );

  if(!area) return;

  area.innerHTML = `
    <h3># 管理タグ</h3>

    <input
      id="hidden-tag-search"
      class="addin"
      placeholder="管理タグ検索"
    >

    <div
      id="hidden-tag-list"
      class="hidden-tag-list"
    ></div>
  `;

  const list =
    document.getElementById(
      "hidden-tag-list"
    );

  tagMaster
    .filter(tag => tag.isHidden)
    .forEach(tag=>{

      const chip =
        document.createElement("span");

      chip.className =
        "hidden-tag-chip";

      chip.textContent =
        "#" + tag.name;

      list.appendChild(chip);
    });
}




//==============================
//非表示タグ
//==============================
function isHiddenTag(tagId){

  const tag =
    tagMaster.find(t =>
      String(t.id) === String(tagId)
    );

  return !!tag?.isHidden;
}



//==============================
//本が非表示タグを持っているか調べる子ちゃん
//==============================
function hasHiddenTag(book){

  return (book.tagIds || [])
    .some(tagId =>
      isHiddenTag(tagId)
    );
}



//==============================
//非表示タグを本に追加
//==============================
function addHiddenTag(bookId, tagName){

  const book =
    books.find(
      b => String(b.id) === String(bookId)
    );

  if(!book) return;

  const tag =
    tagMaster.find(t =>
      t.isHidden
      &&
      t.name === tagName.trim()
    );

  if(!tag) return;

  if(!book.tagIds){
    book.tagIds = [];
  }

  if(
    !book.tagIds.includes(tag.id)
  ){
    book.tagIds.push(tag.id);
  }
  refreshBookDetailModal(book);
}


//==============================
//非表示タグを本から削除
//==============================
function removeHiddenTag(
  bookId,
  tagId
){

  const book =
    books.find(
      b => String(b.id) === String(bookId)
    );

  if(!book) return;

  book.tagIds =
    (book.tagIds || [])
      .filter(id =>
        String(id) !== String(tagId)
      );
  refreshBookDetailModal(book);
}



//==============================
//非表示タグを本から削除のトグルちゃん
//==============================
function confirmRemoveHiddenTag(bookId, tagId){

  const key =
    `${bookId}-${tagId}`;

  const book =
    books.find(b =>
      String(b.id) === String(bookId)
    );

  if(!book) return;

  if(pendingHiddenTagRemove === key){

    removeHiddenTag(bookId, tagId);

    pendingHiddenTagRemove = null;

    return;
  }

  pendingHiddenTagRemove = key;

  refreshBookDetailModal(book);
}

//==============================
//モーダル重複防止ちゃん
//==============================
function refreshBookDetailModal(book){

  closeModal("open-book-modal");

  openBookDetailModal(book);
}


//==============================
//非表示タグサジェスト
//==============================
function renderHiddenTagSuggest(bookId){

  const input =
    document.getElementById(
      `hidden-tag-input-${bookId}`
    );

  const area =
    document.getElementById(
      `hidden-tag-suggest-${bookId}`
    );

  if(!input || !area) return;

  const keyword =
    input.value.trim().toLowerCase();

  area.innerHTML = "";

  if(!keyword) return;

  const candidates =
    tagMaster.filter(tag =>
      tag.isHidden &&
      (tag.name || "")
        .toLowerCase()
        .includes(keyword)
    );

  candidates.forEach(tag=>{

    const chip =
      document.createElement("button");

    chip.className = "hidden-tag-suggest-chip";
    chip.textContent = tag.name;

    chip.onclick = ()=>{
      addHiddenTag(bookId, tag.name);
    };

    area.appendChild(chip);
  });
}




//==============================
//タグ編集開始
//==============================
function startTagPageEdit(id){

  editingTagPageId = id;

  renderTags();
}

//==============================
//タグ編集キャンセル
//==============================
function cancelTagPageEdit(){

  editingTagPageId = null;

  renderTags();
}


//==============================
//タグ編集保存
//==============================
async function saveTagPageEdit(id){

  const tag =
    tagMaster.find(t =>
      String(t.id) === String(id)
    );

  if(!tag) return;

  const nameInput =
    document.getElementById(
      `tag-page-name-${id}`
    );

  const hiddenInput =
    document.getElementById(
      `tag-page-hidden-${id}`
    );

  if(nameInput){
    tag.name =
      nameInput.value.trim();
  }

  if(hiddenInput){
    tag.isHidden =
      hiddenInput.checked;
  }

  await saveData();

  editingTagPageId = null;

  renderTags();
  renderHome();
}



//==============================
//新規タグ保存
//==============================
async function saveNewTag(){

  const name =
    document
      .getElementById(
        "new-tag-name"
      )
      .value
      .trim();

  if(!name) return;

  tagMaster.push({

    id:
      "t" + Date.now(),

    name,

    color:
      "#b9b9b9",

    isHidden:
      document
        .getElementById(
          "new-tag-hidden"
        )
        .checked

  });

  await saveData();

  closeModal(
    "add-tag-modal"
  );

  renderTags();
}