//
// SERIE.JS シリーズ関連の処理
//

//設定Pシリーズ初期表示モード
let seriesViewMode =
  localStorage.getItem("seriesViewMode")
  || "card";  
  

//==============================
//シリーズ名を取得
//==============================
function openSeriesById(id){

  closeDetailModals();

  const series = seriesMaster.find(
    s => String(s.id) === String(id)
  );

  if(!series) return;

  openSeries(series);
}


//==============================
//====シリーズホーム
//◼️シリーズ一覧表示（骨組みだけ）
//==============================
function renderSeries(){


setActiveMenu("menu-series");

  const list = document.getElementById('page-series');
  list.innerHTML = `
  		
  		<div id="series-top"></div>
  		<div class="series-main" id="series-main"></div>
  `;
	
	
	renderSeriesSearchArea();
	renderSeriesBookList();
	
}

//==============================
//====シリーズ一覧だけを表示する
//==============================
function renderSeriesBookList(){

	const main = document.getElementById("series-main");
	if(!main) return;
	
	main.classList.toggle(
  "compact-mode",
  seriesViewMode === "compact"
);

main.classList.toggle(
  "spine-mode",
  seriesViewMode === "spine"
);
	main.innerHTML = "";
	
	//フィルタ
	const filteredSeries =
  seriesMaster.filter(s =>

    (s.name || "")
      .toLowerCase()
      .includes(
        seriesSearchKeyword.toLowerCase()
      )

  );
	//ソート
	const sorted = sortSeries(filteredSeries);
			
		sorted.forEach(s=>{
		
			const d = document.createElement('div');
			
			const latestDate =
  getSeriesLatestReadDate(s);
  
  const progress =
  getSeriesProgress(s);
  
    const relatedBooks =
  books.filter(b =>
    (s.bookIds || [])
      .map(String)
      .includes(String(b.id))
  );

const bookCount =
  relatedBooks.length;
	
			
	if(seriesViewMode === "spine"){

  d.className = "series-spine-card";

  d.innerHTML = `
    <div class="series-spine-title">
      ${s.name}
    </div>

    <div class="series-spine-count">
      ${bookCount}冊
    </div>
  `;

}else if(seriesViewMode === "compact"){

  d.className = "series-compact-card";

  d.innerHTML = `
    <div class="series-compact-title">
      ${s.name}
    </div>

    <div class="series-compact-count">
      ${bookCount}冊
    </div>
  `;

}else{

  d.className = "card";

  d.innerHTML = `
    <div class="series-list-name">
      ${s.name}
    </div>

    <div class="series-list-date">
      ${bookCount}冊
      ${
        latestDate
          ? `・最新読了：${latestDate}`
          : ""
      }
    </div>
    
    
    

    <div class="series-progress">
      ${progress}
    </div>
  `;
}
			
		d.onclick = ()=> openSeriesDetailModal(s);
		main.appendChild(d);
	});
	
}

//============================
// シリーズ：詳細画面の表示
//============================
/*function renderSeriesDetail(s){

  const relatedBooks = books.filter(b =>
    (s.bookIds || [])
      .map(String)
      .includes(String(b.id))
  );

  const relatedCharacters = characters.filter(c =>
    (s.characterIds || [])
      .map(String)
      .includes(String(c.id))
  );

  const seriesId =
    s.id;
    
    
  safeRender({
    mountId: "page-detail",
    html: `
      <div class="seriesp-head">
        <button onclick="go('series')">戻る</button>
        <span class="satu">登録 : ${relatedBooks.length}冊</span>
        <button onclick="openSeriesEditModal('${s.id}')">✏️ 編集</button>
      </div>

      <h3 class="stitle">${s.name}</h3>

      <div class="series-detail-layout">

        <div class="series-section">
          <div
  class="series-section-title"
  onclick="
  seriesSections.books =
    !seriesSections.books;

  openSeriesDetailModal(
    seriesMaster.find(s =>
      String(s.id) === String('${seriesId}')
    )
  );
"
>
  ${seriesSections.books ? "▽" : "▶︎"} 関連作品
</div>

          ${
            seriesSections.books
              ? `<div id="series-books"></div>`
              : ""
          }
        </div>

        <div class="series-section">
          <div
  class="series-section-title"
  onclick="
  seriesSections.chars =
    !seriesSections.chars;

  openSeriesDetailModal(
    seriesMaster.find(s =>
      String(s.id) === String('${seriesId}')
    )
  );
"
>
  ${seriesSections.chars ? "▽" : "▶︎"} 関連人物
</div>

          ${
            seriesSections.chars
              ? `<div id="series-chars"></div>`
              : ""
          }
        </div>

      </div>
    `,
    afterRender: (el) => {

      const list = document.getElementById("series-books");
      if(list){
        relatedBooks.forEach(b=>{

  const d = document.createElement("div");

  const latestDate =
    getLatestReadDate(b);
    
    
      if(!latestDate){
  console.log(
    "未読扱い:",
    b.title,
    b.readDates,
    b.dates
  );
}

  d.className = "card mini-s-card";

  d.innerHTML = `
   <span class="mini-s-title">
  ${b.title}
  ${
    b.subtitle
      ? `<span class="book-subtitle">${b.subtitle}</span>`
      : ""
  }
  ${
    b.volume
      ? ` ${b.volume}`
      : ""
  }
</span>

    <span class="
      mini-read-status
      ${latestDate ? "read" : "unread"}
    ">
      ${
        latestDate
          ? `既読：${latestDate}`
          : "未読"
      }
    </span>
  `;

  d.onclick = () => openBookDetailModal(b);

  list.appendChild(d);
});
      }

      const list2 = document.getElementById("series-chars");
      if(list2){
        if(!relatedCharacters.length){
          list2.innerHTML = `<div style="color:gray;">（人物なし）</div>`;
        }else{
          relatedCharacters.forEach(c=>{
            const d = document.createElement("div");
            d.className = "card mini-s-card";
            d.textContent = c.name;
            d.onclick = () => openCharacterModal(c);
            list2.appendChild(d);
          });
        }
      }

    }
  });
}
openSeriesDetailModal(...を多分変えんと使えん */
//==============================
//シリーズソート
//==============================
function sortSeries(list){

	const arr = [...list];

//シリーズ名順	
	if(seriesSortMode === "stitle-asc"){
		arr.sort((a,b)=>
			(a.name || "")
			.localeCompare(
				b.name || "",
				"ja"
			)
		);
	}
	
	if(seriesSortMode === "stitle-desc"){
		arr.sort((a,b)=>
			(b.name || "")
			.localeCompare(
				a.name || "",
				"ja"
			)
		);
	}
	
//読了日順	
	if(seriesSortMode === "sread-asc"){

  arr.sort((a,b)=>

    getSeriesLatestReadDate(a)
      .localeCompare(
        getSeriesLatestReadDate(b),
        "ja"
      )

  );

}

if(seriesSortMode === "sread-desc"){

  arr.sort((a,b)=>

    getSeriesLatestReadDate(b)
      .localeCompare(
        getSeriesLatestReadDate(a),
        "ja"
      )

  );

}
	
	
	return arr;
}



//==============================
//====ソートモード切替え（シリーズ）
//==============================
function changeSeriesSortMode(){

	seriesSortMode =
		document.getElementById("series-sort-select").value;
		
		renderSeriesBookList();

}






//==============================
//シリーズ詳細を開く
//==============================
function openSeries(series){

  currentSeriesId = series.id;

  localStorage.setItem(
    "currentSeriesId",
    String(series.id)
  );


  openSeriesDetailModal(series);
}



//==============================
//====シリーズページの検索エリア
//==============================
function renderSeriesSearchArea(){

	const top = document.getElementById("series-top");
	if(!top) return;
	
	top.innerHTML = `
	<button onclick="openAddSeriesModal()"
		class="add-btn">
			➕ シリーズ
		</button>
		
		<input
			id="series-search"
			placeholder="シリーズ検索..."
			value="${seriesSearchKeyword || ""}"
			oninput="handleSeriesSearchInput()"
		>
		
			<select id="series-sort-select" class="select-chip"
				onchange="changeSeriesSortMode()">
			
			<option value="stitle-asc">タイトル↓</option>
			<option value="stitle-desc">タイトル↑</option>
			
			<option value="sread-desc">読了日新</option>
			<option value="sread-asc">読了日古</option>
			
			</select>
			
			<button onclick="changeSeriesViewMode('card')">
  ⬜︎
</button>

<button onclick="changeSeriesViewMode('compact')">
  ≡
</button>

<button onclick="changeSeriesViewMode('spine')">
  ‖‖
</button>
		
		<div id="series-suggest"></div>
	`;
	renderSeriesSuggest();
}




//==============================
//====キーワード検索（シリーズ一覧用）
//==============================
function handleSeriesSearchInput(){

  seriesSearchKeyword =

    document.getElementById(
      "series-search"
    ).value;

  renderSuggestList({

    inputId:
      "series-search",

    suggestId:
      "series-suggest",

    list:
      seriesMaster.map(
        s => s.name
      )

  });

  renderSeriesBookList();
}






//==============================
//シリーズ編集モーダル保存処理
//==============================
async function saveSeriesEdit(id){

  const series =
    seriesMaster.find(
      s => String(s.id) === String(id)
    );

  if(!series) return;

  series.name =
    document.getElementById(
      "edit-series-name"
    ).value;

  const editBookIds =
    [...new Set(
      editingSeriesBookIds.map(String)
    )];

  const editCharacterIds =
    [...new Set(
      editingSeriesCharacterIds.map(String)
    )];

  series.bookIds =
    editBookIds;

  series.characterIds =
    editCharacterIds;

  books.forEach(book=>{

    const shouldHaveSeries =
      editBookIds.includes(
        String(book.id)
      );

    if(shouldHaveSeries){

      const currentIds =
        (book.seriesIds || [])
          .map(String);

      if(
        !currentIds.includes(
          String(series.id)
        )
      ){
        book.seriesIds =
          currentIds.concat(
            String(series.id)
          );
      }

    }else{

      book.seriesIds =
        (book.seriesIds || [])
          .map(String)
          .filter(seriesId =>
            seriesId !== String(series.id)
          );
    }
  });

  characters.forEach(character=>{

    const shouldHaveSeries =
      editCharacterIds.includes(
        String(character.id)
      );

    if(shouldHaveSeries){

      const currentIds =
        (character.seriesIds || [])
          .map(String);

      if(
        !currentIds.includes(
          String(series.id)
        )
      ){
        character.seriesIds =
          currentIds.concat(
            String(series.id)
          );
      }

    }else{

      character.seriesIds =
        (character.seriesIds || [])
          .map(String)
          .filter(seriesId =>
            seriesId !== String(series.id)
          );
    }
  });

  await saveData();

  closeModal("edit-series-modal");

  renderSeries();

  openSeriesDetailModal(series);

  showToast("保存しました！");
}


//==============================
//関連本の一覧描画
//==============================
function renderSeriesEditBooks(){

  const relatedBooks =
    books.filter(b =>

      editingSeriesBookIds.includes(
        String(b.id)
      )

    );

  document.getElementById(
    "series-edit-books"
  ).innerHTML = `

    <div>

      ${relatedBooks.map(b=>`

        <div class="related-chip">

  ${b.title}
  ${
    b.volume
      ? ` ${b.volume}`
      : ""
  }

  <button
    class="mini-delete-btn"
    onclick="
      removeBookFromSeries(
        '${b.id}'
      )
    "
  >
    ✕
  </button>

</div>

      `).join("")}

    </div>
  `;
}


//==============================
//関連キャラの一覧描画
//==============================
function renderSeriesEditCharacters(){

  const relatedCharacters =
    characters.filter(c =>

      editingSeriesCharacterIds.includes(c.id)

    );

  document.getElementById(
    "series-edit-characters"
  ).innerHTML = `

    <div>

      ${relatedCharacters.map(c=>`

        <div class="related-chip">

          ${c.name}

          <button
            class="mini-delete-btn"
            onclick="
              removeCharacterFromSeries(
                '${c.id}'
              )
            "
          >
            ✕
          </button>

        </div>

      `).join("")}

    </div>
  `;
}






//==============================
//関連本の追加処理
//==============================
function addBookToSeries(id){

  if(
    !editingSeriesBookIds.includes(id)
  ){
    editingSeriesBookIds.push(
      String(id)
    );
  }

  renderSeriesEditBooks();

}



//==============================
//編集内：関連削除（本）
//==============================
function removeBookFromSeries(id){

if(!confirm("削除しますか？")){
  return;
}

  editingSeriesBookIds =
    editingSeriesBookIds.filter(
      bId => String(bId) !== String(id)
    );

  renderSeriesEditBooks();

}


//==============================
//新規：関連削除（本）
//==============================
function removeNewBookFromSeries(bookId){

if(!confirm("削除しますか？")){
  return;
}

  newSeriesBookIds =
    newSeriesBookIds.filter(
      id => String(id) !== String(bookId)
    );

  renderSeriesNewBooks();
}


//==============================
//関連キャラの追加処理
//==============================
function addCharacterToSeries(id){

  if(
    !editingSeriesCharacterIds.includes(id)
  ){
    editingSeriesCharacterIds.push(id);
  }

  renderSeriesEditCharacters();

}

//==============================
//編集内：関連削除（人物）
//==============================
function removeCharacterFromSeries(id){

if(!confirm("削除しますか？")){
  return;
}

  editingSeriesCharacterIds =
    editingSeriesCharacterIds.filter(
      cId => String(cId) !== String(id)
    );

  renderSeriesEditCharacters();

}


//==============================
//新規：関連削除（人物）
//==============================
function removeNewCharacterFromSeries(characterId){
if(!confirm("削除しますか？")){
  return;
}
  newSeriesCharacterIds =
    newSeriesCharacterIds.filter(
      id =>
        String(id) !==
        String(characterId)
    );

  renderSeriesNewCharacters();
}



//==============================
//新規用：関連本の描画
//==============================
function renderSeriesNewBooks(){

  const relatedBooks =
    books.filter(b =>

      newSeriesBookIds.includes(String(b.id))

    );

  document.getElementById(
    "series-new-books"
  ).innerHTML = `

    ${relatedBooks.map(b=>`

     <div class="related-chip">

  ${b.title}
  ${
    b.volume
      ? ` ${b.volume}`
      : ""
  }

  <button
    class="mini-delete-btn"
    onclick="
      removeNewBookFromSeries(
        '${b.id}'
      )
    "
  >
    ✕
  </button>

</div>

    `).join("")}

  `;
}


//==============================
//新規用：関連人物の描画
//==============================
function renderSeriesNewCharacters(){

  const relatedCharacters =
    characters.filter(c =>

      newSeriesCharacterIds.includes(c.id)

    );

  document.getElementById(
    "series-new-characters"
  ).innerHTML = `

    ${relatedCharacters.map(c=>`

     <div class="related-chip">

  ${c.name}

  <button
    class="mini-delete-btn"
    onclick="
      removeNewCharacterFromSeries(
        '${c.id}'
      )
    "
  >
    ✕
  </button>

</div>

    `).join("")}

  `;
}




//==============================
//⭐︎新規シリーズに関連本追加処理
//==============================
function addBookToNewSeries(id){

  if(
    !newSeriesBookIds.includes(id)
  ){
    newSeriesBookIds.push(String(id));
  }

  renderSeriesNewBooks();
  renderSeriesNewBookSuggest();

}



//==============================
//⭐︎新規シリーズに関連人物追加処理
//==============================
function addCharacterToNewSeries(id){

  if(
    !newSeriesCharacterIds.includes(id)
  ){
    newSeriesCharacterIds.push(id);
  }

  renderSeriesNewCharacters();
  renderSeriesNewCharacterSuggest();

}



//==============================
//====新規シリーズ追加処理
//==============================
async function saveNewSeries(){

  const title =
    document.getElementById(
      "add-series-title"
    ).value.trim();

  if(!title) return;

  const series = {

    id:
      "s" + Date.now(),

    name:
      title,

    bookIds:
      (newSeriesBookIds || []).map(String),

    characterIds:
      (newSeriesCharacterIds || []).map(String)
  };

  seriesMaster.push(series);

  // 本側へ同期
  books.forEach(book=>{

    const shouldHaveSeries =
      series.bookIds.includes(
        String(book.id)
      );

    if(shouldHaveSeries){

      if(
        !(book.seriesIds || [])
          .map(String)
          .includes(String(series.id))
      ){

        book.seriesIds =
          (book.seriesIds || []).concat(
            String(series.id)
          );
      }
    }
  });

  // 人物側へ同期
  characters.forEach(character=>{

    const shouldHaveSeries =
      series.characterIds.includes(
        String(character.id)
      );

    if(shouldHaveSeries){

      if(
        !(character.seriesIds || [])
          .map(String)
          .includes(String(series.id))
      ){

        character.seriesIds =
          (character.seriesIds || []).concat(
            String(series.id)
          );
      }
    }
  });

  await saveData();

  closeModal(
    "add-series-modal"
  );

  renderSeries();

  showToast(
    `「${series.name}」を追加しました`
  );
}

//==============================
//====シリーズ削除
//==============================
async function deleteSeries(id){

  const series =
    seriesMaster.find(
      s => String(s.id) === String(id)
    );

  if(!series) return;

  if(
    !confirm(
      `「${series.name}」を削除しますか？\n本や人物は削除されません。`
    )
  ){
    return;
  }

  seriesMaster =
    seriesMaster.filter(
      s => String(s.id) !== String(id)
    );

  books.forEach(book=>{

    book.seriesIds =
      (book.seriesIds || []).filter(
        seriesId =>
          String(seriesId) !== String(id)
      );

  });

  characters.forEach(character=>{

    character.seriesIds =
      (character.seriesIds || []).filter(
        seriesId =>
          String(seriesId) !== String(id)
      );

  });

    await saveData();

    closeDetailModals();

    go('series');
    renderSeries();

    showToast(
  `「${series.name}」を削除しました`
);
}






//====================
//シリーズ内作品の最新読了日取得
//====================

function getSeriesLatestReadDate(series){

  const relatedBooks =
    books.filter(b =>

      (series.bookIds || [])
        .map(String)
        .includes(String(b.id))

    );

  const dates = [];

  relatedBooks.forEach(b=>{

    (b.readDates || b.dates || [])
      .forEach(date=>{

        dates.push(date);

      });

  });

  return dates.length
    ? dates.sort().slice(-1)[0]
    : "";
}


//====================
//一覧に巻数チップ表示用
//====================
function getSeriesProgress(series){

  const relatedBooks =
    books.filter(b=>

      (series.bookIds || [])
        .map(String)
        .includes(String(b.id))

    );

  const sorted =
    [...relatedBooks]
      .sort((a,b)=>

        (a.volume || 0) -
        (b.volume || 0)

      );

  return sorted
    .map((b,index)=>{

      const read =
        !!getLatestReadDate(b);

      return `
        <span class="
          progress-chip
          ${read ? "read" : "unread"}
        ">
          ${index + 1}
        </span>
      `;

    })
    .join("");

}

//===========================
//巻数チップ補助巻数
//===========================
function toCircledNumber(num, read){

  const filled = [
    "⓿","❶","❷","❸","❹",
    "❺","❻","❼","❽","❾","❿"
  ];

  const normal = [
    "⓪","①","②","③","④",
    "⑤","⑥","⑦","⑧","⑨","⑩"
  ];

  if(num <= 10){
    return read
      ? filled[num]
      : normal[num];
  }

  return read
    ? "●"
    : "○";
}



//===========================
//シリーズの表示モード切り替え
//===========================
function changeSeriesViewMode(mode){

  seriesViewMode = mode;

  localStorage.setItem(
    "seriesViewMode",
    mode
  );

  renderSeriesBookList();
}

