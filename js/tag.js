//
// TAG.JS
//
// 非表示タグとか入れていくよ〜〜〜




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


