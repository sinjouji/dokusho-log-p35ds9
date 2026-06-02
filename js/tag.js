//
// TAG.JS
//
// 非表示タグとか入れていくよ〜〜〜




//==============================
//非表示タグ
//==============================
function isHiddenTag(tagId){

  const tag =
    tags.find(t =>
      String(t.id) === String(tagId)
    );

  return !!tag?.hidden;
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


