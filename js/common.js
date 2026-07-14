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

  const currentItem = map.get(id);

  if(
  JSON.stringify(normalizeObject(currentItem))
  !==
  JSON.stringify(normalizeObject(item))
){

    map.set(id, item);
    updated++;

  }
  // 同じなら何もしない（スキップ）

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



//==============================
// マージ：データ順がアレなやつ対策
//==============================
function normalizeObject(obj){

  if(Array.isArray(obj)){
    return obj.map(normalizeObject);
  }

  if(obj && typeof obj === "object"){

    return Object.keys(obj)
      .sort()
      .reduce((result,key)=>{

        result[key]=normalizeObject(obj[key]);
        return result;

      },{});

  }

  return obj;

}