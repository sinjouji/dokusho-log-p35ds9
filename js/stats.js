//==============================
//
// STATS 統計関係
//
//==============================



//==============================
//====カレンダー、統計ページの表示
//==============================
function renderStats(){

setActiveMenu("menu-stats");

  const main = document.getElementById("page-stats");
  main.innerHTML = "";

main.innerHTML = "";

renderStatsDashboard(main);

const year = statsYear;

const head = document.createElement("div");

head.style.display = "flex";
head.style.justifyContent = "space-between";
head.style.alignItems = "center";
head.style.marginBottom = "16px";

head.innerHTML = `
  <button onclick="changeStatsYear(-1)">←</button>

  <h2>${year}年 統計</h2>

  <button onclick="changeStatsYear(1)">→</button>
`;

main.appendChild(head);
  
  
  
  const yearCard =
  document.createElement("div");

yearCard.className =
  "stats-year-card";

// 年間目標
const yearlyCount = getYearReadCount(year);

const percent =
  Math.min(
    yearlyCount / yearlyGoal * 100,
    100
  );

const goal = document.createElement("div");

goal.style.margin = "16px 0";

goal.innerHTML = `
  <div style="
    font-size:14px;
    margin-bottom:6px;
  ">
    年間目標：
    ${yearlyCount} / ${yearlyGoal}冊
  </div>

  <div style="
    height:14px;
    background:#eee;
    border-radius:999px;
    overflow:hidden;
  ">
    <div style="
      width:${percent}%;
      height:100%;
      background:#aacf53;
    "></div>
  </div>
`;

if(enableGoal){
  yearCard.appendChild(goal);
}

renderMonthlyGraph(yearCard, year);

main.appendChild(yearCard);

renderMiniCalendar(main);
// renderReadingHistory(main);
}
//==============================
//====小さめ表示のカレンダー（統計ページ用）
//==============================
// TODO:
// 日付を左上表示
// 読了数を中央表示
// ヒートマップ色と連動したチップ化
function renderMiniCalendar(main){

  const year =
    calendarYear;

  const month =
    calendarMonth;
  
//カレンダー全体のカード化
const card =
  document.createElement("div");

card.className =
  "stats-calendar-card";

  // ===== ヘッダー =====

  const header = document.createElement("div");
  header.className =
  "stats-calendar-header";
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.marginBottom = "8px";

  const prev = document.createElement("button");
  prev.textContent = "←";

  prev.onclick = ()=>{
    calendarMonth--;

if(calendarMonth < 0){
  calendarMonth = 11;
  calendarYear--;
}

    renderStats();
  };

  const title = document.createElement("div");
  title.textContent =
    `${year}年 ${month+1}月`;

  const next = document.createElement("button");
  next.textContent = "→";

  next.onclick = ()=>{
    calendarMonth++;

if(calendarMonth > 11){
  calendarMonth = 0;
  calendarYear++;
}

renderStats();
  };

  header.append(prev);
  header.append(title);
  header.append(next);

  card.appendChild(header);

  // ===== 読書データ =====

  const map = {};

  books.forEach(b=>{
  (b.readDates || []).forEach(date=>{
    map[date] = map[date] || [];
    map[date].push(b);
  });
});

  // ===== カレンダー =====
  
  const firstDay =
    new Date(year, month, 1).getDay();

  const lastDate =
    new Date(year, month + 1, 0).getDate();

  const grid = document.createElement("div");

  grid.className = "mini-calendar";

  // 空白
  for(let i=0; i<firstDay; i++){
    grid.appendChild(
      document.createElement("div")
    );
  }

  // 日付
  for(let d=1; d<=lastDate; d++){

    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");

    const dateStr =
      year + "-" + mm + "-" + dd;

    const count =
      map[dateStr]?.length || 0;

    const cell =
      document.createElement("div");

    cell.className = "mini-day";
    
    cell.style.background =
      getHeatColor(count);

    if(count >= 5){
      cell.classList.add("heat-max");
    }

    // 今日
    const today =
      new Date().toISOString().slice(0,10);

    if(dateStr === today){
      cell.style.border =
        "3px solid #f8a484"
    }

    cell.innerHTML = `
  <div class="mini-day-date">
    ${d}
  </div>

  ${
    count
      ? `
        <div class="mini-day-count">
          ${count}
        </div>
      `
      : ""
  }
`;



    cell.onclick = ()=>{
      if(!map[dateStr]) return;

      openDayModal(
        dateStr,
        map[dateStr]
      );
    };

    grid.appendChild(cell);
  }

  card.appendChild(grid);
  main.appendChild(card);
}



//==============================
//====月間読書グラフ表示
//==============================
function renderMonthlyGraph(main, year){

  const counts =
    getMonthlyCounts(year);

  const maxCount =
    Math.max(...counts, 1);

  const wrap =
    document.createElement("div");

  wrap.className = "monthly-graph";

  counts.forEach((c,i)=>{

    const row =
      document.createElement("div");

    row.className = "monthly-row";

    const percent =
      c === 0
        ? 0
        : (c / maxCount) * 100;

    row.innerHTML = `
      <div class="monthly-label">
        ${i+1}月 (${c}冊)
      </div>

      <div class="monthly-bar-bg">

        <div
          class="monthly-bar"
          style="width:${percent}%;"
        ></div>

      </div>
    `;

    wrap.appendChild(row);

  });

  main.appendChild(wrap);
}


//==============================
//今年・今月◯冊取得
//==============================
function getMonthlyCounts(year){

  const counts =
    Array(12).fill(0);

  books.forEach(book=>{

    const dates =
      book.readDates ||
      book.dates ||
      [];

    dates.forEach(date=>{

      if(!date) return;

      const y =
        Number(date.slice(0, 4));

      const m =
        Number(date.slice(5, 7));

      if(y === Number(year)){

        counts[m - 1]++;

      }
    });
  });

  return counts;
}



//==============================
//====年間読了数の取得
//==============================
function getYearReadCount(year){

  let count = 0;
  books.forEach(b=>{
    (b.readDates || b.dates || []).forEach(d=>{
      if(new Date(d).getFullYear() === year){
       count++;
       }
    });
  });

  return count;
}








//==============================
//====グラフ、年間目標年送り
//==============================
function changeStatsYear(diff){
  statsYear += diff;
  renderStats();
}


//==============================
//====ヒートマップカラー
//==============================
function getHeatColor(count){
  if(count === 0) return "#e1e5e4"; //蕎麦切
  if(count === 1) return "#f8d8c6"; //乙女
  if(count === 2) return "#efecad"; //女郎花
  if(count === 3) return "#bcd079"; //苗
  
  if(count === 4) return "#a2d7dd"; //瓶覗
  return "#2980af";//縹
  }



//==============================
//ダッシュボード
//==============================
function renderStatsDashboard(main){

  const totalBooks =
    books.length;

  const totalSeries =
    seriesMaster.length;

  const totalCharacters =
    characters.length;

  const readBooks =
    books.filter(b =>
      (b.readDates || []).length
    ).length;

  const wishBooks =
    books.filter(b =>
      b.type === "wish"
    ).length;

  const dash = document.createElement("div");
  dash.className = "stats-dashboard";

  dash.innerHTML = `
    <div class="stats-card">
      <div class="stats-icon">📚</div>
      <div class="stats-number">${totalBooks}</div>
      <div class="stats-label">総冊数</div>
    </div>

    <div class="stats-card">
      <div class="stats-icon">✅</div>
      <div class="stats-number">${readBooks}</div>
      <div class="stats-label">読了冊数</div>
    </div>

    <div class="stats-card">
      <div class="stats-icon">💭</div>
      <div class="stats-number">${wishBooks}</div>
      <div class="stats-label">wish</div>
    </div>

    <div class="stats-card">
      <div class="stats-icon">📖</div>
      <div class="stats-number">${totalSeries}</div>
      <div class="stats-label">シリーズ</div>
    </div>

    <div class="stats-card">
      <div class="stats-icon">👤</div>
      <div class="stats-number">${totalCharacters}</div>
      <div class="stats-label">人物</div>
    </div>
  `;

  main.appendChild(dash);
}
