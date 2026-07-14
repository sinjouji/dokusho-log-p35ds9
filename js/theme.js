//theme.js 私用
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



