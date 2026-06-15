//==============================
//
// SETTINGS.JS
// 設定ページ
//
//==============================





//==============================
//🔧====設定ページ====
//==============================
function renderSettings(){

setActiveMenu("menu-settings");

  const el = document.getElementById("page-settings");
  if(!el) return;
  
 
  
  el.innerHTML = `
    <button onclick="go('home')">← 戻る</button>
    <h2>設定</h2>

  <div class="setting-card">
    <div class="setting-card-title" onclick="toggleSettingSection('home')">
    ${settingSections.home
    ? "▽"
    : "▶︎"}
    表示設定</div>
    
    ${settingSections.home
    ? `
    <!--背表紙-->
    <div class="setting-row">
      <span>背表紙カラー</span>
      <button onclick="changeShelfColorMode()">
        背表紙カラー：${getShelfColorModeLabel()}
      </button>
    </div>
    
    <!--並び順-->
    <div class="setting-row">
      <span>並び順</span>
      <button onclick="changeDefaultSort()">
        ${getSortModeLabel()}
      </button>
    </div>
    
    <!--表示タイプ-->
    <div class="setting-row">
      <span>表示タイプ</span>
      <button onclick="changeDefaultType()">
        ${getTypeModeLabel()}
      </button>
    </div>

      <!--引用モーダル初期表示-->
    <div class="setting-row">
  <span>引用表示</span>
  <button onclick="changeQuoteViewMode()">
    ${getQuoteViewModeLabel()}
  </button>
</div>
    
      <div class="setting-row">

  <span>
    シリーズ一覧
  </span>

  <button
    onclick="
      cycleSeriesViewMode()
    "
  >
    ${getSeriesViewModeLabel()}
  </button>

</div>
    
    
`
: ""}
  </div>
  
  
  <div class="setting-card">
    <div class="setting-card-title"onclick="toggleSettingSection('input')">
    ${settingSections.input
    ? "▽"
    : "▶︎"}入力設定</div>
      ${settingSections.input
    ? `
    <!--メモエリア-->
    <div class="setting-row">
      <span>メモエリア</span>
      <button onclick="toggleMemo()">
        ${
          enableMemo
            ? "📝 メモ表示：ON"
            : "📝 メモ表示：OFF"
          }
        </button>
      </div>
      
     <!--年間目標-->
    <div class="setting-row">
      <span>年間目標</span>
      <div class="switch ${enableGoal ? "on" : ""}"             
        onclick="toggleGoal(event)"></div>
      <div class="settings-item">
        目標冊数
        <input class="input-common input-small"
          type="number" 
          value="${yearlyGoal}" 
          min="1"
          onchange="changeGoal(this.value)">
       </div>
    </div>  
`
: ""}
  </div>


  <div class="setting-card">
    <div class="setting-card-title"onclick="toggleSettingSection('datas')">
    ${settingSections.datas
    ? "▽"
    : "▶︎"}データ</div>
    
      ${settingSections.datas
    ? `
    <!--エクスポート-->
    <div class="setting-row">
  <span>JSONエクスポート</span>
  <button onclick="exportJsonData()">
    書き出し
  </button>
</div>

    <!--インポートー-->
    <div class="setting-row">
  <span>JSONインポート</span>

  <button
  onclick="
    document.getElementById(
      'import-json-file'
    ).click();
  "
>
  読み込み
</button>

<input
  id="import-json-file"
  type="file"
  accept="application/json"
  style="display:none"
  onchange="importJsonData(this)"
>
</div>

`
: ""}
  </div>


  `;  
}



//==============================
//====年間目標のオンオフ切替
//==============================
function toggleGoal(e){
  e.stopPropagation();

  enableGoal = !enableGoal;
  localStorage.setItem("enableGoal", enableGoal);

  renderSettings();
  renderHome(); // 即反映
}


//==============================
//====デフォルト並び順切り替え
//==============================
const sortModes = [
  "read-desc",
  "read-asc",
  "title-asc",
  "title-desc",
  "rating-desc",
  "rating-asc"
];

function changeDefaultSort(){
  sortMode =
    cycleSetting({
      current:
        sortMode,
      
      list:
        sortModes
     });
     
   localStorage.setItem(
     "sortMode",
     sortMode
   );
   
   renderSettings();
   renderHome();
}

//==============================
//====デフォルト表示タイプ切り替え
//==============================
const typeModes = [
  "all",
  "normal",
  "wish"
];

function changeDefaultType(){
  typeFilter =
    cycleSetting({
      current:
        typeFilter,
      list:
        typeModes
      });
    localStorage.setItem(
      "typeFilter",
      typeFilter
    );
    
    renderSettings();
    renderHome();
}

//==============================
//====セッティングの汎用切り替えボタン
//==============================
function cycleSetting({

  current,
  list

}){

  const index =
    list.indexOf(current);

  const next =
    (index + 1) % list.length;

  return list[next];
}


//==============================
//====設定ページエリアトグル開閉設定
//==============================
function toggleSettingSection(key){

  settingSections[key] =
    !settingSections[key];

  localStorage.setItem(

    "settingSections",

    JSON.stringify(
      settingSections
    )
  );

  renderSettings();
}


//==============================
//====設定用：背表紙カラー
//==============================
function getShelfColorModeLabel(){

  if(
    colorMode === "single"
  ){
    return "単色";
  }

  if(
    colorMode === "gradient"
  ){
    return "グラデ";
  }

  if(
    colorMode === "stripe"
  ){
    return "目印";
  }

  return "";
}

//==============================
//====設定用：並び順
//==============================
function getSortModeLabel(){

  if(
    sortMode === "read-desc"
  ){
    return "最新読了順";
  }

  if(
    sortMode === "read-asc"
  ){
    return "最古読了順";
  }

  if(
    sortMode === "title-asc"
  ){
    return "名前↑";
  }
  
    if(
    sortMode === "title-desc"
  ){
    return "名前↓";
  }
  
    if(
    sortMode === "rating-desc"
  ){
    return "高評価";
  }
  
    if(
    sortMode === "rating-asc"
  ){
    return "低評価";
  }

  return "";
}

//==============================
//====設定用：表示タイプ
//==============================
function getTypeModeLabel(){
    if(
    typeFilter === "all"
  ){
    return "全部";
  }
  
      if(
    typeFilter === "normal"
  ){
    return "本棚";
  }

    if(
    typeFilter === "wish"
  ){
    return "ウィッシュリスト";
  }
  return "";
}

//==============================
//====メモのオンオフ
//==============================
function toggleMemo(){

  enableMemo = !enableMemo;

  localStorage.setItem(
    "enableMemo",
    enableMemo
  );

  renderSettings();
  renderHome();
}

//==============================
//====年間目標数の変更
//==============================
function changeGoal(val){
  yearlyGoal = Number(val) || 0;
  localStorage.setItem("yearlyGoal", yearlyGoal);

  renderHome(); // 即反映
}


//==============================
//====背表紙カラー切り替え
//==============================
const shelfColorModes = [
  "single",
  "gradient",
  "stripe"
];

function changeShelfColorMode(){

  colorMode =
    cycleSetting({

      current:
        colorMode,

      list:
        shelfColorModes

    });

  localStorage.setItem(
    "colorMode",
    colorMode
  );

  renderSettings();
  renderHome();
}

//==============================
//背表紙カラーモード変更描画
//==============================
function renderColorMode(targetId = "color-mode"){
  const el = document.getElementById(targetId);
  if(!el) return;

  el.innerHTML = "";

  const modes = [
    { id: "single", label: "単色" },
    { id: "gradient", label: "グラデ" },
    { id: "stripe", label: "目印" }
  ];

  modes.forEach(m=>{
    const btn = document.createElement('button');
    btn.textContent = m.label;
    btn.className = "setting-btn";

    if(m.id === colorMode){
      btn.classList.add("active");
    }

    btn.onclick = ()=>{
      colorMode = m.id;
      localStorage.setItem("colorMode", colorMode);

      renderHome();              // 
  //    renderColorMode(targetId);
    };

    el.appendChild(btn);
  });
}





//==============================
//===旧?viewmode
//==============================
function renderViewMode(targetId = "view-mode"){
  const el = document.getElementById(targetId);
  if(!el) return;

  el.innerHTML = "";

  const modes = [
    { id: "card", label: "カード" },
    { id: "list", label: "リスト（２列）"},
    { id: "shelf", label: "本棚" },
    { id: "shelf-series", label: "シリーズ" }
  ];

  modes.forEach(m=>{
    const btn = document.createElement('button');
    btn.textContent = m.label;
    btn.className = "setting-btn";

    if(m.id === viewMode){
      btn.classList.add("active");
    }

    btn.onclick = ()=>{
      viewMode = m.id;
      localStorage.setItem("viewMode", viewMode);

      renderHome();                 // これ必須
   //   renderViewMode(targetId);     // 見た目更新
    };

    el.appendChild(btn);
  });
}


//==============================
// 引用表示モーダル初期表示
//==============================
function changeQuoteViewMode(){

  quoteViewMode =
    quoteViewMode === "vertical"
      ? "horizontal"
      : "vertical";

  localStorage.setItem(
    "quoteViewMode",
    quoteViewMode
  );

  renderSettings();
}

//==============================
// 引用表示モーダル初期表示ラベル
//==============================
function getQuoteViewModeLabel(){

  return quoteViewMode === "vertical"
    ? "縦書き"
    : "横書き";
}



//==============================
// シリーズ一覧初期表示ラベル
// ※changeSeriesViewMode は series.js
//==============================
function getSeriesViewModeLabel(){

  switch(seriesViewMode){

    case "card":
      return "カード";

    case "compact":
      return "リスト";

    case "spine":
      return "背表紙";

    default:
      return "カード";

  }

}
//==============================
// シリーズ一覧初期表示ラベル切替トグル
//==============================
function cycleSeriesViewMode(){

  if(seriesViewMode === "card"){

    changeSeriesViewMode(
      "compact"
    );

  }else if(
    seriesViewMode === "compact"
  ){

    changeSeriesViewMode(
      "spine"
    );

  }else{

    changeSeriesViewMode(
      "card"
    );

  }

  renderSettings();

}


//==============================
// JSONエクスポート
//==============================
function exportJsonData(){

  const data = {
    books,
    characters,
    tagMaster,
    seriesMaster
  };

  const blob =
    new Blob(
      [JSON.stringify(data, null, 2)],
      { type:"application/json" }
    );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    `book-log-backup-${new Date()
      .toISOString()
      .slice(0,10)}.json`;

  a.click();

  URL.revokeObjectURL(url);
}


//==============================
// JSONインポート
//==============================
function importJsonData(input){

  const file =
    input.files?.[0];

  if(!file) return;

  if(
    !confirm(
      "現在のデータを上書きします。\n続行しますか？"
    )
  ){
    input.value = "";
    return;
  }

  const reader =
    new FileReader();

  reader.onload = async e => {

    try{

      const data =
        JSON.parse(e.target.result);

      if(
        !Array.isArray(data.books) ||
        !Array.isArray(data.characters) ||
        !Array.isArray(data.tagMaster) ||
        !Array.isArray(data.seriesMaster)
      ){
        alert(
          "JSONの形式が違うため、インポートできません。"
        );
        return;
      }

      books = data.books;
      characters = data.characters;
      tagMaster = data.tagMaster;
      seriesMaster = data.seriesMaster;

      await saveData();

      alert(
        "インポートが完了しました。"
      );

      location.reload();

    }catch(err){

      console.error(err);

      alert(
        "読み込みに失敗しました。\nJSONファイルを確認してください。"
      );

    }

  };

  reader.readAsText(file);

}
