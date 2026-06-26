//theme.js
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

}

function loadTheme(){

  const saved =
    localStorage.getItem(
      "selectedTheme"
    ) || "ajisai";

  applyTheme(saved);

}





