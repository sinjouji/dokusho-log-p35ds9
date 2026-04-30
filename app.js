// ===== 設定 =====
const USER = "sinjouji";
const REPO = "reading-log";
const FILE_PATH = "data.json";
const TOKEN = "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";

// ===== データ =====
let data = {
  books: [],
  series: [],
  characters: []
};

let sha = "";

// ===== 読み込み =====
async function loadData() {
  const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/${FILE_PATH}`, {
    headers: { Authorization: `token ${TOKEN}` }
  });

  const json = await res.json();
  sha = json.sha;

  const content = JSON.parse(decodeURIComponent(escape(atob(json.content))));
  data = content;

  if (!data.characters) data.characters = [];

  renderCharacters();
}

// ===== 保存 =====
async function saveData() {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

  await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/${FILE_PATH}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "update data",
      content,
      sha
    })
  });

  alert("保存しました");
}

// ===== UID =====
function uid(prefix="id") {
  return prefix + "_" + Date.now();
}

// ===== キャラ追加 =====
function addCharacter({ name, memo, aliases, seriesIds }) {
  const c = {
    id: uid("c"),
    name,
    memo,
    aliases: aliases || [],
    seriesIds: seriesIds || []
  };

  data.characters.push(c);

  // 双方向リンク
  data.series.forEach(s => {
    if (c.seriesIds.includes(s.id)) {
      if (!s.characterIds) s.characterIds = [];
      if (!s.characterIds.includes(c.id)) {
        s.characterIds.push(c.id);
      }
    }
  });
}

// ===== UI追加用 =====
function addCharacterUI() {
  const name = document.getElementById("charName").value;
  const memo = document.getElementById("charMemo").value;
  const aliases = document.getElementById("charAlias").value.split(",").map(v => v.trim()).filter(v => v);

  const seriesName = document.getElementById("seriesInput").value;

  let s = data.series.find(s => s.name === seriesName);

  if (!s && seriesName) {
    s = {
      id: uid("s"),
      name: seriesName,
      bookIds: [],
      characterIds: []
    };
    data.series.push(s);
  }

  addCharacter({
    name,
    memo,
    aliases,
    seriesIds: s ? [s.id] : []
  });

  renderCharacters();
}

// ===== 表示 =====
function renderCharacters() {
  let list = [...data.characters];

  const keyword = document.getElementById("searchChar")?.value?.toLowerCase() || "";
  const sort = document.getElementById("sortChar")?.value || "name_asc";

  if (keyword) {
    list = list.filter(c =>
      c.name.toLowerCase().includes(keyword) ||
      (c.memo || "").toLowerCase().includes(keyword) ||
      (c.aliases || []).some(a => a.toLowerCase().includes(keyword))
    );
  }

  list.sort((a, b) => {
    if (sort === "name_asc") return a.name.localeCompare(b.name);
    if (sort === "name_desc") return b.name.localeCompare(a.name);

    const sa = getSeriesName(a);
    const sb = getSeriesName(b);

    return sort === "series_asc"
      ? sa.localeCompare(sb)
      : sb.localeCompare(sa);
  });

  document.getElementById("characterList").innerHTML =
    list.map(c => `
      <div class="char-card">
        <b>${c.name}</b>（${getSeriesName(c)}）<br>
        ${c.aliases.length ? "別名: " + c.aliases.join(", ") + "<br>" : ""}
        ${c.memo || ""}
      </div>
    `).join("");
}

function getSeriesName(c) {
  const s = data.series.find(s => c.seriesIds?.includes(s.id));
  return s ? s.name : "";
}
