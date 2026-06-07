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
//新規本を追加保存================
//=============================
async function saveNewBook(){

  const title =
    document.getElementById("add-title").value.trim();

  if(!title){
    alert("タイトルが未入力です");
    return;
  }

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
    books.find(b =>
      String(b.id) === String(id)
    );

  if(!book) return;

  openBookDetailModal(book);
}
