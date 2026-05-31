//
// BOOKS.JS
//
// 本一覧とか、本に関する処理ちゃんたち
//



//==============================
//====最新読了日を取得するやつ
//==============================
function getLatestReadDate(book){

  const dates =

    Array.isArray(book.readDates) &&
    book.readDates.length

      ? book.readDates

      : (book.dates || []);

  return (
    [...dates]
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
//本の複製
//==============================
async function duplicateBook(id){

  const book =
    books.find(b => String(b.id) === String(id));

  if(!book) return;

  const today =
    new Date().toISOString().slice(0, 10);

  const newBook = {
    ...book,

    id: Date.now().toString(),

    title:
      incrementVolumeTitle(book.title || ""),

    memo: "",

    readDates: [today],

    type: "normal",

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




