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






