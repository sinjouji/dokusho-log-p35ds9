//
// QUOTES.JS
// 引用
//

let quotePage = {

  keyword:"",
  sort:"created-desc",
  favoriteOnly:false

};



function renderQuotes(){

  setActiveMenu("menu-quotes");

  safeRender({
    mountId:"page-quotes",
    html:`
      <h2>📖 引用一覧</h2>

      <div class="quote-page-tools">
        <input
  class="input-common input-small white-input"
  id="quote-search"
  placeholder="引用・メモを検索"
  value="${quotePage.keyword}"
  oninput="
    quotePage.keyword = this.value;
    renderQuotes();
  "
>

        <select
  class="select-chip"
  id="quote-sort"

  onchange="
    quotePage.sort=this.value;
    renderQuotes();
  "
>
          <option
  value="created-desc"
  ${
    quotePage.sort === "created-desc"
      ? "selected"
      : ""
  }
>
  新しい順
</option>
          <option value="created-asc"
          ${
            quotePage.sort === "created-asc"
              ? "selected"
              : ""
          }
          >古い順</option>
          <option value="book-asc"
          ${
            quotePage.sort === "book-asc"
              ? "selected"
              : ""
          }
          >本タイトル昇順</option>
          <option value="book-desc"
          ${
            quotePage.sort === "book-desc"
              ? "selected"
              : ""
          }
          >本タイトル降順</option>
           <option
  value="favorite-desc"
  ${
    quotePage.sort === "favorite-desc"
      ? "selected"
      : ""
  }
>
  ⭐お気に入り優先
</option>
        </select>
      </div>
      
      <label class="quote-favorite-filter">

  <input
    type="checkbox"

    ${
      quotePage.favoriteOnly
        ? "checked"
        : ""
    }

    onchange="
      quotePage.favoriteOnly =
        this.checked;

      renderQuotes();
    "
  >

  ⭐ お気に入りのみ

</label>
      

      <div id="quote-list-page">
      </div>
    `
  });
  
  const keyword =
  (quotePage.keyword || "")
    .trim()
    .toLowerCase();
  
  
  
const allQuotes =
  getAllQuotes();

const filteredQuotes =
  allQuotes.filter(item=>{

    if(
      quotePage.favoriteOnly &&
      !item.quote.favorite
    ){
      return false;
    }

    if(!keyword){
      return true;
    }

    return [
      item.quote.text,
      item.quote.memo,
      item.bookTitle,
      item.subtitle
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword);

  });

  filteredQuotes.sort((a,b)=>{
 
  switch(quotePage.sort){

    case "created-desc":

      return (
        new Date(
          b.quote.createdAt || 0
        )
        -
        new Date(
          a.quote.createdAt || 0
        )
      );

    case "created-asc":

      return (
        new Date(
          a.quote.createdAt || 0
        )
        -
        new Date(
          b.quote.createdAt || 0
        )
      );

    case "book-asc":

      return (
        a.bookTitle || ""
      ).localeCompare(
        b.bookTitle || "",
        "ja"
      );

    case "book-desc":

      return (
        b.bookTitle || ""
      ).localeCompare(
        a.bookTitle || "",
        "ja"
      );
case "favorite-desc":

  return (
    Number(b.quote.favorite || false)
    -
    Number(a.quote.favorite || false)
  );

    default:

      return 0;

  }

});
  
  document.getElementById(
  "quote-list-page"
).innerHTML =
  filteredQuotes.map(item=>`
    <div
  class="quote-card"
  onclick="
    openQuoteViewModal(
      '${item.bookId}',
      '${item.quote.id}'
    )
  "
>

      <div class="quote-text">
        ${
          item.quote.text.length > 60
            ? item.quote.text.slice(0,60) + "..."
            : item.quote.text
        }
      </div>


      ${
        item.quote.memo
          ? `
            <div class="quote-memo">
              ${item.quote.memo}
            </div>
          `
          : ""
      }
      
      <div class="detail-row">
<button
  class="quote-book-btn right-yose"
  onclick="
    event.stopPropagation();
    openBookDetailModalById(
      '${item.bookId}'
    )
  "
>
  ${item.quote.favorite ? "⭐ " : ""}
  ${item.bookTitle}
  ${item.volume ? ` ${item.volume}巻` : ""}
</button>
<button
  class="quote-edit-btn right-yose"
  onclick="
    event.stopPropagation();
    openQuoteEditModal(
      '${item.bookId}',
      '${item.quote.id}'
    );
  "
>
  ✏️
</button></div>
    </div>
  `).join("");

console.log(filteredQuotes);
}



function getAllQuotes(){

  const result = [];

  books.forEach(book=>{

    (book.quotes || []).forEach(q=>{

      result.push({

        bookId: book.id,

        bookTitle: book.title,

        subtitle: book.subtitle || "",

        volume: book.volume || "",

        quote: q

      });

    });

  });

  return result;
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


//==============================
// 引用メモ編集モーダル
//==============================
function openQuoteEditModal(bookId, quoteId){

  const book =
    books.find(b =>
      String(b.id) === String(bookId)
    );

  if(!book || !Array.isArray(book.quotes)) return;

  const quote =
    book.quotes.find(q =>
      String(q.id) === String(quoteId)
    );

  if(!quote) return;

  const modal =
    document.createElement("div");

  modal.className = "modal-bg";
  modal.id = "quote-edit-modal";

  modal.innerHTML = `
    <div class="modal-box quote-edit-modal">

      <div class="modal-header flex-between">
        <strong>引用メモ編集</strong>

        <button
          class="btn-sub"
          onclick="closeModal('quote-edit-modal')"
        >
          ✖️
        </button>
      </div>

      <div class="modal-scroll-body">

        <textarea
          id="edit-quote-text"
          class="input-common quote-textarea"
          placeholder="引用文"
        >${quote.text || ""}</textarea>

        <input
          id="edit-quote-memo"
          class="input-common"
          placeholder="メモ"
          value="${quote.memo || ""}"
        >

        <label class="check-row">
          <input
            type="checkbox"
            id="edit-quote-favorite"
            ${quote.favorite ? "checked" : ""}
          >
          ⭐ お気に入り
        </label>

      </div>

      <div class="modal-footer">
        <button
          class="btn-main"
          onclick="
            saveQuoteEdit(
              '${bookId}',
              '${quoteId}'
            )
          "
        >
          保存
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(modal);
}



//==============================
// 引用メモ編集保存関数
//==============================
function saveQuoteEdit(bookId, quoteId){

  const book =
    books.find(b =>
      String(b.id) === String(bookId)
    );

  if(!book || !Array.isArray(book.quotes)) return;

  const quote =
    book.quotes.find(q =>
      String(q.id) === String(quoteId)
    );

  if(!quote) return;

  quote.text =
    document
      .getElementById("edit-quote-text")
      ?.value
      .trim() || "";

  quote.memo =
    document
      .getElementById("edit-quote-memo")
      ?.value
      .trim() || "";

  quote.favorite =
    document
      .getElementById("edit-quote-favorite")
      ?.checked || false;

  saveData();

  closeModal("quote-edit-modal");

  if(currentPage === "quotes"){
    renderQuotes();
  }else{
    closeModal("open-book-modal");
    openBookDetailModal(book);
  }
}





