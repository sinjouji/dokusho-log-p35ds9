//
// TAG.JS
//
// 非表示タグとか入れていくよ〜〜〜


//編集中タグ用
let editingTagPageId = null;
//新規タグ用
let showAddTagForm = false;
//削除用
let deletingTagId = null;
//管理タグ編集用
let editingHiddenTagId = null;
let deletingHiddenTagId = null;
//カラーパレット用の一時色保管所
let editingTagPageColor = null;
//管理タグ検索ワード用変数
let hiddenTagSearchKeyword = "";
//管理タグソート用
let tagSortMode = "nameAsc";



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

  <button
  class="add-tag-btn"
  onclick="toggleAddTagForm()"
>
  ＋タグ
</button>

<div class="tag-sort-buttons">
  <button onclick="tagSortMode='nameAsc'; renderTags();">
    名前↑
  </button>

  <button onclick="tagSortMode='nameDesc'; renderTags();">
    名前↓
  </button>

  <button onclick="tagSortMode='countDesc'; renderTags();">
    使用数↓
  </button>

  <button onclick="tagSortMode='countAsc'; renderTags();">
    使用数↑
  </button>
</div>


  <h2>🏷️ タグ</h2>

</div>

${
  showAddTagForm
    ? `
      <div class="add-tag-card">

        <h3>タグ追加</h3>

        <input
          id="new-tag-name"
          class="addin"
          placeholder="タグ名"
        >

        <label class="tag-page-check">
          <input
            id="new-tag-hidden"
            type="checkbox"
          >
          管理タグ
        </label>

        <div class="tag-page-actions">
          <button onclick="saveNewTag()">
            保存
          </button>

          <button onclick="toggleAddTagForm()">
            キャンセル
          </button>
        </div>

      </div>
    `
    : ""
}


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
    <div
      id="visible-tags-grid"
      class="visible-tags-grid"
    ></div>
  `;

  const grid =
    document.getElementById(
      "visible-tags-grid"
    );

  sortTags(
  tagMaster.filter(tag => !tag.isHidden)
  )
    .forEach(tag=>{

      const count =
        books.filter(book =>
          (book.tagIds || [])
            .map(String)
            .includes(String(tag.id))
        ).length;

      const card =
        document.createElement("div");

      card.className = "tag-card";

      card.style.borderLeft =
        `6px solid ${tag.color}`;

      // 削除確認中
      if(
        editingTagPageId === tag.id &&
        deletingTagId === tag.id
      ){

        card.innerHTML = `
          <div class="delete-confirm">
            <div>
              本当に削除しますか？
            </div>

            <div class="tag-page-actions">
              <button
                onclick="deleteTag('${tag.id}')"
              >
                削除する
              </button>

              <button
                onclick="
                  deletingTagId = null;
                  renderTags();
                "
              >
                やめる
              </button>
            </div>
          </div>
        `;

      // 編集中
      }else if(
        editingTagPageId === tag.id
      ){

        card.innerHTML = `
          <input
            id="tag-page-name-${tag.id}"
            class="addin"
            value="${tag.name}"
          >


          <div class="tag-color-row">
  ${tagColors.map(color => `
  <button
    class="
      tag-color-dot
      ${
        editingTagPageColor === color
          ? "active"
          : ""
      }
    "
    style="background:${color};"
    onclick="
      selectTagPageColor(
        '${tag.id}',
        '${color}'
      )
    "
  ></button>
`).join("")}
</div>


          <label class="tag-page-check">
            <input
              type="checkbox"
              id="tag-page-hidden-${tag.id}"
              ${tag.isHidden ? "checked" : ""}
            >
            管理タグにする
          </label>

          <div class="tag-page-actions">
            <button
              onclick="saveTagPageEdit('${tag.id}')"
            >
              保存
            </button>

            <button
              onclick="
                deletingTagId = '${tag.id}';
                renderTags();
              "
            >
              削除
            </button>

            <button
              onclick="cancelTagPageEdit()"
            >
              キャンセル
            </button>
          </div>
        `;

      // 通常表示
      }else{

        card.innerHTML = `
          <div class="tag-card-name">
            ${tag.name}
          </div>

          <div class="tag-card-count">
            (${count})
          </div>

          <button
            onclick="startTagPageEdit('${tag.id}')"
          >
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

  const keyword =
  hiddenTagSearchKeyword
    .trim()
    .toLowerCase();

const hiddenTags =
  tagMaster
  .filter(tag => tag.isHidden)
    .filter(tag =>
      !keyword
      ||
      (tag.name || "")
        .toLowerCase()
        .includes(keyword)
    );

  const editingTag =
    hiddenTags.find(tag =>
      String(tag.id) ===
      String(editingHiddenTagId)
    );

  area.innerHTML = `
    <div class="hidden-tag-panel">

      <div class="hidden-tag-header">

        <h3># 管理タグ</h3>

        <div class="hidden-tag-count">
          (${hiddenTags.length})
        </div>

      </div>

      <input
  id="hidden-tag-search"
  class="addin"
  placeholder="管理タグ検索"
  oninput="
    hiddenTagSearchKeyword = this.value;
    renderHiddenTagList();
  "
>

      <div
        id="hidden-tag-list"
        class="hidden-tag-list"
      ></div>

      <div
        id="hidden-tag-edit-area"
      ></div>

    </div>
  `;

  const list =
    document.getElementById(
      "hidden-tag-list"
    );

  renderHiddenTagList();

  const editArea =
    document.getElementById(
      "hidden-tag-edit-area"
    );

  if(!editArea || !editingTag) return;

  const count =
    books.filter(book =>
      (book.tagIds || [])
        .map(String)
        .includes(String(editingTag.id))
    ).length;

  if(
    String(deletingHiddenTagId) ===
    String(editingTag.id)
  ){

    editArea.innerHTML = `
      <div class="hidden-tag-edit-card delete-confirm">

        <div>
          #${editingTag.name} を削除しますか？
        </div>

        <div class="tag-page-actions">
          <button
            onclick="deleteTag('${editingTag.id}')"
          >
            削除する
          </button>

          <button
            onclick="
              deletingHiddenTagId = null;
              renderHiddenTags();
            "
          >
            やめる
          </button>
        </div>

      </div>
    `;

  }else{

    editArea.innerHTML = `
  <div class="hidden-tag-edit-card">

    <div class="hidden-tag-edit-title">
      #${editingTag.name}
      <span class="hidden-tag-edit-count">
        (${count})
      </span>
    </div>

    <input
      id="hidden-tag-edit-name-${editingTag.id}"
      class="addin"
      value="${editingTag.name}"
    >

    <div class="tag-page-actions">
    <label class="tag-page-check">
  <input
    type="checkbox"
    id="hidden-tag-edit-visible-${editingTag.id}"
  >
  表示タグにする
</label>
    
      <button
        onclick="
          saveHiddenTagEdit(
            '${editingTag.id}'
          )
        "
      >
        保存
      </button>

      <button
        onclick="
          deletingHiddenTagId =
            '${editingTag.id}';

          renderHiddenTags();
        "
      >
        削除
      </button>

      <button
        onclick="
          editingHiddenTagId = null;
          deletingHiddenTagId = null;
          renderHiddenTags();
        "
      >
        閉じる
      </button>
    </div>

  </div>
`;
  }
}



//==============================
//非表示タグ描画
//==============================
function renderHiddenTagList(){

  const list =
    document.getElementById("hidden-tag-list");

  if(!list) return;

  list.innerHTML = "";

  const keyword =
    (hiddenTagSearchKeyword || "")
      .trim()
      .toLowerCase();

  const hiddenTags =
    sortTags(
  tagMaster.filter(tag => tag.isHidden)
)
      .filter(tag =>
        !keyword ||
        (tag.name || "")
          .toLowerCase()
          .includes(keyword)
      );

  hiddenTags.forEach(tag=>{

    const count =
      books.filter(book =>
        (book.tagIds || [])
          .map(String)
          .includes(String(tag.id))
      ).length;

    const chip =
      document.createElement("span");

    chip.className = "hidden-tag-chip";

    if(String(tag.id) === String(editingHiddenTagId)){
      chip.classList.add("active");
    }

    chip.textContent =
      `#${tag.name} (${count})`;

    chip.onclick = ()=>{
      editingHiddenTagId =
        String(editingHiddenTagId) === String(tag.id)
          ? null
          : tag.id;

      deletingHiddenTagId = null;

      renderHiddenTags();
    };

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
//非表示タグ編集保存ちゃん
//==============================
async function saveHiddenTagEdit(id){

  const tag =
    tagMaster.find(t =>
      String(t.id) === String(id)
    );

  if(!tag) return;

  const input =
    document.getElementById(
      `hidden-tag-edit-name-${id}`
    );

  if(input){
    tag.name =
      input.value.trim();
  }

  const visibleCheck =
  document.getElementById(
    `hidden-tag-edit-visible-${id}`
  );

if(visibleCheck && visibleCheck.checked){
  tag.isHidden = false;
}

  await saveData();

  editingHiddenTagId = null;
  deletingHiddenTagId = null;

  renderTags();
  renderHome();
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

  const tag =
    tagMaster.find(t =>
      String(t.id) === String(id)
    );

  editingTagPageColor =
    tag?.color || "#b9b9b9";

  renderTags();
}


//==============================
//タグ色パレット選択
//==============================
function selectTagPageColor(id, color){

  editingTagPageColor = color;

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
  
  tag.color =
    editingTagPageColor || tag.color;

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

  showAddTagForm = false;
  renderTags();
}


//==============================
//新規タグ登録エリア開閉トグル
//==============================
function toggleAddTagForm(){

  showAddTagForm =
    !showAddTagForm;

  renderTags();
}



//==============================
//タグ削除処理
//==============================
async function deleteTag(id){

  tagMaster =
    tagMaster.filter(tag =>
      String(tag.id) !== String(id)
    );

  books.forEach(book=>{
    book.tagIds =
      (book.tagIds || [])
        .filter(tagId =>
          String(tagId) !== String(id)
        );
  });

  editingTagPageId = null;
  deletingTagId = null;

  await saveData();

  renderTags();
  renderHome();
}



//==============================
//管理タグソート用（使用数取得）
//==============================
function getTagUseCount(tagId){

  return books.filter(book =>
    (book.tagIds || [])
      .map(String)
      .includes(String(tagId))
  ).length;
}



//==============================
//管理タグソート
//==============================
function sortTags(list){

  return [...list].sort((a,b)=>{

    if(tagSortMode === "nameAsc"){
      return a.name.localeCompare(b.name, "ja");
    }

    if(tagSortMode === "nameDesc"){
      return b.name.localeCompare(a.name, "ja");
    }

    if(tagSortMode === "countDesc"){
      return getTagUseCount(b.id) - getTagUseCount(a.id);
    }

    if(tagSortMode === "countAsc"){
      return getTagUseCount(a.id) - getTagUseCount(b.id);
    }

    return 0;
  });
}






