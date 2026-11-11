//==============================
// MODAL : 自分用 ★共通化済
//
// syncに統一するもの：初期評価、評価の表示処理、本詳細からのシリーズ作成処理、SA版にある保護処理のスペルミス、SA版のHTML構造など
//
//
//  モーダル関係の処理を集めろぉ！
//==============================


//非表示タグの削除用変数
let pendingHiddenTagRemove = null;
let newBookHiddenTagIds = [];

//デイリータグ編集用
let editingDailyLogDate = null;
let editingDailyLogTags = [];

//本詳細の簡易マニュアル用トグル
const helpSections = {
  seriesHelp: !localStorage.getItem("seriesHelpSeen"),
  readDateHelp: !localStorage.getItem("readDateHelpSeen")
};

//本詳細タブの状態保存
let currentBookDetailTab = "tags";


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
  newBookFav = 2;
  newBookHiddenTagIds = [];

  const modal = document.createElement("div");
  modal.className = "modal-bg";
  modal.id = "add-book-modal";

  modal.innerHTML = `
    <div class="modal-box fixed-scroll-modal">
    
    <div class="detail-modal-header">
    
 <div class="flex-between yohaku10">
         <span>本を追加</span>
         ${renderCloseButton("add-book-modal")}</div>


      <input class="input-title migi-ake yohaku10"
       id="add-title"
        type="text"
        placeholder="タイトル"
        oninput="renderTitleSuggest()"
        >
        
        
      <div id="title-suggest"></div>
      
      
      
      <div class="detail-row yohaku10">
      <input class="input-title migi-ake"
        id="add-subtitle"
        type="text"
        placeholder="サブタイトル（任意）"
      >


<div class="detail-row">
  <button
    type="button"
    id="new-book-protect"
    class="detail-status-btn protect-btn migi-ake
      ${enableProtect ? "active" : ""}"
    onclick="this.classList.toggle('active')"
    title="保護"
  >
    ${getProtectIcon()}
  </button>

  <button
    type="button"
    id="new-book-reread"
    class="detail-status-btn reread-btn"
    onclick="this.classList.toggle('active')"
    title="再読"
  >
    ${getRereadIcon()}
  </button>
</div>

      
      </div>
      
      
      <div class="flex-between yohaku15">
   
      <div class="detail-row left-yose">
        <div class="label-text">読了日：</div>

        <input
  type="date"
  id="add-date"
  class="input-common input-small">

<button
  class="btn-sub hidari-ake"
  onclick="
    document.getElementById(
      'add-date'
    ).value=getTodayLocal();
  "
>
今日
</button>

<button
  class="btn-sub hidari-ake"
  onclick="
    document.getElementById(
      'add-date'
    ).value='';
  "
>
クリア
</button>
</div>
        
	  			<button
				  type="button"
				  id="new-book-fav-btn"
				  class="fav-cycle-btn"
			  		onclick="cycleNewBookFav()"
				>
				      ${getFavIcon(newBookFav)}
				</button>

        
      </div>
      </div>
      
      
      <div class="fixed-scroll-body">
      
      
            ${enableMemo ? `
      <input type="text" class="input-common yohaku15" id="add-memo"
        placeholder="メモ">` : ""}

      
    <div class="t-labels">
  関連シリーズ
</div>

     <div id="add-book-series" class="yohaku15">
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
  
  
  
  
     <div class="t-labels">
  タグ表示
</div>
  
  
<div id="add-book-tags" class="yohaku15">
			
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
							${isActive ? tag.color : 'var(--color-card)'};
						color:
							${isActive ? 'var(--color-card)' : 'var(--color-text)'};
						border:
							1px solid ${tag.color};
					"
				>
				${tag.name}
			</span>
			
		`;

	}).join("")}	
			</div>
			

	
	<div class="t-labels">
  管理タグ（${newBookHiddenTagIds.length}）
</div>

<div id="add-book-hidden-tags" class="yohaku15">

  

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
  
<div class="hidden-tag-area">
<div
    id="add-book-hidden-tag-list"
    class="hidden-tag-list selected-hidden-tags"
  ></div>
  </div>
</div>
      
      
   <!-- 今の新規本用 管理タグ入力・選択済み・サジェスト -->

</div>   
</div>
      
      <div class="detail-modal-footer">
      <hr class="kugiri">

 
        <button onclick="saveNewBook()" class="btn-main" style="width:100%">
          ＋保存
        </button>
            </div>
            </div>
  `;

  document.body.appendChild(modal);
  
  document.getElementById("add-date").value =
  getTodayLocal();
  
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

  <div class="book-detail-header-layout">

    <input
      id="detail-title"
      class="input-title"
      value="${book.title || ""}"
    >

    ${renderCloseButton("open-book-modal")}

    <input
      class="input-common"
      id="edit-subtitle"
      type="text"
      value="${book.subtitle || ""}"
      placeholder="サブタイトル（任意）"
    >

    <div class="book-detail-volume">
      <input
        class="input-common volume-input"
        id="detail-volume"
        type="number"
        min="0"
        value="${book.volume || ""}"
        placeholder="巻数"
      > 巻
    </div>

    <div class="book-detail-checks">

  <button
    type="button"
    class="detail-status-btn protect-btn ${book.protect ? "active" : ""}"
    onclick="toggleProtect('${book.id}')"
    title="保護"
  >
    ${getProtectIcon()}
    <span>保護</span>
  </button>

  <button
    type="button"
    class="detail-status-btn reread-btn ${book.reread ? "active" : ""}"
    onclick="toggleReread('${book.id}')"
    title="再読"
  >
    ${getRereadIcon()}
    <span>再読</span>
  </button>

</div>

  </div>

  <div class="book-detail-header-series">
    <div class="detail-series-area">
      ${relatedSeries.map(s=>`
        <button class="detail-series"
          onclick="
            closeModal('open-book-modal');
            openSeriesById('${s.id}');
          "
        >
          ${s.name}
        </button>
      `).join("")}
    </div>
  </div>

</div>



    
<div class="fixed-scroll-body">

  <div class="book-detail-layout">

    <!-- 左カラム：基本情報 -->
    <div class="book-detail-left">

    <div class="book-status-area yohaku15">
      <div class="flex-between yohaku15">
       
       <!--本の状態：SVGアイコン-->
       <span class="book-status-label ${book.type === "wish" ? "wish" : "shelf"}">
  ${getBookStatusIcon(book.type)}
  ${book.type === "wish" ? "ウィッシュ" : "本棚"}
</span>

  
     <div class="detail-fav-wrap">

       <button
         class="fav-cycle-btn"
         onclick="cycleFav('${book.id}')">
           ${getFavIcon(book.fav || 0)}
       </button>

        </div>
      </div>
      
      
   <div class="detail-row">
    <div class="book-stat yohaku15">
    
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
      
    <div class="read-date-controls yohaku15">
    <div class="left-yose">
       <input type="date" id="readDate-${book.id}" class="input-common input-small white-input">
      <button onclick="addReadDate('${book.id}')" style="margin-left:5px;">
       ＋追加
      </button>
      </div>
      
      <div class="right-yose">
      <button
  class="btn-sub hidari-ake"
  onclick="
    document.getElementById(
      'readDate-${book.id}'
    ).value = getTodayLocal();
  "
>
  今日
</button>
<button
  class="btn-sub hidari-ake"
  onclick="
    document.getElementById(
      'readDate-${book.id}'
    ).value = '';
  "
>
  クリア
</button>
      </div>
    </div>
   
   
    <details
  class="series-help-popover"
  ontoggle="positionSeriesHelp(this)"
>
  <summary>？</summary>

  <div class="setting-note">
    日付を選択したあと<u>【＋追加】を押すと、読了履歴へ登録</u>されます。<br>

    最初は今日の日付が自動で入力されていますが、<u>保存を押すだけでは登録されません。</u><br>
    また、日付を変更しただけでも登録されません。<br>
    <br>
    【クリア】を押すと日付が空欄になり、【今日】を押すと今日の日付が入ります。
  </div>
</details>
    
     </div>
    </div>

    <!-- 右カラム：詳細情報 -->
    <div class="book-detail-right">
      
      <div class="yohaku10"> </div>
      
      <!-- 本詳細タブ -->
<div class="book-detail-tabs">
  <button
    class="book-detail-tab active"
    onclick="switchBookDetailTab('tags')"
  >
    🏷 タグ
  </button>

  <button
    class="book-detail-tab"
    onclick="switchBookDetailTab('records')"
  >
    📚 関連・履歴
  </button>

  <button
    class="book-detail-tab"
    onclick="switchBookDetailTab('quotes')"
  >
    ✏️ 引用
  </button>
</div>
      
      
      
      <div class="book-detail-tab-panel" data-tab="records">

  <!-- シリーズ化 -->
  <div class="book-detail-series-create">
    <button class="plus-btn"
      onclick="openAddSeriesModal('${book.id}')"
    >
      📚 シリーズ化
    </button>

    <details
      class="series-help-popover"
      ontoggle="positionSeriesHelp(this)"
    >
      <summary>？</summary>
      <div class="setting-note">
        本の<u>タイトルから新しいシリーズを作成</u>できます。<br>
        作成時に<u>使用した本は、自動でシリーズへ登録</u>されます。<br>
        既存のシリーズを整理したい場合は、一度保存してから削除してください。
      </div>
    </details>
  </div>

  <!-- 読了履歴 -->
  <div class="detail-section-title">
    📖 読了履歴
  </div>

<div id="open-book-read-history">

  ${
    sortedDates.length <= 1
      ? `
        <div class="empty-history">
          ${
            sortedDates.length === 0
              ? "読了記録はまだありません。初回読了後から記録されます。"
              : "2回目以降の読了記録がここに追加されます。"
          }
        </div>
      `
      : `
        <div class="date-history-grid detail-inner-scroll">
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
      `
  }

</div>

  <!-- 関連シリーズ -->
  <div class="detail-section-title">
    📚 関連シリーズ
  </div>

  <input
    class="input-common"
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
      登録済み：
    </div>

    <div
      id="book-edit-series"
      class="series-edit-list"
    ></div>
  </div>

</div><!-- records -->
      
      

<div class="book-detail-tab-panel active" data-tab="tags">

  <!-- 表示タグ -->
  <div class="detail-section-title">
    🏷 表示タグ
  </div>

  <div id="open-book-tags" class="detail-tag-area">
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
                  ${isActive ? tag.color : 'var(--color-card)'};

                color:
                  ${isActive ? 'var(--color-card)' : 'var(--color-text)'};

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

  <!-- 管理タグ -->
  <div class="detail-section-title">
    🔖 管理タグ（${hiddenTagIds.length}）
  </div>

  <div id="open-book-hidden-tags">

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
        : `
          <div class="empty-history">
            管理タグはまだ登録されていません。
          </div>
        `
    }

  </div>

</div><!-- tags -->



<div class="book-detail-tab-panel" data-tab="quotes">

  <!-- 引用メモ -->
  <div class="detail-section-title">
    ✏️ 引用メモ（${book.quotes.length}）
  </div>

  <div id="open-book-quotes">

    <!-- 引用追加 -->
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

    <!-- 登録済み引用 -->
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

</div><!-- quotes -->


    </div><!-- book-detail-right -->

  </div><!-- book-detail-layout -->

</div><!-- fixed-scroll-body -->


<div class="detail-modal-footer">

  <hr class="kugiri">

  <div class="book-detail-footer-inner">

    <!-- メモ -->
    ${enableMemo ? `
      <div class="book-detail-memo-wrap">
        <textarea
          class="input-common"
          id="editMemo"
          rows="1"
          placeholder="メモ"
          onclick="this.classList.add('expanded')"
          onblur="this.classList.remove('expanded')"
        >${book.memo || ""}</textarea>
      </div>
    ` : ""}

    <!-- 操作ボタン -->
    <div class="book-detail-actions">

      <button class="danger-btn btn-danger"
        onclick="deleteBook('${book.id}')">
        🗑 削除
      </button>

      <button onclick="duplicateBook('${book.id}')">
        📄 複製
      </button>

      <button class="btn-main"
        onclick="saveDetail('${book.id}')">
        🪎 保存
      </button>

    </div>

  </div>
</div>

    </div><!--モーダル本体-->
  `;

    document.body.appendChild(modal);

  // 前回選択していたタブを復元
  switchBookDetailTab(currentBookDetailTab);

  const readInput =
    document.getElementById(
      `readDate-${book.id}`
    );

  if(readInput && !readInput.value){
    readInput.value = getTodayLocal();
  }

  renderBookEditSeries(
    "book-edit-series"
  );
}



//==============================
//シリーズ
//==============================


//==============================
//====シリーズ追加モーダル
//==============================
function openAddSeriesModal(
  initialBookId = null
){

  newSeriesBookIds = [];

  let initialTitle = "";

  if(initialBookId){

    const book =
      books.find(
        b => String(b.id) === String(initialBookId)
      );

    if(book){
      initialTitle = book.title || "";
    }

    newSeriesBookIds = [
      String(initialBookId)
    ];

  }

  newSeriesCharacterIds = [];

	const modal = document.createElement("div");
	modal.className = "modal-bg";
	modal.id = "add-series-modal";
	
	const bookCount =
  newSeriesBookIds.length;

const characterCount =
  newSeriesCharacterIds.length;
	
	modal.innerHTML = `
		<div class="modal-box fixed-scroll-modal">
		<div class="detail-modal-head">
		 <div class="flex-between yohaku10">
					<span class="left-yose">シリーズを追加</span>
						${renderCloseButton("add-series-modal")}</div>
			
			<input
  class="input-common yohaku10"
  id="add-series-title"
  type="text"
  value="${initialTitle}"
  placeholder="シリーズタイトル"
  oninput="renderSeriesTitleSuggest()"
>

<div class="detail-row yohaku15">
<label class="protect-check right-yose">
  <input
    id="new-series-protect"
    type="checkbox"
    ${enableProtect ? "checked" : ""}
  >
  ${getProtectIcon()} 保護
</label>
</div>
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
     			 <button class="btn-main" style="width:100%" onclick="saveNewSeries()">＋追加</button></div>
			
			
			
`;
	document.body.appendChild(modal);
	
renderSeriesEditBooks(
  "series-new-books"
);

renderSeriesEditCharacters(
  "series-new-characters"
);
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

  closeModal("series-detail-modal"); // ←追加
  
  const seriesTitle =
  (series.name || "").trim();

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
    <div class="modal-box fixed-scroll-modal">
      <div class="detail-modal-head">
      <div class="flex-between yohaku10">
      <span class="left-yose">シリーズ編集</span>
      ${renderCloseButton("edit-series-modal")}
      </div>

      <input
        id="edit-series-name"
        class="input-title yohaku10"
        value="${series.name || ''}"
      >
<div class="detail-row yohaku15">
<label class="protect-check right-yose">
  <input
    type="checkbox"
    id="protect-series-check"
    ${series.protect === true ? "checked" : ""}
    onchange="toggleSeriesProtect('${series.id}')"
  >
  ${getProtectIcon()} 保護
</label>
</div>

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
// 初期表示ではシリーズタイトルを検索語として使用
renderSeriesBookSuggest(seriesTitle);
renderSeriesCharacterSuggest(seriesTitle);

}


//==============================
// シリーズ詳細 2026/06/15移植開始
//==============================
function openSeriesDetailModal(s){

  const relatedBooks = books
  .filter(b =>
    (s.bookIds || [])
      .map(String)
      .includes(String(b.id))
  )
  .sort((a,b)=>
    getVolumeNumber(a) -
    getVolumeNumber(b)
  );
  
  const registeredBookIds =
  new Set(
    (s.bookIds || []).map(String)
  );

const similarUnregisteredBooks =
  enableSimilarBookNotice
    ? books.filter(b => {

        if(
          registeredBookIds.has(
            String(b.id)
          )
        ){
          return false;
        }

        return isSimilarSeriesBook(
          s.name,
          b.title
        );

      })
    : [];
  

//人物ミニリストのソート（固定）
  const personOrder = {
  author: 1,
  illustrator: 2,
  original: 3,
  character: 4
};

const relatedCharacters = characters
  .filter(c =>
    (s.characterIds || [])
      .map(String)
      .includes(String(c.id))
  )
  .sort((a, b) =>
    (personOrder[a.personType] || 999) -
    (personOrder[b.personType] || 999)
  );

  const modal = document.createElement("div");

  modal.className = "modal-bg";
  modal.id = "series-detail-modal";

  modal.innerHTML = `
    <div class="modal-box fixed-scroll-modal series-detail-modal">

      <div class="modal-header">
        <div class="flex-between yohaku10">
        <button
  class="btn-sub ${
    similarUnregisteredBooks.length
      ? "similar-book-notice"
      : ""
  }"
  onclick="openSeriesEditModal('${s.id}')"
>
  ✏️ ${
    similarUnregisteredBooks.length
      ? "編集（類似本あり）"
      : "編集"
  }
</button>
        
       ${renderCloseButton("series-detail-modal")}
        </div>
          <div class="input-title yohaku15">${s.name}</div>
          
        </div>
      

<div class="fixed-scroll-body">

  <!-- タブ -->
  <div class="series-detail-tabs">
    <button
      class="series-detail-tab active"
      onclick="switchSeriesDetailTab('books')"
    >
      📚 関連作品
    </button>

    <button
      class="series-detail-tab"
      onclick="switchSeriesDetailTab('chars')"
    >
      👤 関連人物
    </button>
  </div>

  <!-- 関連作品 -->
  <div id="series-tab-books">

    <div id="modal-series-books"></div>

  </div>

  <!-- 関連人物 -->
  <div id="series-tab-chars" style="display:none;">

    <div class="detail-row yohaku10">
      <button
        class="add-btn right-yose migi-ake"
        onclick="
          openAddCharacterModal(
            null,
            'author',
            '${s.id}'
          );
        "
      >
        ＋📖著者
      </button>

      <button
        class="add-btn migi-ake"
        onclick="
          openAddCharacterModal(
            null,
            'illustrator',
            '${s.id}'
          );
        "
      >
        ＋🖼️絵
      </button>
    </div>

    <div id="modal-series-chars"></div>

  </div>

</div>


      <div class="modal-footer">
      <hr class="kugiri yohaku15">
      <div class="satu yohaku10">登録：${relatedBooks.length}冊</div>
      
      </div>

    </div>
  `;

  document.body.appendChild(modal);

  renderSeriesMiniBooks(s);

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

d.innerHTML = `
  <div class="detail-row flex-between">
    <span>${c.name}</span>

    <div class="character-type-chip">
      ${getPersonTypeLabel(c.personType)}
    </div>
  </div>
`;

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
function openAddCharacterModal(
  character = null,
  initialType = "character",
  initialSeriesId = null
){

  editingCharacterSeriesIds = [];

	const modal = document.createElement("div");
	modal.className = "modal-bg";
	modal.id = "add-chars-modal";
	
	modal.innerHTML = `
		<div class="modal-box detail-modal">
			<div class="detail-modal-header">
			 <div class="flex-between yohaku10">
			<span class="left-yose">人物を追加</span>
					${renderCloseButton("add-chars-modal")}</div>
			
			<input class="input-title"
				id="add-chars-name"
				type="text"
				placeholder="人物名">
				
				
				<div class="detail-row yohaku15">
<label class="protect-check right-yose">
  <input
    id="new-characters-protect"
    type="checkbox"
    ${enableProtect ? "checked" : ""}
  >
  ${getProtectIcon()} 保護
</label>
</div>
				
				
				</div>
				
				<div class="detail-modal-body">
				<div class="mini-text">メモ</div>
				<textarea class="textarea-common" id="add-chars-memo"
				placeholder="メモ"></textarea>
				
				<div class="mini-text">種類</div>
				
				<select
				  id="add-person-type"
				  class="input-common">
				  
				  <option value="character">登場人物</option>
				  <option value="author">著者</option>
				  <option value="illustrator">イラスト</option>
				  <option value="original">原作者</option>
				 
				</select>
				
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
			
			<button onclick="saveNewCharacter()" class="btn-main right-yose">＋追加</button>
			
	
		</div></div>
	`;

	document.body.appendChild(modal);

// 種類の初期値
document.getElementById("add-person-type").value =
  initialType || "character";

// 関連シリーズの初期値
if(initialSeriesId){

  editingCharacterSeriesIds = [
    String(initialSeriesId)
  ];

}

// 最後に一覧を描画
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
		<div class="detail-modal-header">
		  <div class="flex-between yohaku10">
			<input id="character-name" class="input-title"
			value="${c.name || ""}">
						${renderCloseButton("open-chars-modal")}
			
			</div>
			
			<div class="detail-row yohaku15">
      ${relatedSeries.map(s=>`
        <button class="detail-series left-yose"
				  onclick="
				    closeModal('open-chars-modal');
				    openSeriesById('${s.id}');
				  "
				>
 				 ${s.name}
				</button>
      `).join(", ") || ""}</div>

<div class="detail-row yohaku15">
<label class="protect-check right-yose">
  <input
    type="checkbox"
    id="protect-characters-check"
    ${c.protect === true ? "checked" : ""}
    onchange="toggleCharactersProtect('${c.id}')"
  >
  ${getProtectIcon()} 保護
</label>
</div>


</div>
			
			<div class="detail-modal-body yohaku15">
			<div class="left-yose">メモ</div>
			<textarea class="textarea-common" id="character-memo">${c.memo || ""}</textarea>
		
				<div class="left-yose">種類</div>
				
				<select
				  id="character-person-type"
				  class="input-common yohaku15">
				  
				  <option value="character">登場人物</option>
				  <option value="author">著者</option>
				  <option value="illustrator">イラスト</option>
				  <option value="original">原作者</option>
				 
				</select>
		
		
    
    
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
	
	document.getElementById("character-person-type").value =
  c.personType ?? "character";
}





//==============================
//統計
//==============================


//==============================
//カレンダーの日モーダル設定====
//==============================
function openDayModal(dateStr, list, logs = []){
  const m = document.createElement("div");
  m.className = "day-modal-overlay";
  m.style.position = "fixed";
  m.style.top = 0;
  m.style.left = 0;
  m.style.right = 0;
  m.style.bottom = 0;
  m.style.background = "rgba(0,0,0,0.5)";
  m.style.display = "flex";
  m.style.alignItems = "center";
  m.style.justifyContent = "center";
  m.style.color = "var(--color-text)";

const box = document.createElement("div");

box.style.background = "var(--color-card)";
box.style.padding = "20px";
box.style.maxHeight = "80%";
box.style.overflow = "auto";
box.style.borderRadius = "12px";
box.style.minWidth = "200px";


// タイトル
const header =
  document.createElement("div");

header.className =
  "day-modal-header";


const title =
  document.createElement("h3");

title.textContent = dateStr;


if(editingDailyLogDate !== dateStr){

  const editBtn =
    document.createElement("button");

  editBtn.className =
    "btn-sub";

  editBtn.textContent =
    "編集";

  editBtn.onclick = ()=>{

    startDailyLogEdit(
      dateStr,
      list,
      logs
    );

  };


header.appendChild(title);
  header.appendChild(editBtn);

}


box.appendChild(header);

// デイリーログ表示
if(logs.length){

  const logBox =
    document.createElement("div");

  logBox.className =
    "day-log-section";

  logBox.innerHTML = `
    <div class="flex-between">
      <h4>デイリーログ</h4>
    </div>

    <div class="day-log-chip-row">
      ${
        logs.map(id=>{

          const tag =
            tagMaster.find(t =>
              String(t.id) === String(id)
            );

          return tag
            ? `
              <span
                class="day-log-chip"
                style="background:${tag.color}"
              >
                ${tag.name}
              </span>
            `
            : "";

        }).join("")
      }
    </div>
  `;

  box.appendChild(logBox);

}

if(
  editingDailyLogDate === dateStr
){

  const editBox =
    document.createElement("div");

  editBox.className =
    "daily-log-edit-card";

  editBox.innerHTML = `
    <h4>デイリーログ編集</h4>

    ${
      tagMaster
        .filter(tag => tag.isDailyLog)
        .map(tag=>`

          <button
            class="
              tag-chip
              daily-edit-chip
              ${
                editingDailyLogTags.includes(tag.id)
                  ? "active"
                  : ""
              }
            "
            onclick="
              toggleEditDailyTag(
                '${tag.id}'
              )
            "
          >
            ${tag.name}
          </button>

        `).join("")
    }

    <div class="tag-page-actions">

      <button
        class="btn-main"
        onclick="saveDailyLogEdit()"
      >
        保存
      </button>

      <button
        class="btn-sub">
        キャンセル
      </button>

    </div>
  `;

  box.appendChild(editBox);


const cancelBtn =
  editBox.querySelector(".btn-sub");

cancelBtn.onclick = ()=>{

  editingDailyLogDate = null;
  editingDailyLogTags = [];

  document
    .querySelector(".day-modal-overlay")
    ?.remove();

  openDayModal(
    dateStr,
    list,
    logs
  );

};


}

// 読了本なしメッセージ
if(
  list.length === 0 &&
  logs.length === 0
){

  const empty =
  document.createElement("div");

empty.textContent =
  "この日の読了作品・ログはありません";

empty.className =
  "day-empty-message";

box.appendChild(empty);

  box.appendChild(empty);

}


// 本一覧
list.forEach(b=>{

  const d =
    document.createElement("div");

  d.style.padding = "6px 0";
  d.style.borderBottom = "1px solid var(--color-border-sub)";

  d.innerHTML = `
  <div class="day-book-title">
    ${b.title}
    ${
      b.volume
        ? ` ${b.volume}巻`
        : ""
    }
  </div>
`;

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

        ${renderCloseButton("quote-view-modal")}
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


/*==========
モーダル内タブ切り替え関数:本
==========*/
function switchBookDetailTab(tab){

  const modal = document.getElementById("open-book-modal");
  if(!modal) return;

  // 現在のタブを記憶
  currentBookDetailTab = tab;

  // ボタンの切り替え
  modal.querySelectorAll(".book-detail-tab").forEach(btn=>{
    const onclick = btn.getAttribute("onclick") || "";

    btn.classList.toggle(
      "active",
      onclick.includes(`'${tab}'`)
    );
  });

  // 内容の切り替え
  modal.querySelectorAll(".book-detail-tab-panel").forEach(panel=>{
    panel.classList.toggle(
      "active",
      panel.dataset.tab === tab
    );
  });
}


/*==========
モーダル内タブ切替関数：シリーズ
==========*/
function switchSeriesDetailTab(tab){

  const booksPanel =
    document.getElementById("series-tab-books");

  const charsPanel =
    document.getElementById("series-tab-chars");

  const tabs =
    document.querySelectorAll(
      ".series-detail-tab"
    );

  if(!booksPanel || !charsPanel) return;

  booksPanel.style.display =
    tab === "books" ? "" : "none";

  charsPanel.style.display =
    tab === "chars" ? "" : "none";

  tabs.forEach(btn => {
    btn.classList.toggle(
      "active",
      btn.getAttribute("onclick")
        .includes(tab)
    );
  });
}

/*=====
ヘルプポップオーバー調整
=====*/
function positionSeriesHelp(el){
  if(!el.open) return;

  const summary = el.querySelector("summary");
  const panel = el.querySelector(".setting-note");

  if(!summary || !panel) return;

  const rect = summary.getBoundingClientRect();

  const width = Math.min(240, window.innerWidth - 24);

  let left = Math.min(
    rect.left,
    window.innerWidth - width - 12
  );

  left = Math.max(12, left);

  let top = rect.bottom + 6;

  // 画面下にはみ出す場合は上側に表示
  if(top + panel.offsetHeight > window.innerHeight - 12){
    top = rect.top - panel.offsetHeight - 6;
  }

  panel.style.width = width + "px";
  panel.style.left = left + "px";
  panel.style.top = top + "px";
}


/*==========
シリーズモーダル内ミニカード：リアルタイム更新用
==========*/
function updateSeriesMiniBookStatus(book){

  const cards =
    document.querySelectorAll(
      ".mini-s-card[data-book-id]"
    );

  cards.forEach(card => {

    if(
      card.dataset.bookId !== String(book.id)
    ){
      return;
    }

    const title =
      card.querySelector(".mini-s-title");

    if(!title) return;

    title.innerHTML = `
      ${
        book.protect
          ? `<span class="book-status-icon protect-icon">
               ${getProtectIcon()}
             </span> `
          : ""
      }
      ${book.title}
      ${
        book.subtitle
          ? `<span class="book-subtitle">${book.subtitle}</span>`
          : ""
      }
      ${
        book.volume
          ? ` ${book.volume}`
          : ""
      }
      ${
        book.reread === true
          ? `<span class="book-status-icon reread-icon">
               ${getRereadIcon()}
             </span>`
          : ""
      }
    `;
  });
}


/*
シリーズのミニカード（本）リアルタイム追加用
*/

function renderSeriesMiniBooks(series){

  const list =
    document.getElementById("modal-series-books");

  if(!list) return;

  // 表示中のカードをいったん消す
  list.innerHTML = "";

  const relatedBooks = books
    .filter(b =>
      (series.bookIds || [])
        .map(String)
        .includes(String(b.id))
    )
    .sort((a,b)=>
      getVolumeNumber(a) -
      getVolumeNumber(b)
    );

  relatedBooks.forEach(b=>{

    const d = document.createElement("div");

    const latestDate =
      getLatestReadDate(b);

    d.className = "card mini-s-card";
    d.dataset.bookId = String(b.id);

    d.innerHTML = `
      <span class="mini-s-title">
        ${
          b.protect
            ? `<span class="book-status-icon protect-icon">
                 ${getProtectIcon()}
               </span> `
            : ""
        }
        ${b.title}
        ${
          b.subtitle
            ? `<span class="book-subtitle">${b.subtitle}</span>`
            : ""
        }
        ${b.volume ? ` ${b.volume}` : ""}
        ${
          b.reread === true
            ? `<span class="book-status-icon reread-icon">
                 ${getRereadIcon()}
               </span>`
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






