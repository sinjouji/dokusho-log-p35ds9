//==============================
// MODAL
//
//  モーダル関係の処理を集めろぉ！！！
//==============================


//非表示タグの削除用変数
let pendingHiddenTagRemove = null;
let newBookHiddenTagIds = [];

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
  newBookHiddenTagIds = [];

  const modal = document.createElement("div");
  modal.className = "modal-bg";
  modal.id = "add-book-modal";

  modal.innerHTML = `
    <div class="modal-box fixed-scroll-modal book-detail-modal">
    
    <div class="detail-modal-header">
    
 <div class="flex-between">
         <span>本を追加</span>
         <button class="btn-sub" onclick="closeModal('add-book-modal')">✖️</button></div>

      <input class="input-title yohaku10"
       id="add-title"
        type="text"
        placeholder="タイトル"
        oninput="renderTitleSuggest()"
        >
      <div id="title-suggest"></div>
      
      <div class="detail-row yohaku10">
      	<div class="label-text">サブタイトル：</div>
      <input class="input-title"
        id="add-subtitle"
        type="text"
        placeholder="サブタイトル（任意）"
      >
      </div>
      
      
      <div class="flex-between yohaku15">
        <div class="label-text">読了日：</div>

        <input type="date" id="add-date" class="input-common input-small left-yose">
        
        
	  			<button
				  type="button"
				  id="new-book-fav-btn"
				  class="fav-cycle-btn"
			  		onclick="cycleNewBookFav()"
				>
				  評価：0
				</button>

        
      </div>
      </div>
      
      
      <div class="fixed-scroll-body">
      
            ${enableMemo ? `
      <input type="text" class="input-common yohaku15" id="add-memo"
        placeholder="メモ">` : ""}

      
    <div
      class="detail-toggle-head t-labels"
      data-open="▽関連シリーズ"
      data-close="▶︎関連シリーズ"
      onclick="
        togglesSection(
        'add-book-series',
        this
      )
    "
  >▶︎関連シリーズ</div>

     <div
       class="toggle-content"
       id="add-book-series"
     >
        <input
          class="input-common"
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
     
     <div class="detail-series-area">
      <div class="detail-label">
     関連：
      </div>
      	 <div
      	  id="add-book-series-list"
      	  class="series-edit-list"></div>
      </div>      
     </div>
  
  
  
  
      <div
      class="detail-toggle-head t-labels"
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
			

	
	<div
  class="detail-toggle-head t-labels"
  data-open="▽ 管理タグ（${newBookHiddenTagIds.length}）"
  data-close="▶︎ 管理タグ（${newBookHiddenTagIds.length}）"
  onclick="
    togglesSection(
      'add-book-hidden-tags',
      this
    )
  "
>
  ▶︎ 管理タグ（${newBookHiddenTagIds.length}）
</div>

<div
  class="
    toggle-content
    ${addBookTagSections.hiddenTags ? "open" : ""}
  "
  id="add-book-hidden-tags"
>

  

	<div class="hidden-tag-input-area">

  <input
    class="input-common"
    id="add-book-hidden-tag-input"
    type="text"
    placeholder="管理タグを追加"
    oninput="
      renderAddBookHiddenTagSuggest()
    "
    onkeydown="
      if(event.key === 'Enter'){
        addHiddenTagToNewBook(this.value);
      }
    "
  >

  <div class="suggest-box">
    <div id="add-book-hidden-tag-suggest"></div>
  </div>
  
<div
    id="add-book-hidden-tag-list"
    class="hidden-tag-list selected-hidden-tags"
  ></div>
  </div>
      
      
   <!-- 今の新規本用 管理タグ入力・選択済み・サジェスト -->

</div>   
</div>
      
      <div class="detail-modal-footer">
      <hr class="kugiri">

 
        <button onclick="saveNewBook()" class="btn-main" style="width:100%">
          ➕保存
        </button>
            </div>
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
  
  if(!Array.isArray(book.quotes)){
  book.quotes = [];
}
  
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
    <div class="modal-box fixed-scroll-modal book-detail-modal">
    
    <div class="detail-modal-header">
    
    <div class="detail-row">
    <input id="detail-title" class="input-title yohaku10"
        value="${book.title || ""}">        
    
      <button class="btn-sub right-yose" onclick="closeModal('open-book-modal')">
        ✖️
      </button>
    </div>
    
    <div class="detail-row">
    <span class="label-text">
    サブタイトル：</span>
    <input
      class="input-common yohaku15"
      id="edit-subtitle"
      type="text"
      value="${book.subtitle || ""}"
      placeholder="サブタイトル（任意）"
    >
    </div>
    
    <div class="flex-between">
    <div class="label-text left-yose">
  巻数：
  <input
    class="input-common volume-input left-yose yohaku15"
    id="detail-volume"
    type="number"
    min="0"
    value="${book.volume || ""}"
    placeholder="巻数"
  >
 </div> 
 
  
  <label class="reread-check right-yose yohaku15">

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
</div>
    
     <div class="fixed-scroll-body">
      <div class="detail-series-area">
  ${relatedSeries.map(s=>`
    <button class="detail-series yohaku15"
      onclick="
        closeModal('open-book-modal');
        openSeriesById('${s.id}');
      "
    >
      シリーズ：${s.name}
    </button>
  `).join("")}
</div>


    <div class="book-status-area">
      <div class="flex-between yohaku15">
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
      </div>
      
      
   <div class="flex-between">
    <div class="book-stat yohaku15">
    読了回数 ： 
      ${
        (
          book.readDates ||
          book.dates ||
          []
        ).length
      }回読了</div>
      </div>
 
      
 
     <div class="detail-row yohaku10">
     <div class="left-yose">
  読了日：

  ${
    latestDate
    ? `
      <div class="date-tag left-yose">
        ${latestDate}
        <button
              class="mini-delete-btn"
              onclick="removeReadDate('${book.id}','${latestDate}')"
            >
              ✕
            </button>
      </div>`
    : "未読"
  }
  </div>
     
    </div>
      
    <div class="detail-row yohaku15">
    <div class="left-yose">
       <input type="date" id="readDate-${book.id}" class="input-common input-small white-input">
      <button onclick="addReadDate('${book.id}')" style="margin-left:5px;">
       ➕読了日
      </button>
      </div>
    </div>
     </div> 
      
      
      <div class="yohaku5 t-white">.</div>
      
      
       <div class="detail-row">
      ${enableMemo ? `
      <input
        class="input-common yohaku15"
        type="text"
        id="editMemo"
        
        placeholder="メモ"
        
        value="${book.memo || ""}"
      >
      ` : ""}</div>
      
      <div class="yohaku10"> </div>
      
    <div
  class="detail-toggle-head t-labels"
  data-open="▽ 読了履歴"
  data-close="▶︎ 読了履歴"
  onclick="
    togglesSection(
      'open-book-read-history',
      this
    )
  "
>
  ${
    detailSections.readHistory
      ? "▽"
      : "▶︎"
  }
  読了履歴
</div>

<div
  class="
    toggle-content detail-inner-scroll
    ${detailSections.readHistory ? "open" : ""}
  "
  id="open-book-read-history"
>
  <div class="date-history-grid">
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
  </div>
</div>
      
      
      
      
      
      
      <div
        class="detail-toggle-head t-labels"
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
   
   
   <div class="
  toggle-content
  ${detailSections.series ? "open" : ""}
"
id="open-book-series">
  
        <input class="input-common"
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
    
    <div class="detail-series-area">
     <div class="detail-label">
    関連：
     </div>

    <div id="book-edit-series" class="series-edit-list"></div>
    </div>
   
   </div>
      
      
      
		
			<div
  class="detail-toggle-head t-labels"
  data-open="▽タグ非表示"
  data-close="▶︎タグ表示"
  onclick="
    togglesSection(
      'open-book-tags',
      this
    )
  "
>
  ${detailSections.tags ? "▽タグ非表示" : "▶︎タグ表示"}
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
  
</div>
      
      
      <div
  class="detail-toggle-head t-labels"
  data-open="▽ 管理タグ（${hiddenTagIds.length}）"
  data-close="▶︎ 管理タグ（${hiddenTagIds.length}）"
  onclick="
    togglesSection(
      'open-book-hidden-tags',
      this
    )
  "
>
  ▶︎ 管理タグ（${hiddenTagIds.length}）
</div>

<div
  class="
    toggle-content
    ${detailSections.hiddenTags ? "open" : ""}
  "
  id="open-book-hidden-tags"
>

  <div class="hidden-tag-input-area">
    <input
      class="input-common"
      id="hidden-tag-input-${book.id}"
      type="text"
      placeholder="管理タグを追加"
      oninput="renderHiddenTagSuggest('${book.id}')"
      onkeydown="
        if(event.key==='Enter'){
          addHiddenTag('${book.id}', this.value);
        }
      "
    >
  </div>

  <div
    id="hidden-tag-suggest-${book.id}"
    class="hidden-tag-suggest"
  ></div>

  ${
    hiddenTagIds.length
      ? `
        <div class="hidden-tag-area">
          <div class="hidden-tag-list selected-hidden-tags">
            
            ${
              hiddenTagIds.map(tagId=>{

                const tag =
                  tagMaster.find(t =>
                    String(t.id) === String(tagId)
                  );

                if(!tag) return "";

                const isRemoveReady =
                  pendingHiddenTagRemove ===
                  `${book.id}-${tag.id}`;

                return `
                  <span
                    class="
                      hidden-tag-chip
                      ${isRemoveReady ? "remove-ready" : ""}
                    "
                    onclick="
                      confirmRemoveHiddenTag(
                        '${book.id}',
                        '${tag.id}'
                      )
                    "
                  >
                    ${
                      isRemoveReady
                        ? `削除？ ${tag.name}`
                        : tag.name
                    }
                  </span>
                `;
              }).join("")
            }
          </div>

        </div>
      `
      : ""
  }

</div>


<div
  class="detail-toggle-head t-labels"
  data-open="▽ 引用メモ（${book.quotes.length}）"
  data-close="▶︎ 引用メモ（${book.quotes.length}）"
  onclick="
    togglesSection(
      'open-book-quotes',
      this
    )
  "
>
  ▶︎ 引用メモ（${book.quotes.length}）
</div>

<div
  class="
    toggle-content
    ${detailSections.quotes ? "open" : ""}
  "
  id="open-book-quotes"
>

  <div class="quote-add-box">

  <textarea
    id="quote-text-${book.id}"
    class="input-common quote-textarea yohaku10"
    placeholder="引用文"
  ></textarea>

  <input
    id="quote-memo-${book.id}"
    class="input-common yohaku10"
    placeholder="メモ（章・書写用など）"
  >

  <button
    class="btn-sub yohaku15"
    onclick="addQuoteToBook('${book.id}')"
  >
    ＋引用を追加
  </button>

</div>

<div class="quote-list">
  ${
    book.quotes.length
      ? book.quotes.map(q=>`
        <div class="quote-card yohaku10">
          <div class="quote-head">

  <button
    class="quote-fav-btn"
    onclick="
      toggleQuoteFavorite(
        '${book.id}',
        '${q.id}'
      )
    "
  >
    ${q.favorite ? "⭐" : "☆"}
  </button>
<button
  class="quote-delete-btn"
  onclick="
    deleteQuoteFromBook(
      '${book.id}',
      '${q.id}'
    )
  "
>
  🗑
</button>

<button
  class="quote-edit-btn"
  onclick="
    event.stopPropagation();
    openQuoteEditModal(
      '${book.id}',
      '${q.id}'
    );
  "
>
  ✏️
</button>

</div>



  <div class="quote-text">
    ${q.text}
  </div>



          ${
            q.memo
              ? `<div class="quote-memo">${q.memo}</div>`
              : ""
          }
        </div>
      `).join("")
      : `<div class="empty-note">引用はまだありません</div>`
  }
</div>

</div>
</div>

<div class="detail-modal-footer">
      <hr class="kugiri">


		<div class="actions-row">
      
      <button class="danger-btn btn-danger"
        onclick="deleteBook('${book.id}')">
        🗑 削除
      </button>
      
      <button onclick="duplicateBook('${book.id}')">
  📄 複製
</button>
      
      <button class="btn-main" onclick="saveDetail('${book.id}')">
        🪎 保存
      </button>
      
    </div>
      
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
	
	const bookCount =
  newSeriesBookIds.length;

const characterCount =
  newSeriesCharacterIds.length;
	
	modal.innerHTML = `
		<div class="modal-box fixed-scroll-modal book-detail-modal">
		<div class="detail-modal-head">
		 <div class="flex-between">
					<span class="left-yose">シリーズを追加</span>
						<button class="btn-sub right-yose" onclick="closeModal('add-series-modal')">✖️</button></div>
			
			<input
  class="input-common"
  id="add-series-title"
  type="text"
  placeholder="シリーズタイトル"
  oninput="renderSeriesTitleSuggest()"
>
</div>


<div class="fixed-scroll-body">

<div id="series-title-suggest"></div>
			
			
			
			
				<div class="left-yose">関連登録</div>
				<input class="input-common input-small"
				 id="series-for-one"
					type="text"
					placeholder="作品／人物を追加"
					oninput="renderSeriesNewBookSuggest();
						renderSeriesNewCharacterSuggest();">
				
				
				
				<div class="suggest-box">
					<div id="series-book-suggest"></div>
					<div id="series-character-suggest"></div>
				</div>
				
				
				
				
      <div
      class="toggle-head t-labels"
      data-open="▽関連作品(${bookCount})"
      data-close="▶︎関連作品(${bookCount})"
      onclick="
        togglesSection(
        'series-new-books',
        this
      )
    "
  >▶︎関連作品(${bookCount})</div>
      
     <div id="series-new-books"
       class="
         toggle-content
         series-edit-list
       "></div>
      
      
      <div
      class="toggle-head t-labels"
      data-open="▽関連人物(${characterCount})"
      data-close="▶︎関連人物(${characterCount})"
      onclick="
        togglesSection(
        'series-new-characters',
        this
      )
    "
  >▶︎関連人物(${characterCount})</div>

     <div id="series-new-characters"
       class="
         toggle-content
         series-edit-list
       "></div>
       </div>
				
			<div class="detail-modal-footer">
			     <hr class="kugiri">
     			 <button class="btn-main" style="width:100%" onclick="saveNewSeries()">➕追加</button></div>
			
			
			
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
  [...new Set(
    (series.bookIds || []).map(String)
  )];

editingSeriesCharacterIds =
  [...new Set(
    (series.characterIds || []).map(String)
  )];
    
    
  const bookCount =
  editingSeriesBookIds.length;

const characterCount =
  editingSeriesCharacterIds.length;

  modal.className = "modal-bg";
  modal.id = "edit-series-modal";

  modal.innerHTML = `
    <div class="modal-box fixed-scroll-modal book-detail-modal">
      <div class="detail-modal-head">
      <div class="flex-between">
      <span class="left-yose">シリーズ編集</span>
      <button onclick="closeModal('edit-series-modal')" class="btn-sub right-yose">✖️</button>
      </div>

      <input
        id="edit-series-name"
        class="input-title"
        value="${series.name || ""}"
      >
      </div>
      
      <div class="fixed-scroll-body">
     <div class="left-yose">関連登録</div>
      <input class="input-common"
        id="series-related-search"
        type="text"
        placeholder="作品／人物を追加"
        oninput="
          renderSeriesBookSuggest();
          renderSeriesCharacterSuggest();
        "
      >
<div class="suggest-box">

  <div id="series-book-suggest"></div>

  <div id="series-character-suggest"></div>

</div>
      
      
      
       <div
      class="toggle-head t-labels"
      data-open="▽関連作品(${bookCount})"
      data-close="▶︎関連作品(${bookCount})"
      onclick="
        togglesSection(
        'series-edit-books',
        this
      )
    "
  >
  ▶︎関連作品(${bookCount})</div>
      
      <div id="series-edit-books"
       class="
         toggle-content
         series-edit-list
       "></div>
      
       <div
      class="toggle-head t-labels"
      data-open="▽関連人物(${characterCount})"
      data-close="▶︎関連人物(${characterCount})"
      onclick="
        togglesSection(
        'series-edit-characters',
        this
      )
    "
  >▶︎関連人物(${characterCount})</div>
      
      
     <div id="series-edit-characters"
       class="
         toggle-content
         series-edit-list
       "></div>
       </div>
       
     <div class="detail-modal-footer">
     <hr class="kugiri">

    <div class="actions-row">
    
    
      <button class="btn-danger" onclick="deleteSeries('${series.id}')">
       🗑️ 削除
      </button>
    
      <button class="btn-main"
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
// シリーズ詳細 2026/06/15移植開始
//==============================
function openSeriesDetailModal(s){

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

  const modal = document.createElement("div");

  modal.className = "modal-bg";
  modal.id = "series-detail-modal";

  modal.innerHTML = `
    <div class="modal-box fixed-scroll-modal series-detail-modal">

      <div class="modal-header">
        <div class="flex-between yohaku10">
        <button
          class="btn-sub"
          onclick="openSeriesEditModal('${s.id}')"
        >
          ✏️ 編集
        </button>
        
        <button
          class="btn-sub"
          onclick="closeModal('series-detail-modal')"
        >
          ✖️
        </button>
        </div>
          <div class="input-title yohaku15">${s.name}</div>
          
        </div>
      

      <div class="fixed-scroll-body">

        <div class="series-section yohaku10">
          <div
            class="series-section-title"
            onclick="
              seriesSections.books =
                !seriesSections.books;

              closeModal('series-detail-modal');

              openSeriesDetailModal(
                seriesMaster.find(x =>
                  String(x.id) === String('${s.id}')
                )
              );
            "
          >
            ${seriesSections.books ? "▽" : "▶︎"} 関連作品
          </div>

          ${
            seriesSections.books
              ? `<div id="modal-series-books"></div>`
              : ""
          }
        </div>

        <div class="series-section">
          <div
            class="series-section-title"
            onclick="
              seriesSections.chars =
                !seriesSections.chars;

              closeModal('series-detail-modal');

              openSeriesDetailModal(
                seriesMaster.find(x =>
                  String(x.id) === String('${s.id}')
                )
              );
            "
          >
            ${seriesSections.chars ? "▽" : "▶︎"} 関連人物
          </div>

          ${
            seriesSections.chars
              ? `<div id="modal-series-chars"></div>`
              : ""
          }
        </div>

      </div>

      <div class="modal-footer">
      <hr class="kugiri yohaku15">
      <div class="satu yohaku10">登録：${relatedBooks.length}冊</div>
      
      </div>

    </div>
  `;

  document.body.appendChild(modal);

  const list =
    document.getElementById("modal-series-books");

  if(list){
    relatedBooks.forEach(b=>{

      const d = document.createElement("div");

      const latestDate =
        getLatestReadDate(b);

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

  const list2 =
    document.getElementById("modal-series-chars");

  if(list2){
    if(!relatedCharacters.length){
      list2.innerHTML =
        `<div style="color:gray;">（人物なし）</div>`;
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
		<div class="modal-box detail-modal">
			<div class="detail-modal-header">
			 <div class="flex-between">
			<span class="left-yose">人物を追加</span>
					<button onclick="closeModal('add-chars-modal')" style="margin-left:auto;" class="btn-sub">✖️</button></div>
			
			<input class="input-title"
				id="add-chars-name"
				type="text"
				placeholder="人物名">
				</div>
				
				<div class="detail-modal-body">
				<div class="mini-text">メモ</div>
				<textarea class="textarea-common" id="add-chars-memo"
				placeholder="メモ"></textarea>
				
				
			<div class="mini-text">関連シリーズを登録</div>
			
		
			<input class="input-common"
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
				
				<div class="left-yose mini-text">
				関連シリーズ</div>
			<div id="add-character-series-list" class="series-edit-list detail-row"></div>
			</div>
			
			<div class="detail-modal-footer">
			     <hr class="kugiri">
			
			<button onclick="saveNewCharacter()" class="btn-main">➕追加</button>
			
	
		</div></div>
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
		<div class="detail-modal-header flex-between">
			<input id="character-name" class="input-title"
			value="${c.name || ""}">
						<button style="margin-left:auto;" onclick="closeModal('open-chars-modal')" class="btn-sub">✖️</button></div>
			
			<div class="detail-modal-body">
			<div class="left-yose">メモ</div>
			<textarea class="textarea-common" id="character-memo">${c.memo || ""}</textarea>
		
		
      ${relatedSeries.map(s=>`
        <button class="detail-series left-yose"
				  onclick="
				    closeModal('open-chars-modal');
				    openSeriesById('${s.id}');
				  "
				>
 				 ${s.name}
				</button>
      `).join(", ") || ""}
    
    
    <div class="left-yose">関連シリーズを追加</div>
   <input class="input-common"
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
    <div class="left-yose mini-text">関連シリーズ</div>
    
    <div id="character-edit-series" class="series-edit-list detail-row"></div>
    </div>
    
    <div class="detail-modal-footer">
         <hr class="kugiri">
		
		<div class="actions-row">
			<button onclick="deleteCharacter('${c.id}')" class="btn-danger">
  🗑️ 削除
</button>
			<button onclick="saveCharacter('${c.id}')" class="btn-main">🪎 保存</button>
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


//==============================
// 引用メモ表示専用モーダル
//==============================

function openQuoteViewModal(bookId, quoteId){

  const book =
    books.find(b =>
      String(b.id) === String(bookId)
    );

  if(!book || !Array.isArray(book.quotes)) return;

  const quote =
    book.quotes.find(q =>
      String(q.id) === String(quoteId)
    );

  if(!quote) return;

  const modal =
    document.createElement("div");

  modal.className = "modal-bg";
  modal.id = "quote-view-modal";

  modal.innerHTML = `
    <div class="modal-box quote-view-modal">

      <div class="modal-header flex-between">
        <button
          class="btn-sub"
          onclick="
            quoteViewMode =
              quoteViewMode === 'vertical'
                ? 'horizontal'
                : 'vertical';
                
            localStorage.setItem(
              'quoteViewMode',
              quoteViewMode
            );

            closeModal('quote-view-modal');

            openQuoteViewModal(
              '${bookId}',
              '${quoteId}'
            );
          "
        >
          ${
            quoteViewMode === "vertical"
              ? "横書き"
              : "縦書き"
          }
        </button>

        <button
          class="btn-sub"
          onclick="closeModal('quote-view-modal')"
        >
          ✖️
        </button>
      </div>

      <div
        class="
          quote-view-text
          ${
            quoteViewMode === "vertical"
              ? "vertical"
              : "horizontal"
          }
        "
      >
        ${quote.text || ""}
      </div>

      ${
        quote.memo
          ? `
            <div class="quote-view-memo">
              ${quote.memo}
            </div>
          `
          : ""
      }

    </div>
  `;

  document.body.appendChild(modal);
}


//==============================
// モーダルリレー対策：モーダル閉じるやつ
//==============================
function closeDetailModals(){

  [
    "open-book-modal",
    "series-detail-modal",
    "edit-series-modal",
    "series-edit-modal",
    "character-modal",
    "quote-view-modal",
    "quote-edit-modal"
  ].forEach(id=>{
    closeModal(id);
  });

}