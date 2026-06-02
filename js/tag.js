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


