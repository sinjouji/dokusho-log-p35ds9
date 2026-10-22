//theme.js ★共通化済
//★テーマ：yuusuzumi統一中
//
//私用 ：共通化OK（未
//※ 初期テーマをどうするか？：現（夕涼み）
//コンセプトカラーいっぱい置きたいです


function applyTheme(theme){

  document.documentElement.setAttribute(
    "data-theme",
    theme
  );

  localStorage.setItem(
    "selectedTheme",
    theme
  );

  if(typeof renderHome==="function"){
    renderHome();
  }

  if(typeof renderStats==="function"){
    renderStats();
  }

}





function loadTheme(){

  const saved =
    localStorage.getItem(
      "selectedTheme"
    ) || "yuusuzumi";

  applyTheme(saved);

}

document.addEventListener("DOMContentLoaded",()=>{
  loadTheme();
});



