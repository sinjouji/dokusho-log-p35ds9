//
// BOOKS.JS
//
// 本一覧とか、本に関する処理ちゃんたち
//

let openAfterDuplicate =
  localStorage.getItem("openAfterDuplicate");

openAfterDuplicate =
  openAfterDuplicate === null
    ? false
    : openAfterDuplicate === "true";

//==============================
//====最新読了日を取得するやつ
//==============================
function getLatestReadDate(book){

  return (
    [...(book.readDates || [])]
      .filter(Boolean)
      .sort()
      .at(-1)
  ) || "";

}


//==============================
//====読了日の取得
//==============================
async function addReadDate(id){

  const book =
    books.find(
      b => String(b.id) === String(id)
    );

  if(!book) return;

  const input =
    document.getElementById(
      `readDate-${id}`
    );

  if(!input.value) return;

  if(!book.readDates){
    book.readDates = [];
  }

  book.readDates.unshift(
    input.value
  );

  // 本棚へ移動
  book.type = "normal";

  await saveData();
  
  console.log("books after save", books);

  closeModal("open-book-modal");

  openBookDetailModal(book);

  renderHome();
  
  
  console.log("after add", book);
console.log("readDates", book.readDates);
console.log("type", book.type);
  
}





//==============================
//評価取得
//==============================
function getFavLabel(val){
	if(val >= 4) return "👑";
	return "★".repeat(val || 0);
	}



//==============================
//====再読本のチェック切替え
//==============================
function toggleReread(id){

  const book =
    books.find(
      b=>String(b.id)===String(id)
    );

  if(!book) return;

  book.reread =
    document.getElementById(
      "reread-check"
    ).checked;

  saveData();

  renderHome();
}



//==============================
//====モーダル版日付削除処理
//==============================
async function removeReadDate(bookId,date){

  const book =
    books.find(b=>b.id==bookId);

  if(!book) return;
  
  if(!confirm("この読了日を削除しますか？")){
    return;
  }

  book.readDates =
    (book.readDates || [])
      .filter(d=>d !== date);

  if(book.readDates.length === 0){
    book.type = "wish";
  }

  await saveData();

  closeModal("open-book-modal");
  openBookDetailModal(book);
  renderHome();
}




//==============================
// ⬛︎ホーム（本のリスト表示）HOME====
//ホーム画面の「骨組みだけ」にする！
//==============================
function renderHome(){

  setActiveMenu("menu-home");

  const el = document.getElementById("page-home");
  if(!el) return;

  el.innerHTML = `
    <div id="home-fixed-bar"></div>
    <div id="home-top"></div>
    <div id="home-main"></div>
  `;

  renderHomeFixedBar();
  renderSearchArea();
  renderTagFilter();
  renderActiveFilterView();
  renderBookList();
}



//==============================
//ホーム固定バー
//==============================
function renderHomeFixedBar(){

  const bar =
    document.getElementById("home-fixed-bar");

  if(!bar) return;

  bar.innerHTML = `
    <button onclick="openAddBookModal()" class="fixed-add-btn">
      ＋本
    </button>

    <button
      class="${viewMode === 'card' ? 'active' : ''}"
      onclick="changeViewMode('card')"
    >
      ■
    </button>

    <button
      class="${viewMode === 'list' ? 'active' : ''}"
      onclick="changeViewMode('list')"
    >
      ☰
    </button>

    <button
      class="${viewMode === 'shelf' ? 'active' : ''}"
      onclick="changeViewMode('shelf')"
    >
      ‖‖
    </button>

    <select class="select-chip" id="type-filter-fixed" onchange="changeTypeFilterFromFixed()">
      <option value="all" ${typeFilter === "all" ? "selected" : ""}>全部</option>
      <option value="normal" ${typeFilter === "normal" ? "selected" : ""}>本棚</option>
      <option value="wish" ${typeFilter === "wish" ? "selected" : ""}>ウィッシュ</option>
    </select>
    
    
    <button
  class="filter-reset-btn"
  onclick="resetHomeSearchFilter()"
>
  🧹リセット
</button>
    
  `;
  
}





//==============================
//新規本を追加保存================
//=============================
async function saveNewBook(){

  const title =
    document.getElementById("add-title").value.trim();

  if(!title){
    alert("タイトルが未入力です");
    return;
  }

  const subtitle =
  document.getElementById("add-subtitle")
    ?.value
    .trim() || "";

  const date =
    document.getElementById("add-date").value;

  const memo =
    document.getElementById("add-memo")?.value || "";


  const sameTitleBooks =
  books.filter(book =>

    (book.title || "").trim()
      === title

  );

const maxVolume =
  Math.max(
    0,
    ...sameTitleBooks.map(book =>
      Number(book.volume || 0)
    )
  );

const nextVolume =
  maxVolume + 1;


  const book = {
    id: Date.now().toString(),
    title,
    subtitle,
    volume: nextVolume,
    memo: memo,
    fav: newBookFav,
    readDates: date ? [date] : [],
    tagIds: [
      ...newBookTagIds,
      ...newBookHiddenTagIds
    ],
    seriesIds:
      editingBookSeriesIds.map(String),
    type: date ? "normal" : "wish"
  };

  books.unshift(book);
  
  
  seriesMaster.forEach(series=>{

  const shouldHaveSeries =
    editingBookSeriesIds.includes(
      String(series.id)
    );

  if(shouldHaveSeries){

    if(
      !(series.bookIds || [])
        .includes(String(book.id))
    ){

      series.bookIds =
        (series.bookIds || []).concat(
          String(book.id)
        );
    }
  }
});
  

  await saveData();
  
  const placeName =
    book.type === "wish"
      ? "ウィッシュリスト"
      : "本棚";
      
  showToast(`「${book.title}」を${placeName}に追加しました`);

  closeModal("add-book-modal");

  renderHome();
}




//==============================
//====詳細保存================
//==============================
async function saveDetail(id){

 const book =
    books.find(b=>String(b.id)===String(id));

  console.log("save start", id);
  
  if(!book.readDates){

  book.readDates =
    book.dates || [];
}
delete book.dates;

 book.seriesIds =
  [...editingBookSeriesIds];

seriesMaster.forEach(series=>{

  const hasBook =
    editingBookSeriesIds.includes(
      String(series.id)
    );

  if(hasBook){

    if(
      !(series.bookIds || [])
        .includes(book.id)
    ){

      series.bookIds = [
        ...(series.bookIds || []),
        book.id
      ];
    }

  }else{

    series.bookIds =
      (series.bookIds || [])
        .filter(seriesBookId =>

          String(seriesBookId)
          !== String(book.id)

        );
  }
});

  console.log("found book", book);

  if(!book) return;

  console.log(
    document.getElementById("detail-title").value
  );

  book.title =
    document.getElementById("detail-title").value;
    
  book.subtitle =
  document
    .getElementById(
      "edit-subtitle"
    )
    .value
    .trim();
    
  book.volume =
  Number(
    document.getElementById(
      "detail-volume"
    )?.value || 0
  );

 if(enableMemo){
   const memoEl =
     document.getElementById("editMemo");
     
     book.memo =
       memoEl?.value || "";
  }

  book.fav = currentDetailFav;

  console.log("after edit", book);

  await saveData();

showToast("保存しました！");

  closeModal("open-book-modal");

  renderHome();
}




//==============================
//====本を削除==================
//==============================
async function deleteBook(id){

  const book =
    books.find(
      b => String(b.id) === String(id)
    );

  if(!book) return;

  const title = book.title;

  const ok =
    confirm(
      `${book.title}を削除しますか？`
    );

  if(!ok) return;

  books =
    books.filter(
      b => String(b.id) !== String(id)
    );

  seriesMaster.forEach(series=>{

    series.bookIds =
      (series.bookIds || [])
        .filter(seriesBookId =>

          String(seriesBookId)
          !== String(book.id)

        );
  });

  await saveData();

  closeModal("open-book-modal");

  renderHome();

  showToast(
    `「${title}」を削除しました`
  );
}





//==============================
//本詳細の関連本の一覧描画
//==============================
function renderBookEditSeries(
  targetId
){

  const target =
    document.getElementById(targetId);

  if(!target) return;

  const relatedSeries =
    seriesMaster.filter(s =>

      editingBookSeriesIds.includes(
        String(s.id)
      )

    );

  target.innerHTML = `

    <div>

      ${relatedSeries.map(s=>`

        <div class="related-chip">

          ${s.name}

          <button
            class="mini-delete-btn"
            onclick="
              removeSeriesFromBook(
                '${s.id}',
                '${targetId}',
                'book-related-search',
                'book-series-suggest'
              )
            "
          >
            ✕
          </button>

        </div>

      `).join("")}

    </div>
  `;
}




//==============================
//本詳細に関連本の追加処理
//==============================
function addSeriesToBook(
  id,
  listId,
  searchId,
  suggestId
){

  if(
    editingBookSeriesIds.includes(
      String(id)
    )
  ){
    return;
  }
  editingBookSeriesIds.push(
    String(id)
  );

  renderBookEditSeries(listId);

  renderBookSeriesSuggest(
    searchId,
    suggestId
  );
}


//==============================
//本詳細の関連削除（シリーズ）
//==============================
function removeSeriesFromBook(
  id,
  searchId,
  suggestId,
  listId
){

if(!confirm("削除しますか？")){
  return;
}

  editingBookSeriesIds =
    editingBookSeriesIds.filter(
      sId => String(sId) !== String(id)
    );

  renderBookEditSeries(
    searchId,
    suggestId,
    listId
    );

}





//==============================
//本の複製
//==============================
async function duplicateBook(id){

  const book =
    books.find(b => String(b.id) === String(id));

  if(!book) return;

  const today =
    new Date().toISOString().slice(0, 10);
    
  const originalReadDates =
    book.readDates || [];

  const newReadDates =
    originalReadDates.length
      ? [today]
      : [];
   
   const isRead =
    (book.readDates || []).length > 0;

  const newBook = {
    ...book,

    id: Date.now().toString(),

    title:
      incrementVolumeTitle(book.title || ""),
    
    subtitle: "",
      
    volume:
      Number(book.volume || 0) + 1,

    memo: "",

    type: book.type,

    readDates:
      (book.readDates || []).length
        ? [today]
        : [],

    tagIds:
      [...(book.tagIds || [])],

    seriesIds:
      [...(book.seriesIds || [])]
  };

  books.unshift(newBook);

  seriesMaster.forEach(series=>{

    const shouldHaveSeries =
      (newBook.seriesIds || [])
        .map(String)
        .includes(String(series.id));

    if(shouldHaveSeries){

      if(
        !(series.bookIds || [])
          .map(String)
          .includes(String(newBook.id))
      ){
        series.bookIds =
          (series.bookIds || [])
            .concat(String(newBook.id));
      }
    }
  });

  await saveData();

  closeModal("open-book-modal");

  renderHome();

if(openAfterDuplicate){
  openBookDetailModal(newBook);
}

showToast(
  `「${newBook.title}」を追加しました`
);
}

//最後をこう↓すると、追加した後に新規本の詳細を開ける
//renderHome();
//openBookDetailModal(newBook);


//==============================
//本の複製時巻数＋1
//==============================
function incrementVolumeTitle(title){

  return title.replace(
    /(\d+)(?!.*\d)/,
    n => String(Number(n) + 1)
  );
}


//==============================
//本詳細を開くやつ
//==============================
function openBookDetailModalById(id){

  const book =
    books.find(
      b => String(b.id) === String(id)
    );

  if(!book) return;

  openBookDetailModal(book);
}


//==============================
//本生成の関数====
//==============================
function createBookSpine(b, mode="main"){
  const d = document.createElement('div');

  const spineTitleText =
  [
    b.title,
    b.subtitle
  ]
    .filter(Boolean)
    .join(" ");

const base = 20;
const extra =
  Math.min(spineTitleText.length * 2, 55);
  
  d.className = "spine";
  d.style.width = (base + extra + 4) + "px";
  
  applySpineColor(d, b);

  if(b.type === "wish"){
  d.classList.add("wish-book");
}

  const titleText =
  [
    b.title,
    b.subtitle
  ]
    .filter(Boolean)
    .join(" ");

const title = document.createElement('div');
title.textContent = spineTitleText;
title.className = "spine-title";
  
  
  const fav =
  document.createElement('div');

const volume =
  b.volume ? String(b.volume) : "";

fav.className =
  "spine-fav";

fav.textContent =
  volume;
  
  
  
  if(b.reread){
  
    const mark =
      document.createElement("div");
      
    mark.className = "bookmark";
    
    d.appendChild(mark);
  
  }
  

  d.appendChild(title);
  d.appendChild(fav);

  d.onclick = ()=> openBookDetailModal(b);

  return d;
}


//==============================
//====評価ボタン1つで切替え
//==============================
function cycleFav(id){

  const book =
    books.find(b=>String(b.id)===String(id));

  if(!book) return;

  book.fav = (book.fav + 1) % 5;

  saveData();

  closeModal("open-book-modal");

  openBookDetailModal(book);

  renderHome();
}



//==============================
//タグの選択切替え
//==============================
function toggleBookTag(bookId, tagId){

	const book =
		books.find(b=>String(b.id)===String(bookId));

	if(!book) return;

	if(!Array.isArray(book.tagIds)){

		book.tagIds = [];

	}

	if(book.tagIds.includes(tagId)){

		book.tagIds =
			book.tagIds.filter(id=>id!==tagId);

	}else{

		book.tagIds.push(tagId);

	}
	
	closeModal("open-book-modal");
	openBookDetailModal(book);

}


//==============================
//本のソートここから
//==============================
function sortBooks(list){

  const arr = [...list];

  if(sortMode === "title-asc"){
    arr.sort((a,b)=>
      (a.title || "")
      .localeCompare(b.title || "","ja")
    );
  }
  
  if(sortMode === "title-desc"){
    arr.sort((a,b)=>
      (b.title || "")
      .localeCompare(a.title || "", "ja")
    );
  }

  if(sortMode === "rating-desc"){

    arr.sort((a,b)=>
      Number(b.fav || 0) - Number(a.fav || 0)
    );
  }
  
  if(sortMode === "rating-asc"){
    arr.sort((a,b)=>
      Number(a.fav || 0) - Number(b.fav || 0)
    );
  }

  if(sortMode === "read-asc"){

    arr.sort((a,b)=>
      toDateNum(a) - toDateNum(b)
      );
  }

  if(sortMode === "read-desc"){

    arr.sort((a,b)=>
      toDateNum(b) - toDateNum(a)
    );
  }

  return arr;
}


//==============================
//========タイプフィルター（ウィッシュリスト）
//==============================
function filterBooks(list){

  if(!list) return [];

  let arr = [...list];

  if(typeFilter !== "all"){

    arr = arr.filter(book => {

      if(typeFilter === "normal"){
        return book.type !== "wish";
      }

      if(typeFilter === "wish"){
        return book.type === "wish";
      }

      return true;
    });
  }

  return arr;
}

//==============================
//====日付の空白安全対策
//==============================
function toDateNum(book){

  const d = getLatestReadDate(book);

  return d
    ? new Date(d).getTime()
    : 0;
}

//==============================
//======本の一覧だけ表示させる役
//==============================
function renderBookList(){

  const main = document.getElementById("home-main");
  if(!main) return;

  main.innerHTML = "";

 const keyword =
  (searchKeyword || "").trim().toLowerCase();

const filteredBooks = books.filter(b => {

  const bookSearchText =
  [
    b.title,
    b.subtitle
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const matchSearch =
  !keyword
  ||
  bookSearchText.includes(keyword);

  const matchType =
    typeFilter === "all"
    ||
    b.type === typeFilter;

  return (
    shouldShowItem(b)
    &&
    matchSearch
    &&
    matchType
  );
});

  const sorted = sortBooks(filteredBooks);

  main.classList.remove(
  "card-view",
  "list-view",
  "shelf-view"
);

  if(viewMode === "card"){
    renderCardView(main, sorted);
    main.classList.add("card-view");
  }

  if(viewMode === "list"){
    renderListView(main, sorted);
    main.classList.add("list-view");
  }

  if(viewMode === "shelf"){
    renderShelfView(main, sorted);
    main.classList.add("shelf-view");
  }
}
//==============================
//====カードビューモード
//==============================
function renderCardView(main, books){

  main.classList.remove(
  "card-view",
  "list-view",
  "shelf-view"
);

main.classList.add("card-view");

  books.forEach(b=>{

    const d =
      document.createElement("div");

    d.className =
      "card honlist";

    // タグ取得
    const tags = (b.tagIds || [])
      .map(tagId => {

        const tag = tagMaster.find(
          t =>
            String(t.id)
            === String(tagId)
        );

        return tag?.name || "";

      })
      .filter(Boolean);

    // 関連シリーズ取得
    const relatedSeries =
      seriesMaster.filter(s =>

        (s.bookIds || [])
          .map(String)
          .includes(String(b.id))

      );

    d.innerHTML = `

      <div class="title">
  ${b.title}

${
  b.subtitle
    ? `
      <span class="book-subtitle">
        ${b.subtitle}
      </span>
    `
    : ""
}
  ${
    b.volume
      ? `<span class="book-volume-label">${b.volume}巻</span>`
      : ""
  }
</div>

      <div class="card-sub-row">

        <div class="book-latest-date">
          ${getLatestReadDate(b) || "未読"}
        </div>

        <div class="fav">
          ${getFavLabel(b.fav)}
        </div>

        <div class="book-read-count">
          ${b.readDates?.length || 0}回
        </div>

      </div>

      ${
        tags.length
          ? `
            <div class="card-tags">

  ${tags.map(tagName=>{

    const tag = tagMaster.find(
      t => t.name === tagName
    );

    return `
      <span
        class="card-tag"
        style="
          color:${tag?.color || "#999"};
        "
      >
        #${tagName}
      </span>
    `;

  }).join("")}

</div>
          `
          : ""
      }

      ${
        relatedSeries.length
          ? `
            <div class="card-series">
              ${relatedSeries
                .map(s => s.name)
                .join(" / ")
              }
            </div>
          `
          : ""
      }

    `;

    d.onclick =
      ()=> openBookDetailModal(b);

    main.appendChild(d);

  });
}

//==============================
//====リストビューモード
//==============================
function renderListView(main, books){

  main.classList.remove(
  "card-view",
  "list-view",
  "shelf-view"
);

main.classList.add("list-view");

  books.forEach(b=>{

    const row =
      document.createElement("div");

    row.className =
      "list-row";

    const latestDate =
      getLatestReadDate(b) || "未読";

    const readCount =
      b.readDates?.length || 0;

   row.innerHTML = `
   
<div class="list-title">
  ${b.title}
  ${
  b.subtitle
    ? `
      <span class="book-subtitle">
        ${b.subtitle}
      </span>
    `
    : ""
}
  ${
    b.volume
      ? ` ${b.volume}`
      : ""
  }
</div>

  <div class="list-meta">

    <span class="list-date">
      ${latestDate}
    </span>

  </div>

  <div class="list-count-watermark">
    ${readCount}読
  </div>
`;

    row.onclick =
      ()=> openBookDetailModal(b);

    main.appendChild(row);
  });
}


//==============================
//====背表紙ビューモード❤️
//==============================
function renderShelfView(main, list){

  const shelf = document.createElement("div");
  shelf.className = "shelf-view";

  list.forEach(b=>{
    const spine = createBookSpine(b);
    spine.onclick = () => openBookDetailModal(b);
    shelf.appendChild(spine);
  });

  main.appendChild(shelf);
}


//==============================
//本棚背表紙モード
//==============================
function renderShelf(el, list, mode = "main"){
  el.innerHTML = "";

  const wrap =
  document.createElement("div");

wrap.className =
  "shelf-wrap";

  list.forEach(b=>{
    const spine = createBookSpine(b, mode);
    wrap.appendChild(spine);
  });

  el.appendChild(wrap);
}




//==============================
//====新規本のタグ切替え
//==============================
function toggleNewBookTag(tagId, el, color){

  if(newBookTagIds.includes(tagId)){

    newBookTagIds =
      newBookTagIds.filter(id=>id!==tagId);

    el.classList.remove("active");
    
    el.style.background = "#fffffc";
    el.style.color = color;

  }else{

    newBookTagIds.push(tagId);

    el.classList.add("active");
    
    el.style.background = color;
    el.style.color = "#fffffc";

  }

}





//==============================
//新規本用の評価切り替えボタン
//==============================
function cycleNewBookFav(){

  newBookFav =
    (newBookFav + 1) % 5;

  document.getElementById(
    "new-book-fav-btn"
  ).textContent =
    "評価：" +
    ["0","★","★★","★★★","👑"]
      [newBookFav];
}





//==============================
//====読了日のトグル表示（モーダル）※削除候補
//==============================
function toggleDateHistory(bookId, head){

  detailSections.readHistory =
    !detailSections.readHistory;

  const body =
    document.getElementById(
      `date-history-${bookId}`
    );

  if(!body) return;

  body.style.display =
    detailSections.readHistory
      ? "grid"
      : "none";

  if(head){
    head.textContent =
      detailSections.readHistory
        ? head.dataset.open
        : head.dataset.close;
  }
}




//==============================
//====本棚のビューモード切替え(いずれ削除20260520
//==============================
function changeViewMode(mode){

  viewMode = mode;

  localStorage.setItem("viewMode", viewMode);

  renderHome(); // ★これ一本化
}


