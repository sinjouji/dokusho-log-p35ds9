//
// TAG.JS
//
// 非表示タグとか入れていくよ〜〜〜

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
  closeModal("open-book-modal");
  openBookDetailModal(book);
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

  openBookDetailModal(book);
}



//==============================
//非表示タグを本から削除のトグルちゃん
//==============================
function confirmRemoveHiddenTag(bookId, tagId){

  const key =
    `${bookId}-${tagId}`;

  if(pendingHiddenTagRemove === key){

    removeHiddenTag(bookId, tagId);

    pendingHiddenTagRemove = null;

    return;
  }

  pendingHiddenTagRemove = key;

  const book =
    books.find(b =>
      String(b.id) === String(bookId)
    );

  if(book){
    closeModal("open-book-modal");
openBookDetailModal(book);
  }
}