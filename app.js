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

  const content = JSON.parse(atob(json.content));
  data = content;

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

  alert("保存完了");
}

// ===== UID =====
function uid() {
  return "c_" + Date.now();
}

// ===== キャラ追加 =====
function addCharacterUI() {
  const name = document.getElementById("charName").value;
  const memo = document.getElementById("charMemo").value;
  const seriesName = document.getElementById("seriesInput").value;

  if (!name) return alert("名前必須");

  let s = data.series.find(s => s.name === seriesName);

  if (!s) {
    s = { id: "s_" + Date.now(), name: seriesName, bookIds: [], characterIds: [] };
    data.series.push(s);
  }

  const c = {
    id: uid(),
    name,
    memo,
    seriesIds: [s.id]
  };

  data.characters.push(c);

  if (!s.characterIds) s.characterIds = [];
  s.characterIds.push(c.id);

  renderCharacters();
}

// ===== 表示 =====
function renderCharacters() {
  let list = [...data.characters];

  const keyword = document.getElementById("searchChar").value.toLowerCase();
  const sort = document.getElementById("sortChar").value;

  if (keyword) {
    list = list.filter(c =>
      c.name.toLowerCase().includes(keyword) ||
      (c.memo || "").toLowerCase().includes(keyword)
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
      <div>
        <b>${c.name}</b>（${getSeriesName(c)}）<br>
        ${c.memo || ""}
      </div>
    `).join("");
}

function getSeriesName(c) {
  const s = data.series.find(s => c.seriesIds?.includes(s.id));
  return s ? s.name : "";
}
