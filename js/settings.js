//==============================
//
// SETTINGS.JS
// 設定ページ！
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
    <button onclick="go('home')" class="common-button">← 戻る</button>
    <h2>設定</h2>

  <div class="setting-card">
    <div class="setting-card-title" onclick="toggleSettingSection('home')">
    ${settingSections.home
    ? "▽"
    : "▶︎"}
    表示設定</div>
    
    ${settingSections.home
    ? `
    
     <!--デイリーログ日付-->
    <div class="setting-row">
      <span>今日の日付</span>
      <button onclick="toggleEnableDate()">
        ${enableDate ? "表示：ON" : "表示：OFF"}
      </button>
    </div>
    
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
    <div class="setting-note">
  データをJSON形式で保存します。<br>
  バックアップや、別の端末への移行に利用できます。
  </div>
  <button onclick="exportJsonData()">
    書き出し
  </button>
</div>

<!--インポートマージ-->
    <div class="setting-row">
  <span>JSONインポート（差分追加）</span>
    <div class="setting-note">
  JSONデータを読み込みます。<br>
  既存データは更新し、新しいデータは追加します。<br>
  <b>既存データは削除されません。<br>
  ※同じ本のセリフ（引用）は、本データと一緒に更新されます。<br>
  別端末で追加したセリフは自動で統合されません。</b>
  </div>
  <button
  onclick="
    document.getElementById(
      'merge-json-file'
    ).click();
  "
>
    ➕ 差分追加
  </button>
<input
  id="merge-json-file"
  type="file"
  accept="application/json"
  style="display:none"
  onchange="mergeJsonData(this)"
>
</div>

    <!--インポート：上書き-->
    <div class="setting-row">
  <span>JSONインポート（上書き）⚠️</span>
  
<div class="setting-note">
現在のデータを、読み込んだJSONデータで置き換えます。<br>
<b>JSONに含まれないデータは削除されます。</b><br>
<br>
実行前に「書き出し」でバックアップするか、<br>
「差分追加」の利用をおすすめします。
</div>

  <button
  onclick="
    document.getElementById(
      'import-json-file'
    ).click();
  "
>
  ⚠️ 上書き
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




const themeSelect =
  document.getElementById(
    "theme-select"
  );

if(themeSelect){

  themeSelect.value =
    localStorage.getItem(
      "selectedTheme"
    ) || "yuusuzumi";

}


}



//==============================
//=今日の日付のオンオフ切替
//==============================
function toggleEnableDate(){

  enableDate = !enableDate;

  localStorage.setItem(
    "enableDate",
    enableDate
  );

  renderSettings();
  renderHome();

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
// JSON上書きインポート
//==============================
function importJsonData(input){

  const file =
    input.files?.[0];

  if(!file) return;

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
        showResultDialog({
          title:"読み込みエラー",
          message:"JSONの形式が違うため、インポートできません。"
        });
        return;
      }
      
    showConfirmDialog({

  title:"JSONインポート【上書き】",

  message:`
現在のデータを読み込んだJSONで置き換えます。<br><br>

<b>JSONに存在しないデータは削除されます。</b>
`,

  okText:"上書き",

  cancelText:"キャンセル",

  onOk: async ()=>{

    books = data.books;
    characters = data.characters;
    tagMaster = data.tagMaster;
    seriesMaster = data.seriesMaster;

    await saveData();

    showResultDialog({

  title:"インポート完了",

  message:"JSONの読み込みが完了しました。",

  onOk:()=>{
    input.value = "";
    location.reload();
  }
  });
  }
});
    }catch(err){

      console.error(err);

      showResultDialog({
        title:"読み込みエラー",
        message:"JSONの形式が違うため、インポートできません。"
      });

    }

  };

  reader.readAsText(file);

}



//==============================
// JSONマージインポート
//==============================
function mergeJsonData(input){

  const file =
    input.files?.[0];

  if(!file) return;

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
        showResultDialog({
          title:"読み込みエラー",
          message:"JSONの形式が違うため、インポートできません。"
        });
        return;
      }
      
    showConfirmDialog({

  title:"JSONインポート【差分追加】",

  message:`
JSONデータを差分追加します。<br><br>

既存データは更新し、新しいデータは追加されます。<br>

<b>既存データは削除されません。</b>
`,

  okText:"差分追加",

  cancelText:"キャンセル",

  onOk: async ()=>{

    let bookUpdated = 0;
    let bookAdded = 0;

    let characterUpdated = 0;
    let characterAdded = 0;

    let seriesUpdated = 0;
    let seriesAdded = 0;

    let tagUpdated = 0;
    let tagAdded = 0;
    
    let result = mergeById(books, data.books);

books = result.array;

bookUpdated = result.updated;
bookAdded = result.added;

//人物カウント
result = mergeById(
  characters,
  data.characters
);

characters = result.array;

characterUpdated = result.updated;
characterAdded = result.added;

//シリーズカウント
result = mergeById(
  seriesMaster,
  data.seriesMaster
);

seriesMaster = result.array;

seriesUpdated = result.updated;
seriesAdded = result.added;

//タグカウント
result = mergeById(
  tagMaster,
  data.tagMaster
);

tagMaster = result.array;

tagUpdated = result.updated;
tagAdded = result.added;

    await saveData();

    showResultDialog({

  title:"インポート完了",

  message:`
JSONの読み込みが完了しました。<br><br>

📚 本<br>
  更新：${bookUpdated}件<br>
  追加：${bookAdded}件<br><br>

👤 人物<br>
  更新：${characterUpdated}件<br>
  追加：${characterAdded}件<br><br>

📖 シリーズ<br>
  更新：${seriesUpdated}件<br>
  追加：${seriesAdded}件<br><br>

🏷️ タグ<br>
  更新：${tagUpdated}件<br>
  追加：${tagAdded}件
`,

  onOk:()=>{
    input.value = "";
    location.reload();
  }
  });
  }
});
    }catch(err){

      console.error(err);

      showResultDialog({
        title:"読み込みエラー",
        message:"JSONの形式が違うため、インポートできません。"
      });

    }

  };

  reader.readAsText(file);

}

