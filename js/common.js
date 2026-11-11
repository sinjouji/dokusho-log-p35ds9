//==============================
//
// COMMON.JS ★共通化済
//
//差分なし：共通化OK（未
//  共通で使う関数
//
//==============================




//==============================
// 同期モード判定
//==============================
function isSyncMode(){

  return window.syncMode === "sync";

}



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


/*=====
アイコンオシャレに
=====*/
function getBookStatusIcon(type){

  if(type === "wish"){
    return `
      <svg xmlns="http://www.w3.org/2000/svg"
        width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>
        <path d="M8.62 9.8A2.25 2.25 0 1 1 12 6.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z"/>
      </svg>
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg"
      width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round"
      stroke-linejoin="round">
      <path d="M12 12V9a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>
      <path d="M16 20v-3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/>
      <path d="M20 22V2"/>
      <path d="M4 12h16"/>
      <path d="M4 20h16"/>
      <path d="M4 2v20"/>
      <path d="M4 4h16"/>
    </svg>
  `;
}


/*再読アイコン*/
function getRereadIcon(){
  return `
    <svg xmlns="http://www.w3.org/2000/svg"
      width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round"
      stroke-linejoin="round">
      <path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/>
    </svg>
  `;
}

/*保護アイコン*/
function getProtectIcon(){
  return `
    <svg xmlns="http://www.w3.org/2000/svg"
      width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round"
      stroke-linejoin="round">
      <rect class="protect-lock-body"
        width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  `;
}



/*評価アイコン*/
function getFavIcon(fav){

  const star = `
    <svg xmlns="http://www.w3.org/2000/svg"
      width="15" height="15" viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round">
      <path d="M12.983 21.186a1 1 0 0 1-1.966 0 10 10 0 0 0-8.203-8.203 1 1 0 0 1 0-1.966 10 10 0 0 0 8.203-8.203 1 1 0 0 1 1.966 0 10 10 0 0 0 8.203 8.203 1 1 0 0 1 0 1.966 10 10 0 0 0-8.203 8.203"/>
    </svg>
  `;

  const crown = `
    <svg xmlns="http://www.w3.org/2000/svg"
      width="17" height="17" viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round">
      <path
        d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"
        fill="currentColor"/>
      <path d="M5 21h14"/>
    </svg>
  `;

  fav = Number(fav) || 0;

  if(fav === 0) return "0";
  if(fav === 4) return crown;

  return star.repeat(fav);
}




