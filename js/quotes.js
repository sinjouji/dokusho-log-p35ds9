//
// QUOTES.JS
// 引用
//





function renderQuotes(){

  setActiveMenu("menu-quotes");

  safeRender({
    mountId:"page-quotes",
    html:`
      <h2>📖 引用一覧</h2>

      <div class="quote-page-tools">
        <input
          class="input-common input-small"
          id="quote-search"
          placeholder="引用・メモを検索"
        >

        <select
          class="select-chip"
          id="quote-sort"
        >
          <option value="created-desc">新しい順</option>
          <option value="created-asc">古い順</option>
          <option value="book-asc">本タイトル昇順</option>
          <option value="book-desc">本タイトル降順</option>
        </select>
      </div>

      <div id="quote-list-page"></div>
    `
  });
}

//==============================
// 引用メモ追加
//==============================
function addQuoteToBook(bookId){

  const book =
    books.find(b =>
      String(b.id) === String(bookId)
    );

  if(!book) return;

  if(!Array.isArray(book.quotes)){
    book.quotes = [];
  }

  const text =
    document
      .getElementById(`quote-text-${bookId}`)
      ?.value
      .trim() || "";

  const memo =
    document
      .getElementById(`quote-memo-${bookId}`)
      ?.value
      .trim() || "";

  if(!text) return;

  book.quotes.unshift({
    id: "q" + Date.now().toString(),
    text,
    memo,
    favorite:false,
    createdAt:new Date().toISOString()
  });

  saveData();

  closeModal("open-book-modal");
  openBookDetailModal(book);
}

//==============================
// 引用メモお気に入り切替え
//==============================
function toggleQuoteFavorite(bookId, quoteId){

  const body =
    document.querySelector(".detail-modal-body");

  const scrollTop =
    body ? body.scrollTop : 0;

  const book =
    books.find(b =>
      String(b.id) === String(bookId)
    );

  if(!book) return;

  const quote =
    book.quotes.find(q =>
      String(q.id) === String(quoteId)
    );

  if(!quote) return;

  quote.favorite = !quote.favorite;

  saveData();

  closeModal("open-book-modal");
  openBookDetailModal(book);

  setTimeout(()=>{

    const newBody =
      document.querySelector(".detail-modal-body");

    if(newBody){
      newBody.scrollTop = scrollTop;
    }

  }, 0);
}



//==============================
// 引用メモ削除
//==============================
function deleteQuoteFromBook(bookId, quoteId){

  const book =
    books.find(b =>
      String(b.id) === String(bookId)
    );

  if(!book || !Array.isArray(book.quotes)) return;

  book.quotes =
    book.quotes.filter(q =>
      String(q.id) !== String(quoteId)
    );

  saveData();

  closeModal("open-book-modal");
  openBookDetailModal(book);
}