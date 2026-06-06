//==============================
// SUGGEST
//
// とりあえず、render + Suggestを
// まとめてある場所 20260526
//==============================


//==============================
//====汎用サジェスト
//==============================
function renderSuggestList({

  inputId,
  suggestId,
  list,
  max = 5

}){

  const input =
    document.getElementById(inputId);

  const suggest =
    document.getElementById(suggestId);

  if(!input || !suggest) return;

  const keyword =
    input.value
      .trim()
      .toLowerCase();

  if(!keyword){

    suggest.innerHTML = "";
    return;
  }

  const matched =
    [...new Set(list)]
      .filter(v=>

        v &&
        v.toLowerCase()
          .includes(keyword)

      )
      .slice(0, max);

  suggest.innerHTML = "";
  
  matched.forEach(text=>{

    const item =
      document.createElement("div");

    item.className =
      "suggest-item";

    item.textContent = text;
    
    item.onclick = ()=>{

      input.value = text;

      suggest.innerHTML = "";
    };

    suggest.appendChild(item);
  });
}



//==============================
//====サジェスト
//====検索候補のみ表示させる役
//==============================
function renderSuggest(){

  // 検索候補
    //🔍 検索
  const keyword = searchKeyword;
 
  const suggestEl = document.getElementById("search-suggest");

  if(suggestEl){

  if(keyword){

    const suggestions = books
  .filter(b =>
    (b.title || "")
      .toLowerCase()
      .includes(keyword)
  )
  .slice(0,5);

  suggestEl.innerHTML = suggestions.map(b=>`
    <div class="search-item"
         onclick="openDetailById('${b.id}')">
      ${b.title}
    </div>
  `).join("");

  }else{
    suggestEl.innerHTML = "";
  }
}
}





//==============================
//本詳細で関連シリーズの検索
//==============================
function renderBookSeriesSuggest(
  searchId,
  suggestId,
  listId
){

  const keyword =
    document.getElementById(searchId)
      .value
      .toLowerCase();

  const filtered =
    seriesMaster.filter(s=>{

      const match =
        (s.name || "")
          .toLowerCase()
          .includes(keyword);

      const notAdded =
        !editingBookSeriesIds.includes(
          String(s.id)
        );

      return match && notAdded;

    });

  if(!keyword){

    document.getElementById(
      suggestId
    ).innerHTML = "";

    return;
  }

  document.getElementById(
    suggestId
  ).innerHTML =

    filtered.length
    ? `
      <div class="suggest-label">
        📚 シリーズ
      </div>

      ${filtered.map(s=>`

        <div
          class="search-item"
          onclick="
            addSeriesToBook(
            '${s.id}',
            '${listId}',
            '${searchId}',
            '${suggestId}'
            )
          "
        >
          ${s.name}
        </div>

      `).join("")}
    `
    : "";
}








//==============================
//====タイトル用サジェスト
//==============================
function renderTitleSuggest(){

  renderSuggestList({

    inputId: "add-title",

    suggestId: "title-suggest",

    list:
      books.map(b=>b.title)

  });
}


//==============================
//====シリーズ用サジェスト
//==============================
function renderSeriesSuggest(
//{
//  inputId,
//  suggestId
//}
){

  renderSuggestList({

    inputId:
     "add-series",

    suggestId:
     "series-suggest",

    list:
      seriesMaster.map(s => s.name)

  });
}





//==============================
//関連本のタイトルだけ検索（Sタイトル用）
//==============================
function renderSeriesTitleSuggest(){

  renderSuggestList({
    inputId: "add-series-title",
    suggestId: "series-title-suggest",
    list: books.map(b => b.title)
  });
}





//==============================
//新規用：関連本の検索
//==============================
function renderSeriesNewBookSuggest(){

  const keyword =
    document.getElementById(
      "series-for-one"
    ).value.toLowerCase();

  const filtered = books.filter(b=>{

    const match =
      (b.title || "")
        .toLowerCase()
        .includes(keyword);

    const notAdded =
      !newSeriesBookIds.includes(
        String(b.id)
      );

    return match && notAdded;
  });

  if(!keyword){

    document.getElementById(
      "series-book-suggest"
    ).innerHTML = "";

    return;
  }

  document.getElementById(
    "series-book-suggest"
  ).innerHTML =

    filtered.length
    ? `
      <div class="suggest-label">
        📘 本
      </div>

      ${filtered.map(b=>{

        const relatedSeries =
          seriesMaster.filter(s =>

            (s.bookIds || [])
              .map(String)
              .includes(String(b.id))

          );

        return `
          <div
            class="search-item"
            onclick="addBookToNewSeries('${b.id}')"
          >
            <div>
  ${b.title}
  ${
    b.volume
      ? ` ${b.volume}`
      : ""
  }
</div>

            ${
              relatedSeries.length
                ? `
                  <div class="suggest-sub">
                    ${relatedSeries
                      .map(s => s.name.slice(0, 8))
                      .join(" / ")
                    }
                  </div>
                `
                : ""
            }
          </div>
        `;

      }).join("")}
    `
    : "";
}

//==============================
//新規追加用：関連キャラの検索
//==============================
function renderSeriesNewCharacterSuggest(){

  const keyword =
    document.getElementById(
      "series-for-one"
    ).value.toLowerCase();

  const filtered = characters.filter(c=>{

    const match =
      (c.name || "")
        .toLowerCase()
        .includes(keyword);

    const notAdded =
      !newSeriesCharacterIds.includes(
        String(c.id)
      );

    return match && notAdded;
  });

  if(!keyword){

    document.getElementById(
      "series-character-suggest"
    ).innerHTML = "";

    return;
  }

  document.getElementById(
    "series-character-suggest"
  ).innerHTML =

    filtered.length
    ? `
      <div class="suggest-label">
        👤 人物
      </div>

      ${filtered.map(c=>{

        const relatedSeries =
          seriesMaster.filter(s =>

            (s.characterIds || [])
              .map(String)
              .includes(String(c.id))

          );

        return `
          <div
            class="search-item"
            onclick="addCharacterToNewSeries('${c.id}')"
          >
            <div>
              ${c.name}
            </div>

            ${
              relatedSeries.length
                ? `
                  <div class="suggest-sub">
                    ${relatedSeries
                      .map(s => s.name.slice(0, 8))
                      .join(" / ")
                    }
                  </div>
                `
                : ""
            }
          </div>
        `;

      }).join("")}
    `
    : "";
}







//==============================
//関連本の検索
//==============================
function renderSeriesBookSuggest(){

  const keyword =
    document.getElementById(
      "series-related-search"
    ).value.toLowerCase();

  const filtered = books.filter(b=>{

    const match =
      (b.title || "")
        .toLowerCase()
        .includes(keyword);

    const notAdded =
      !editingSeriesBookIds.includes(
        String(b.id)
      );

    return match && notAdded;

  });

  if(!keyword){

    document.getElementById(
      "series-book-suggest"
    ).innerHTML = "";

    return;
  }

  document.getElementById(
    "series-book-suggest"
  ).innerHTML =

    filtered.length
    ? `
      <div class="suggest-label">
        📘 本
      </div>

      ${filtered.map(b=>{

        const relatedSeries =
          seriesMaster.filter(s =>

            (s.bookIds || [])
              .map(String)
              .includes(String(b.id))

          );

        return `
          <div
            class="search-item"
            onclick="addBookToSeries('${b.id}')"
          >
            <div>
  ${b.title}
  ${
    b.volume
      ? ` ${b.volume}`
      : ""
  }
</div>

            ${
              relatedSeries.length
                ? `
                  <div class="suggest-sub">
                    ${relatedSeries
                      .map(s => s.name.slice(0, 8))
                      .join(" / ")
                    }
                  </div>
                `
                : ""
            }
          </div>
        `;

      }).join("")}
    `
    : "";
}



//==============================
//関連キャラの検索
//==============================
function renderSeriesCharacterSuggest(){


  const keyword =
    document.getElementById(
      "series-related-search"
    ).value.toLowerCase();

  const filtered = characters.filter(c=>{

  const match =
    (c.name || "")
      .toLowerCase()
      .includes(keyword);

  const notAdded =
    !editingSeriesCharacterIds.includes(c.id);

  return match && notAdded;

});

if(!keyword){

  document.getElementById(
    "series-character-suggest"
  ).innerHTML = "";

  return;
}

document.getElementById(
  "series-character-suggest"
).innerHTML =

  filtered.length
  ? `
    <div class="suggest-label">
      👤 人物
    </div>

    ${filtered.map(c=>`
    
    const relatedSeries =
  seriesMaster.filter(s =>

    (s.characterIds || [])
      .map(String)
      .includes(String(c.id))

  );

      <div
        class="search-item"
        onclick="
          addCharacterToSeries('${c.id}')
        "
      >
      <div>
        ${c.name}
      </div>
      
      ${
              relatedSeries.length
                ? `
                  <div class="suggest-sub">
                    ${relatedSeries
                      .map(s => s.name.slice(0, 8))
                      .join(" / ")
                    }
                  </div>
                `
                : ""
            }  
        
      </div>

    `).join("")}
  `
  : "";

}





//==============================
//====キャラクター用サジェスト
//==============================
function renderCharacterSuggest(){

  renderSuggestList({

    inputId: "add-character",

    suggestId: "chars-suggest",

    list:
      characters.map(c=>c.name)

  });
}




//==============================
//人物詳細編集の関連シリーズサジェスト検索
//==============================
function renderCharacterSeriesSuggest(
  searchId,
  suggestId,
  listId
){

  const keyword =
    document.getElementById(searchId)
      .value
      .toLowerCase();

  const filtered =
    seriesMaster.filter(s=>{

      const match =
        (s.name || "")
          .toLowerCase()
          .includes(keyword);

      const notAdded =
        !editingCharacterSeriesIds.includes(
          String(s.id)
        );

      return match && notAdded;

    });

  if(!keyword){

    document.getElementById(
      suggestId
    ).innerHTML = "";

    return;
  }

  document.getElementById(
    suggestId
  ).innerHTML =

    filtered.length
    ? `
      <div class="suggest-label">
        📚 シリーズ
      </div>

      ${filtered.map(s=>`

        <div
          class="search-item"
          onclick="
            addSeriesToCharacter(
            '${s.id}',
            '${listId}',
            '${searchId}',
            '${suggestId}'
            )
          "
        >
          ${s.name}
        </div>

      `).join("")}
    `
    : "";
}




