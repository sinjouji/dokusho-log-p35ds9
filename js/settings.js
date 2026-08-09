//==============================
//
// SETTINGS.JS watashi
// 設定ページ
//
//==============================

//====テキストインポート設定
let textImport = {
  duplicateMode: "new",
  previewBooks: [],
  inputText: "",
  ...JSON.parse(
    localStorage.getItem("textImport") || "{}"
  )
};

textImport.previewBooks = [];
textImport.inputText = "";

//類似本の未登録告知用
let enableSimilarBookNotice =
  localStorage.getItem(
    "enableSimilarBookNotice"
  );

enableSimilarBookNotice =
  enableSimilarBookNotice === null
    ? true
    : enableSimilarBookNotice === "true";



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


  ${renderHomeSettingArea()}
  
  ${renderInputSettingArea()}

  ${renderJsonImportArea()}
  
  ${renderTextImportArea()}
  
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



//=============================
// 表示設定エリア描画
//=============================
function renderHomeSettingArea(){

  return`

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
    
     <!--シリーズ詳細で類似本告知-->
    <div class="setting-row">
      <span>シリーズ名と類似の未登録本を告知</span>
      <button onclick="toggleSimilarBookNotice()">
        ${enableSimilarBookNotice ? "表示：ON" : "表示：OFF"}
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

`;
}


//=============================
// 入力設定エリア描画
//=============================
function renderInputSettingArea(){

  return`

 <div class="setting-card">
    <div class="setting-card-title"onclick="toggleSettingSection('input')">
    ${settingSections.input
    ? "▽"
    : "▶︎"}入力設定</div>
      ${settingSections.input
    ? `
    
    <!--誤削除防止：保護エリア-->
    <div class="setting-row">
      <span>新規データの誤削除防止</span>
      <button onclick="toggleDefaultProtect()">
        ${
          enableProtect
            ? "🔒 保護：ON"
            : "🔓 保護：OFF"
          }
        </button>
      </div>
    
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

`;
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
//====保護のオンオフ
//==============================
function toggleDefaultProtect(){

  enableProtect = !enableProtect;

  localStorage.setItem(
    "enableProtect",
    enableProtect
  );

  renderSettings();
  renderHome();
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


//==============================
// JSONインポート設定
//==============================
function renderJsonImportArea(){

  return`
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
  ▶︎ データをJSON形式で保存します。<br>
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
  ▶︎ JSONデータを読み込みます。<br>
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
▶︎ 現在のデータを、読み込んだJSONデータで置き換えます。<br>
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

}





//==============================
// テキストインポート設定
//==============================
function renderTextImportArea(){

  return `
    <div class="setting-card">

      <div
        class="setting-card-title"
        onclick="toggleSettingSection('textImport')"
      >
        ${
          settingSections.textImport
            ? "▽"
            : "▶︎"
        }
        📥 テキストインポート
      </div>

      ${
        settingSections.textImport
          ? `


            <!--本の追加方法-->
            <div class="setting-row">
  <span>同タイトルの扱い</span>

  <div>
    <label>
      <input
        type="radio"
        name="text-import-duplicate-mode"
        value="new"
        ${
          textImport.duplicateMode === "new"
            ? "checked"
            : ""
        }
        onchange="
          textImport.duplicateMode = this.value;
          saveSettings();
        "
      >
      新規追加
    </label>

    <label>
      <input
        type="radio"
        name="text-import-duplicate-mode"
        value="continue"
        ${
          textImport.duplicateMode === "continue"
            ? "checked"
            : ""
        }
        onchange="
          textImport.duplicateMode = this.value;
          saveSettings();
        "
      >
      続刊追加
    </label>
  </div>
</div>
            

            <!-- 本用 -->
            
            <div class="text-import-books">
              <span>本</span>              
              <textarea
                class="textarea-common text-import-textarea"
              placeholder="本のタイトル/サブタイトル/巻数（1行1冊）"
              >${textImport.inputText || ""}</textarea>
              <button
  onclick="previewTextImport()"
>
  📋 読み込み内容を確認
</button>
            </div>
            
   ${renderImportPreviewArea()}
            
          `
          : ""
      }

    </div>
  `;

}


//=============================
// 確認結果表示エリア
//=============================
function renderImportPreviewArea(){

  return`

${
  textImport.previewBooks.length > 0
    ? `
      <div class="text-import-preview">

        <div class="setting-row">
          <span>
            📚 追加予定（${textImport.previewBooks.length}冊）
          </span>
        </div>

        <div class="text-import-preview-list">
          ${
            textImport.previewBooks
              .map(book => `
                <div class="text-import-preview-item">
                  📖 ${book.title}${
  book.subtitle
    ? ` / ${book.subtitle}`
    : ""
}${
  book.volume
    ? ` / ${book.volume}巻`
    : ""
}
                </div>
              `)
              .join("")
          }
        </div>

        <button
          class="btn-main"
          onclick="executeTextImport()"
        >
          この内容で追加
        </button>

      </div>
    `
    : ""
}
  
  `;

}



//==============================
// テキストインポート保存
//==============================
function saveSettings(){

  localStorage.setItem(
    "textImport",
    JSON.stringify(textImport)
  );

}



//==============================
// テキストインポートプレビュー
//==============================
function previewTextImport(){

  const textarea =
    document.querySelector(
      ".text-import-textarea"
    );

  if(!textarea){
    return;
  }

textImport.inputText =
  textarea.value;


  const lines =
    textarea.value
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

  if(lines.length === 0){

    alert(
      "本のタイトルを入力してください"
    );

    return;
  }

  const results =
  analyzeTextImportTitles(lines);

const candidates =
  buildTextImportCandidates(results);

textImport.previewBooks =
  candidates.map(
    (candidate, index) =>
      createTextImportBook(
        candidate,
        index
      )
  );

renderSettings();

}



//==============================
// テキストインポート判定
//==============================
function analyzeTextImportTitles(lines){
  return lines.map(line => {
    // `/` で分割
    const parts =
      line
        .split("/")
        .map(part => part.trim());
    let title = "";
    let subtitle = "";
    let volume = null;
    // タイトルのみ
    if(parts.length === 1){
      title = parts[0];
    }
    // タイトル / サブタイトル
    else if(parts.length === 2){
      title = parts[0];
      subtitle = parts[1];
    }
    // タイトル / サブタイトル / 巻数
    else {
      title = parts[0];
      subtitle = parts[1];
      const parsedVolume =
        Number(parts[2]);
      if(
        parts[2] !== ""
        && Number.isFinite(parsedVolume)
      ){
        volume = parsedVolume;
      }
    }
    // タイトルが空の場合は除外
    if(!title){
      return null;
    }
    // 既存本をタイトルだけで検索
    const sameTitleBooks =
      books.filter(book =>
        (book.title || "").trim()
          === title
      );
    return {
      title,
      subtitle,
      volume,
      exists:
        sameTitleBooks.length > 0,
      sameTitleBooks
    };
  }).filter(Boolean);
}

//==============================
// 続刊用の巻数取得
//==============================
function getNextVolumeForTextImport(sameTitleBooks){

  const volumes =
    sameTitleBooks
      .map(book =>
        Number(
          String(book.volume || "")
            .replace(/[^\d]/g, "")
        )
      )
      .filter(n =>
        Number.isFinite(n) &&
        n > 0
      );

  if(volumes.length === 0){
    return 1;
  }

  return Math.max(...volumes) + 1;
}


//==============================
// テキストインポート追加候補
//==============================
function buildTextImportCandidates(results){
  return results.map(result => {
    let volume;
    // 入力で巻数が指定されている場合
    // → 新規／続刊設定よりも指定巻数を優先
    if(
      result.volume !== null &&
      result.volume !== undefined &&
      result.volume !== ""
    ){
      volume =
        Number(result.volume);
    }else{
      // 巻数指定がない場合
      // → 従来の新規／続刊ルールを使用
      volume = 1;
      if(
        textImport.duplicateMode === "continue" &&
        result.exists
      ){
        volume =
          getNextVolumeForTextImport(
            result.sameTitleBooks
          );
      }
    }
    return {
      title:
        result.title,
      subtitle:
        result.subtitle || "",
      volume
    };
  });
}



//==============================
// テキストインポート→本オブジェクト
//==============================
function createTextImportBook(
  candidate,
  index
){
  const sameTitleBooks =
    books.filter(book =>
      (book.title || "").trim()
        === candidate.title
    );
  let volume;
  // 入力側で巻数が指定されている場合は、
  // 新規追加／続刊追加の設定よりも指定巻数を優先
  if(
    candidate.volume !== null
    && candidate.volume !== undefined
    && candidate.volume !== ""
  ){
    volume =
      Number(candidate.volume);
  }else{
    // 巻数指定がない場合は従来通り自動決定
    if(
      textImport.duplicateMode === "continue"
      && sameTitleBooks.length > 0
    ){
      const maxVolume =
        Math.max(
          0,
          ...sameTitleBooks.map(book =>
            Number(book.volume || 0)
          )
        );
      volume = maxVolume + 1;
    }else{
      volume = 1;
    }
  }
  return {
    id:
      Date.now().toString()
      + "_" + index,
    title:
      candidate.title,
    subtitle:
      candidate.subtitle || "",
    volume,
    memo: "",
    fav: 2,
    readDates: [],
    tagIds: [],
    seriesIds: [],
    type: "wish",
    protect: enableProtect,
    reread: false
  };
  
  console.log(textImport.previewBooks);
}


//==============================
// テキストインポートからの追加実行
//==============================
async function executeTextImport(){

  if(
    !textImport.previewBooks ||
    textImport.previewBooks.length === 0
  ){
    alert("追加する本がありません");
    return;
  }

  const booksToAdd =
    textImport.previewBooks;

  console.log(
    "テキストインポート実行：",
    booksToAdd
  );

  // ここで books への追加処理を行う
  books.push(
    ...booksToAdd
  );

  await saveData();

  showToast(
    `${booksToAdd.length}冊を追加しました`
  );

  // インポート内容をリセット
  textImport.previewBooks = [];
  textImport.inputText = "";

  renderSettings();

}



//類似本告知のオンオフ切り替え
function toggleSimilarBookNotice(){

  enableSimilarBookNotice =
    !enableSimilarBookNotice;

  localStorage.setItem(
    "enableSimilarBookNotice",
    enableSimilarBookNotice
  );

  renderSettings();
}

