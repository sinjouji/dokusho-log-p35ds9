//==============================
//
// COMMON.JS
//  共通で使う関数
//
//==============================




//==============================
// 巻数取得（半角・全角対応）
//==============================
function getVolumeNumber(book){

  return Number(
    String(book.volume || "")
      .replace(/[０-９]/g, c =>
        String.fromCharCode(
          c.charCodeAt(0) - 0xFEE0
        )
      )
  ) || 999999;

}



//==============================
// マージ確認用
//==============================
function mergeById(currentArray, importedArray){

  const map = new Map();

  currentArray.forEach(item=>{
    map.set(String(item.id), item);
  });

  let updated = 0;
  let added = 0;

  importedArray.forEach(item=>{

    const id = String(item.id);

    if(map.has(id)){

      map.set(id, item);
      updated++;

    }else{

      map.set(id, item);
      added++;

    }

  });

  return {

    array: [...map.values()],

    updated,

    added

  };

}

