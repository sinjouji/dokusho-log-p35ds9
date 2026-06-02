//==============================
// MODAL
//
//  モーダル関係の処理を集めろぉ！！！
//==============================


//==============================
//====モーダルを閉じる（汎用）
//==============================
function closeModal(id){

  document
    .getElementById(id)
    ?.remove();
}



//==============================
//⬛︎本の追加モーダル==========
//==============================
function openAddBookModal(){

  editingBookSeriesIds = [];
  newBookTagIds = [];
  newBookFav = 0;

  const modal = document.createElement("div");
  modal.className = "modal-bg";
  modal.id = "add-book-modal";

  modal.innerHTML = `
    <div class="modal-box">
 <div class="title-line">
         <span style="font-size:20px;font-weight:bold;margin-right:auto;">本を追加</span>
         <button onclick="closeModal('add-book-modal')" style="margin-left:auto;">✖️</button></div>

      <input class="addin"
       id="add-title"
        type="text"
        placeholder="タイトル"
        oninput="renderTitleSuggest()"
        >
      <div id="title-suggest"></div>
      
      
      
      
      <div class="title-line">
        <div class="field-label" style="padding:0;margin-right:2px;">読了日:</div>

        <input type="date" id="add-date"  style="width:50%;margin-right:auto;">
        
        
	  			<button
				  type="button"
				  id="new-book-fav-btn"
				  class="fav-cycle-btn"
			  		onclick="cycleNewBookFav()"
				>
				  評価：0
				</button>

        
      </div>
      
      
      
      
      
            ${enableMemo ? `
      <input type="text" class="bememo" id="add-memo"
        placeholder="メモ">` : ""}

      
      
      
     <div class="end-btn"> 
      
   
      <div style="font-size:11px"
      class="toggle-head"
      data-open="▽タグ非表示"
      data-close="▶︎タグ表示"
      onclick="
        togglesSection(
        'add-book-tags',
        this
      )
    "
  >
  ▶︎タグ表示</div>
  
  
   <div style="font-size:11px"
      class="toggle-head"
      data-open="▽関連シリーズ"
      data-close="▶︎関連シリーズ"
      onclick="
        togglesSection(
        'add-book-series',
        this
      )
    "
  >▶︎関連シリーズ</div>
  
  
  </div>


     <div
       class="toggle-content"
       id="add-book-series"
     >
        <input
          class="addin"
          id="add-book-related-search"
          type="text"
          placeholder="関連シリーズを追加"
          
          oninput="
            renderBookSeriesSuggest(
              'add-book-related-search',
              'add-book-series-suggest',
              'add-book-series-list'
            );
          "
        >
      
       <div class="suggest-box">
        <div id="add-book-series-suggest"></div>
       </div><br>
     
     <div class="title-line">
     関連：<br>
      	 <div
      	  id="add-book-series-list"
      	  class="series-edit-list"></div>
      </div>      
     </div>
  
  
      	<div class="toggle-content"
      	  id="add-book-tags">
			
				${tagMaster
					.filter(tag => !tag.isHidden)
					.map(tag=>{

				const isActive =
					newBookTagIds.includes(tag.id);

				return `
				<span
					class="
						tag-chip detail-tag-chip
						${isActive ? "active" : ""}
					"
					
					data-tag-id="${tag.id}"
					
 					onclick="
 						toggleNewBookTag(
 							'${tag.id}',
 							 this,
 							 '${tag.color}'
 							)
 						"
 						
					style="
						background:
							${isActive ? tag.color : '#fffffc'};
						color:
							${isActive ? '#fffffc' : tag.color};
						border:
							1px solid ${tag.color};
					"
				>
				${tag.name}
			</span>
			
			
		`;

	}).join("")}
			</div>
      
      
      
      
      <hr class="kugiri">

 
        <button onclick="saveNewBook()">
          ➕保存
        </button>
            </div>
  `;

  document.body.appendChild(modal);
  renderBookEditSeries(
   "add-book-series-list"
  );
}



//==============================
//====本詳細モーダル========
//==============================
function openBookDetailModal(book){

  currentDetailFav = book.fav || 0;
  
  const relatedSeries =
  seriesMaster.filter(s=>{

    return (
      Array.isArray(book.seriesIds)
      &&
      book.seriesIds
        .map(String)
        .includes(String(s.id))
    );
  });
  
  const sortedDates =
    [...(
      book.readDates ||
      book.dates ||
      []
    )
    ].sort((a,b)=>b.localeCompare(a));
  
  const latestDate =
    sortedDates[0];
    
      editingBookSeriesIds =
    [...(book.seriesIds || [])]
      .map(String);
      
    const hiddenTagIds =
  (book.tagIds || [])
    .filter(tagId =>
      isHiddenTag(tagId)
    );
  
  const modal = document.createElement("div");
  modal.className = "modal-bg";
  modal.id = "open-book-modal";
	
  modal.innerHTML = `
    <div class="modal-box detail-modal">
    <div class="title-line">
      <input id="detail-title" class="detail-title"
        value="${book.title || ""}">
        
    
      <button onclick="closeModal('open-book-modal')" style="margin-left:auto;">
        ✖️
      </button>
    </div>
    
    
            
            <div style="font-size:10px">
      ${relatedSeries.map(s=>`
        シリーズ : 
        <button class="detail-series"
				  onclick="
				    closeModal('open-book-modal');
				    openSeriesById('${s.id}');
				  "
				>
 				 ${s.name}
				</button>
      `).join(", ") || ""}
    </div>

    
    
    
    
      <div class="detail-row" style="display:flex;
  justify-content:space-between;align-items:center;">
        状態 ＝ 
        ${
          book.type === "wish"
          ? "❤️ウィッシュ"
          : "📚本棚"
        }
   
        <div class="detail-fav-wrap">

       <button
         class="fav-cycle-btn"
         onclick="cycleFav('${book.id}')">評価：
           ${
              ["0","★","★★","★★★","👑"][book.fav || 0]
            }
       </button>

     </div>
   
        <label class="reread-check">

  <input
    type="checkbox"
    id="reread-check"
    ${book.reread ? "checked" : ""}

    onchange="
      toggleReread('${book.id}')
    "
  >

  再読予定
</label>
      </div>
      
      

     <div class="detail-row" style="display:flex;justify-content:space-between;
  align-items:center;gap:2px;flex-wrap:wrap;">
  読了日：

  ${
    latestDate
    ? `
      <div class="date-tag">
        ${latestDate}
        <button
              class="mini-delete-btn"
              onclick="removeReadDate('${book.id}','${latestDate}')"
            >
              ✕
            </button>
      </div>
      <div class="book-stat">
      ${
        (
          book.readDates ||
          book.dates ||
          []
        ).length
      }回読了</div>
             <div
        class="toggle-history"
        onclick="
          toggleDateHistory('${book.id}')
        "
       >
        ▼ 読了履歴
       </div>
    </div>
            
 
      <div
        id="date-history-${book.id}"
        class="date-history-grid"
        style="display:none;"
      >
      
        ${sortedDates.slice(1).map(date=>`
        
          <div class="mini-date-row">
            ${date}
            <button
              class="mini-delete-btn"
              onclick="removeReadDate('${book.id}','${date}')"
            >
              ✕
            </button>
          </div>
        
        `).join("")}
    `
    : "未読"
  }</div>
      
      
      <div class="detail-date-add">
      <input type="date" id="readDate-${book.id}" style="padding:1px 2px;width:70%;border-radius:10px;">
      <button onclick="addReadDate('${book.id}')" style="margin-left:auto;">
        ➕読了日
      </button>

      </div>


            <div class="detail-row">
      ${enableMemo ? `
      <input
        class="bememo"
        type="text"
        id="editMemo"
        
        placeholder="メモ"
        
        value="${book.memo || ""}"
      >
      ` : ""}</div>
      

		<div class="end-btn">
		
			<div style="font-size:11px"
        class="toggle-head"
        data-open="▽タグ非表示"
        data-close="▶︎タグ表示"
        onclick="
          togglesSection(
          'open-book-tags',
          this
          )
        "
      >
      ▶︎タグ表示</div>
  
      <div style="font-size:11px"
        class="toggle-head"
        data-open="▽関連シリーズ"
        data-close="▶︎関連シリーズ"
        onclick="
          togglesSection(
          'open-book-series',
          this
          )
        "
      >
      ▶︎関連用シリーズ</div>
   </div>
   
   <div class="
  toggle-content
  ${detailSections.series ? "open" : ""}
"
id="open-book-series">
  
        <input class="addin"
        id="book-related-search"
        type="text"
        placeholder="関連シリーズを追加"
        oninput="
          renderBookSeriesSuggest(
            'book-related-search',
            'book-series-suggest',
            'book-edit-series'
          );
        "
      >
    <div class="suggest-box">
      <div id="book-series-suggest"></div>
    </div>
    
    <div class="title-line">
    関連：

    <div id="book-edit-series" class="series-edit-list"></div>
    </div>
   
   </div>
 
  <div class="
  toggle-content
  ${detailSections.tags ? "open" : ""}
"
id="open-book-tags">

  ${
    tagMaster
      .filter(tag => !tag.isHidden)
      .map(tag=>{

        const isActive =
          (book.tagIds || [])
            .map(String)
            .includes(String(tag.id));
            

        return `
          <span
            class="tag-chip detail-tag-chip"
            onclick="toggleBookTag(
              '${book.id}',
              '${tag.id}'
            )"
            style="
              background:
                ${isActive ? tag.color : '#fffffc'};

              color:
                ${isActive ? '#fffffc' : tag.color};

              border:
                1px solid ${tag.color};
            "
          >
            ${tag.name}
          </span>
        `;
      })
      .join("")
  }
  
 
  ${
  hiddenTagIds.length
    ? `
      <div class="hidden-tag-area">

        <div class="hidden-tag-title">
          管理タグ
        </div>

    <div class="hidden-tag-list">

      ${
        (book.tagIds || [])
          .filter(tagId =>
            isHiddenTag(tagId)
          )
          .map(tagId=>{

            const tag =
              tagMaster.find(t =>
                String(t.id) ===
                String(tagId)
              );

            if(!tag) return "";

            return `
              <span
                class="hidden-tag-chip"
              >
                ${tag.name}
              </span>
            `;
          })
          .join("")
      }

    </div>

  </div>
  
      `
    : ""
}



</div>
			



      <hr class="kugiri">


		<div class="end-btn">
      
      <button class="danger-btn"
        onclick="deleteBook('${book.id}')">
        🗑 削除
      </button>
      
      <button onclick="duplicateBook('${book.id}')">
  📄 複製
</button>
      
      <button onclick="saveDetail('${book.id}')">
        🪎 保存
      </button>
      
    </div>
      
    </div>
  `;

  document.body.appendChild(modal);
  renderBookEditSeries(
  "book-edit-series"
  );
}




//==============================
//シリーズ
//==============================


//==============================
//====シリーズの追加モーダル
//==============================
function openAddSeriesModal(){

newSeriesBookIds = [];

newSeriesCharacterIds = [];

	const modal = document.createElement("div");
	modal.className = "modal-bg";
	modal.id = "add-series-modal";
	
	modal.innerHTML = `
		<div class="modal-box">
		<div class="title-line">
					<span style="font-size:20px;font-weight:bold;margin-right:auto;">シリーズを追加</span>
						<button onclick="closeModal('add-series-modal')" style="margin-left:auto;">✖️</button></div>
			
			<input
  class="addin"
  id="add-series-title"
  type="text"
  placeholder="シリーズタイトル"
  oninput="renderSeriesTitleSuggest()"
>

<div id="series-title-suggest"></div>
			
			
			
			
				<div>関連登録</div>
				<div class="addin2">
				<input class="addin"
				 id="series-for-one"
					type="text"
					placeholder="作品／人物を追加"
					oninput="renderSeriesNewBookSuggest();
						renderSeriesNewCharacterSuggest();">
				
				</div>
				
				<div class="suggest-box">
					<div id="series-book-suggest"></div>
					<div id="series-character-suggest"></div>
				</div>
				
				
				
				<div class="end-btn">
      <div
      class="toggle-head"
      data-open="▽作品一覧を閉じる"
      data-close="▶︎作品一覧を開く"
      onclick="
        togglesSection(
        'series-new-books',
        this
      )
    "
  >▶︎作品一覧を開く</div>
      
      
      <div
      class="toggle-head"
      data-open="▽人物一覧を閉じる"
      data-close="▶︎人物一覧を開く"
      onclick="
        togglesSection(
        'series-new-characters',
        this
      )
    "
  >▶︎人物一覧を開く</div>
      
      
      </div>
      
 
      
      
 
      
     <div id="series-new-books"
       class="
         toggle-content
         series-edit-list
       "></div>

     <div id="series-new-characters"
       class="
         toggle-content
         series-edit-list
       "></div>
				
			
			     <hr class="kugiri">
     			 <button onclick="saveNewSeries()">➕追加</button>
			
			
			
`;
	document.body.appendChild(modal);
	//関連対象一時表示エリア、複数は最新3件まで表示とかに制限したい
}


//==============================
//シリーズ編集モーダル
//==============================
function openSeriesEditModal(id){

  const modal = document.createElement("div");
  
  const series =
    seriesMaster.find(
      s => String(s.id) === String(id)
    );
    
  if(!series) return;

  editingSeriesBookIds =
    [...(series.bookIds || [])];

  editingSeriesCharacterIds =
    [...(series.characterIds || [])];
    


  modal.className = "modal-bg";
  modal.id = "edit-series-modal";

  modal.innerHTML = `
    <div class="modal-box">

      <div class="title-line">
      <span style="font-size:20px;font-weight:bold;margin-right:auto;">シリーズ編集</span>
      <button onclick="closeModal('edit-series-modal')" style="margin-left:auto;">✖️</button>
      </div>

      <input
        id="edit-series-name"
        class="addin"
        value="${series.name || ""}"
      >
      
     
      <input class="addin"
        id="series-related-search"
        type="text"
        placeholder="本・人物を追加"
        oninput="
          renderSeriesBookSuggest();
          renderSeriesCharacterSuggest();
        "
      >
<div class="suggest-box">

  <div id="series-book-suggest"></div>

  <div id="series-character-suggest"></div>

</div>
      <div class="end-btn">
      
      
       <div
      class="toggle-head"
      data-open="▽作品一覧を閉じる"
      data-close="▶︎作品一覧を開く"
      onclick="
        togglesSection(
        'series-edit-books',
        this
      )
    "
  >▶︎作品一覧を開く</div>
      
      
       <div
      class="toggle-head"
      data-open="▽人物一覧を閉じる"
      data-close="▶︎人物一覧を開く"
      onclick="
        togglesSection(
        'series-edit-characters',
        this
      )
    "
  >▶︎人物一覧を開く</div>
      
      
      </div>
      
      
     <div id="series-edit-books"
       class="
         toggle-content
         series-edit-list
       "></div>
     <div id="series-edit-characters"
       class="
         toggle-content
         series-edit-list
       "></div>
     
     <hr class="kugiri">

    <div class="end-btn">
    
    
      <button onclick="deleteSeries('${series.id}')">
       🗑️ 削除
      </button>
    
      <button
        onclick="saveSeriesEdit('${series.id}')"
      >
        🪎 保存
      </button>

     </div>

    </div>
  `;

  document.body.appendChild(modal);
  renderSeriesEditBooks();

renderSeriesEditCharacters();

}


//==============================
//キャラクター
//==============================


//==============================
//新規キャラクター登録
//==============================
function openAddCharacterModal(){

  editingCharacterSeriesIds = [];

	const modal = document.createElement("div");
	modal.className = "modal-bg";
	modal.id = "add-chars-modal";
	
	modal.innerHTML = `
		<div class="modal-box">
			<div class="title-line">
			<span style="font-size:20px;font-weight:bold;margin-right:auto;">人物を追加</span>
					<button onclick="closeModal('add-chars-modal')" style="margin-left:auto;">✖️</button></div>
			
			<input class="addin"
				id="add-chars-name"
				type="text"
				placeholder="人物名">
			
				<textarea id="add-chars-memo"
				placeholder="メモ"></textarea>
				
				
			<div>関連シリーズを登録</div>
			
		
			<input class="addin"
				id="add-character-related-search"
				type="text"
				placeholder="関連シリーズ名"
				oninput="
				  renderCharacterSeriesSuggest(
				    'add-character-related-search',
						'add-character-series-suggest',
						'add-character-series-list'
				  );">
				<div class="suggest-box">
				<div id="add-character-series-suggest"></div>
				</div>
				
				<div class="title-line">
				関連：<br>
			<div id="add-character-series-list" class="series-edit-list"></div>
			</div>
			
			     <hr class="kugiri">
			
			<button onclick="saveNewCharacter()">➕追加</button>
			
	
		</div>
	`;

	document.body.appendChild(modal);
	renderCharacterEditSeries(
	  "add-character-series-list"
	);
}



//==============================
//====キャラクター詳細モーダル====
//==============================
function openCharacterModal(c){

editingCharacterSeriesIds =
  (c.seriesIds || []).map(String);

    const relatedSeries =
  seriesMaster.filter(s =>

    Array.isArray(c.seriesIds)
    &&
    c.seriesIds
      .map(String)
      .includes(String(s.id))

  );
  

	const modal = document.createElement("div");
	modal.className = "modal-bg";
	modal.id = "open-chars-modal";
	
	modal.innerHTML = `
		<div class="modal-box detail-modal">
		<div class="title-line">
			<input id="character-name" class="character-name"
			value="${c.name || ""}">
						<button style="margin-left:auto;" onclick="closeModal('open-chars-modal')">✖️</button></div>
			
						
			<textarea id="character-memo">${c.memo || ""}</textarea>
		
		      
      <div style="font-size:10px">
      ${relatedSeries.map(s=>`
        シリーズ : 
        <button class="detail-series"
				  onclick="
				    closeModal('open-chars-modal');
				    openSeriesById('${s.id}');
				  "
				>
 				 ${s.name}
				</button>
      `).join(", ") || ""}
    </div>
    
    
    
   <input class="addin"
        id="character-related-search"
        type="text"
        placeholder="関連シリーズを追加"
        oninput="
          renderCharacterSeriesSuggest(
            'character-related-search',
            'character-series-suggest',
            'character-edit-series'
          );
        "
      >
    <div class="suggest-box">
      <div id="character-series-suggest"></div>
    </div>
    <div class="title-line">
    関連：<br>
    <div id="character-edit-series" class="series-edit-list"></div>
   </div>
         <hr class="kugiri">
		
		<div class="end-btn">
			<button onclick="deleteCharacter('${c.id}')">
  🗑️ 削除
</button>
			<button onclick="saveCharacter('${c.id}')">🪎 保存</button>
		</div>
	
		</div>
	`;
	document.body.appendChild(modal);
	renderCharacterEditSeries(
	  "character-edit-series"
	);
}




//==============================
//統計
//==============================


//==============================
//カレンダーの日モーダル設定====
//==============================
function openDayModal(dateStr, list){
  const m = document.createElement("div");
  m.style.position = "fixed";
  m.style.top = 0;
  m.style.left = 0;
  m.style.right = 0;
  m.style.bottom = 0;
  m.style.background = "rgba(0,0,0,0.5)";
  m.style.display = "flex";
  m.style.alignItems = "center";
  m.style.justifyContent = "center";

  const box = document.createElement("div");
  box.style.background = "#fffffc";
  box.style.padding = "20px";
  box.style.maxHeight = "80%";
  box.style.overflow = "auto";
  box.style.borderRadius = "12px";
  box.style.minWidth = "200px";

  list.forEach(b=>{
    const d = document.createElement("div");
    d.style.padding = "6px 0";
    d.style.borderBottom = "1px solid #eee";
    
    d.innerHTML = `
      <div style="font-weight:bold">${b.title}</div>`;

    d.onclick = ()=>{
      m.remove();
      openBookDetailModal(b);
    };
    
    box.appendChild(d);
  });

  m.appendChild(box);
  m.onclick = ()=> m.remove();
  box.onclick = (e)=>{
    e.stopPropagation();
  };

  document.body.appendChild(m);
}




