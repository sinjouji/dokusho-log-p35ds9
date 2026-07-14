//
// CHARACTERS 人物関連の処理ちゃんだぜええ
//  私用
//


//==============================
//◼️キャラクターホーム（骨組み）だけ
//==============================
function renderCharacters(){

  setActiveMenu("menu-characters");

  const el =
    document.getElementById(
      "page-characters"
    );

  if(!el) return;

  el.innerHTML = `
    <div id="characters-top"></div>
    <div id="characters-main" class="chars-main"></div>
  `;

  renderCharacterSearchArea();

  renderCharacterList();
}

//==============================
//====キャラクター一覧だけ表示====
//==============================
function renderCharacterList(){

	const main = document.getElementById("characters-main");
	if(!main) return;
	main.innerHTML = "";
	
const keyword =
  characterSearchKeyword.toLowerCase();

const filtered =
  characters.filter(c => {

    const relatedSeries =
      seriesMaster.filter(s =>
        (s.characterIds || [])
          .map(String)
          .includes(String(c.id))
      );

    const searchText = [

      c.name || "",

      getPersonTypeLabel(
        c.personType
      ) || "",

      ...relatedSeries.map(s => s.name)

    ].join(" ").toLowerCase();

    return searchText.includes(keyword);

  });
	
	//ソート
	const sorted = sortCharacters(filtered);

		sorted.forEach(c=>{
			const d = document.createElement('div');
			
			d.className = "card";
			
			
			const relatedSeries =
  seriesMaster.filter(s =>
    (s.characterIds || [])
      .map(String)
      .includes(String(c.id))
  );

d.innerHTML = `
<div class="character-list-top">
  <div class="character-list-name">
    ${c.protect ? "🔒" : ""}${c.name}
  </div>
  
  <div class="character-type-chip">
    ${getPersonTypeLabel(c.personType)}
  </div>
</div>

  ${
    relatedSeries.length
      ? `
        <div class="character-list-series">
          ${relatedSeries.map(s => s.name).join(" / ")}
        </div>
      `
      : ""
  }
`;
			d.onclick = ()=> openCharacterModal(c);

			main.appendChild(d);
		});

}



//==============================
//キャラクター検索エリア
//==============================
function renderCharacterSearchArea(){

	const top = document.getElementById("characters-top");
	if(!top) return;
	
	top.innerHTML = `
	
	<button onclick="openAddCharacterModal()"
		class="add-btn">
		＋ 人物
	</button>
	
	<input class="input-common"
		id="chars-search"
		placeholder="人物・種類で検索..."
		value="${characterSearchKeyword}"
		oninput="
		  characterSearchKeyword =
		    this.value.trim();
		  renderCharacterList();
		"
	>
	
	<span class="select-chip-wrap">
		<select id="characters-sort-select" class="select-chip"
			onchange="changeCharactersSortMode()">
			
		<option value="cname-asc">名前↓</option>
		<option value="cname-desc">名前↑</option>
		
		<option value="series-asc">シリーズ↓</option>
		<option value="series-desc">シリーズ↑</option>
		</select></span>
		
	
	`;
	
}








//==============================
//人物詳細編集の関連シリーズ一覧描画
//==============================
function renderCharacterEditSeries(
  targetId
){

  const target =
    document.getElementById(targetId);

  if(!target) return;

  const relatedSeries =
    seriesMaster.filter(s =>

      editingCharacterSeriesIds.includes(
        String(s.id)
      )

    );

  target.innerHTML = `

    <div>

      ${relatedSeries.map(s=>`

        <div class="related-chip">

          ${s.name}

          <button
            class="mini-delete-btn"
            onclick="
              removeSeriesFromCharacter(
                '${s.id}',
                '${targetId}',
                'character-related-search',
                'character-series-suggest'
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
//====キャラクター詳細の保存====
//==============================
async function saveCharacter(id){

  const chars =
    characters.find(
      c => String(c.id) === String(id)
    );

  if(!chars) return;

  chars.seriesIds =
    (editingCharacterSeriesIds || [])
      .map(String);

  seriesMaster.forEach(series=>{

    const shouldHaveCharacter =
      editingCharacterSeriesIds.includes(
        String(series.id)
      );

    if(shouldHaveCharacter){

      if(
        !(series.characterIds || [])
          .includes(String(chars.id))
      ){

        series.characterIds =
          (series.characterIds || []).concat(
            String(chars.id)
          );
      }

    }else{

      series.characterIds =
        (series.characterIds || [])
          .filter(characterId =>

            String(characterId)
            !== String(chars.id)

          );
    }
  });

  console.log(
    document.getElementById("character-name").value
  );

  chars.name =
    document.getElementById(
      "character-name"
    ).value;

  chars.memo =
    document.getElementById(
      "character-memo"
    ).value;
    
  chars.personType =
  document.getElementById("character-person-type").value;

  console.log("after edit", chars);

  await saveData();

  showToast("保存しました！");

  closeModal("open-chars-modal");

  renderCharacters();
}


//==============================
//詳細表示用
//==============================

function openCharacterById(id){

  const character =
    characters.find(c =>
      String(c.id) === String(id)
    );

  if(!character) return;

  openCharacterModal(character);
}


//==============================
//新規人物追加処理
//==============================
async function saveNewCharacter(){

  const name =
    document.getElementById(
      "add-chars-name"
    ).value.trim();

  if(!name){
    alert("名前を入力してね！");
    return;
  }

  const memo =
    document.getElementById(
      "add-chars-memo"
    )?.value || "";

  const character = {

    id:
      "ch" + Date.now(),

    name,
    
    personType:
      document.getElementById("add-person-type").value,

    seriesIds:
      editingCharacterSeriesIds.map(String),

    memo,

protect: document.getElementById(
  "new-characters-protect"
).checked

  };

  characters.unshift(character);

  seriesMaster.forEach(series=>{

    const shouldHaveSeries =
      editingCharacterSeriesIds.includes(
        String(series.id)
      );

    if(shouldHaveSeries){

      if(
        !(series.characterIds || [])
          .includes(String(character.id))
      ){

        series.characterIds =
          (series.characterIds || [])
            .concat(String(character.id));
      }
    }
  });

 await saveData();

closeModal(
  "add-chars-modal"
);

// シリーズ詳細モーダルを開いていたら更新
const seriesModal =
  document.getElementById(
    "series-detail-modal"
  );

if(seriesModal){

  closeModal(
    "series-detail-modal"
  );

  const series =
  seriesMaster.find(
    s =>
      (character.seriesIds || [])
        .map(String)
        .includes(String(s.id))
  );

  if(series){

    openSeriesDetailModal(series);

  }

}

renderCharacters();

showToast(
  `「${character.name}」を追加しました`
);
}



//==============================
//人物削除処理
//==============================
async function deleteCharacter(id){

  const character =
    characters.find(
      c => String(c.id) === String(id)
    );

  if(!character) return;


  const name = character.name;


// 保護機能予定
if(character.protect){

  showToast(
    `🔒 「${name}」は保護されているため削除できません`
  );

  return;
}


showConfirmDialog({

  title: `「${name}」を削除`,

  message: `
「${name}」を削除しますか？<br><br>

シリーズとの関連付けも解除されます。
`,

  okText: "削除",

  cancelText: "キャンセル",

  onOk: async ()=>{

  
  characters =
    characters.filter(
      c => String(c.id) !== String(id)
    );

  // シリーズ側から人物IDを掃除
  seriesMaster.forEach(series=>{

    series.characterIds =
      (series.characterIds || []).filter(
        characterId =>
          String(characterId) !== String(id)
      );

  });

  await saveData();

  closeModal("open-chars-modal");

  renderCharacters();

  showToast(
    `「${name}」を削除しました`
  );

  }

});
  
}



//==============================
//人物詳細編集の関連追加処理
//==============================
function addSeriesToCharacter(
  id,
  listId,
  searchId,
  suggestId
){

  if(
    editingCharacterSeriesIds.includes(
      String(id)
    )
  ){
    return;
  }

  editingCharacterSeriesIds.push(
    String(id)
  );

  renderCharacterEditSeries(listId);

  renderCharacterSeriesSuggest(
    searchId,
    suggestId,
    listId
  );
}






//==============================
//人物詳細編集の関連消去
//==============================
function removeSeriesFromCharacter(
  id,
  listId,
  searchId,
  suggestId
){

const series =
  seriesMaster.find(
    s => String(s.id) === String(id)
  );

const name = series?.name || "";

  showConfirmDialog({

    title: "関連シリーズを解除",

message: `
「${name}」との関連付けを解除しますか？
`,

    okText: "解除",

    cancelText: "キャンセル",

    onOk: ()=>{

      editingCharacterSeriesIds =
        editingCharacterSeriesIds.filter(
          sId => String(sId) !== String(id)
        );

      renderCharacterEditSeries(
        listId
      );

      renderCharacterSeriesSuggest(
        searchId,
        suggestId,
        listId
      );

    }

  });

}



//==============================
//キャラクターソート
//==============================
function sortCharacters(list){

  const arr = [...list];

  if(charsSortMode === "cname-asc"){
    arr.sort((a,b)=>
      (a.name || "").localeCompare(
        b.name || "",
        "ja"
      )
    );
  }

  if(charsSortMode === "cname-desc"){
    arr.sort((a,b)=>
      (b.name || "").localeCompare(
        a.name || "",
        "ja"
      )
    );
  }

  if(charsSortMode === "series-asc"){
    arr.sort((a,b)=>
      getCharacterSeriesText(a)
        .localeCompare(
          getCharacterSeriesText(b),
          "ja"
        )
    );
  }

  if(charsSortMode === "series-desc"){
    arr.sort((a,b)=>
      getCharacterSeriesText(b)
        .localeCompare(
          getCharacterSeriesText(a),
          "ja"
        )
    );
  }

  return arr;
}


//==============================
//関連シリーズでソート
//==============================
function getCharacterSeriesText(character){

  return seriesMaster
    .filter(s =>
      (s.characterIds || [])
        .map(String)
        .includes(String(character.id))
    )
    .map(s => s.name || "")
    .sort((a,b)=>a.localeCompare(b, "ja"))
    .join(" / ");
}


//==============================
//ソートモード切替（キャラ）
//==============================
function changeCharactersSortMode(){

  charsSortMode =
    document.getElementById(
      "characters-sort-select"
    ).value;

  console.log("charsSortMode:", charsSortMode);

  renderCharacterList();
}




//==============================
// 人物タイプ切替
//==============================
function getPersonTypeLabel(type){

  switch(type){

    case "author":
      return "著者";

    case "illustrator":
      return "イラスト";

    case "original":
      return "原作者";

    default:
      return "登場人物";
  }

}


//==============================
//=人物用保護のチェック切替え
//==============================
function toggleCharactersProtect(id){

  const character =
    characters.find(
      c => String(c.id) === String(id)
    );

  if(!character) return;

  character.protect =
    document.getElementById(
      "protect-characters-check"
    ).checked;

  saveData();

  renderCharacters();
}