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

  const main =
    document.getElementById("page-stats");
  
  main.innerHTML = "";

  //ダッシュボード呼び出し
  renderStatsDashboard(main);

  //ヘッダー（←年→）部分呼び出し
  const year = statsYear;

  renderStatsYearHeader(
    main,
    year
  );
  
  //年間グラフカード呼び出し
  renderStatsYearCard(
    main,
    year
  );
  
  //カレンダーカード呼び出し
  renderMiniCalendar(main);
// renderReadingHistory(main);
}
//==============================
//====小さめ表示のカレンダー（統計ページ用）
//==============================
// TODO:
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
        "4px solid #d9a27c"
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
  if(count === 1) return "#f2c3ca"; //撫子
  if(count === 2) return "#fcd475"; //卵
  if(count === 3) return "#efecad"; //女郎花
  
  if(count === 4) return "#c7dc68"; //若苗
  return "#4f8a5d";//緑青
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
    
    
    //（＋⚪︎）用
    const year =
  statsYear;

const addedBooks =
  books.filter(b =>
    isCreatedInYear(b, year)
  ).length;

const addedSeries =
  seriesMaster.filter(s =>
    isCreatedInYear(s, year)
  ).length;

const addedCharacters =
  characters.filter(c =>
    isCreatedInYear(c, year)
  ).length;

  const dash = document.createElement("div");
  dash.className = "stats-dashboard";

  dash.innerHTML = `
    <div class="stats-card">
      <div class="stats-icon">📚</div>
      <div class="stats-number">${totalBooks}</div>
      <div class="stats-sub">+${addedBooks}</div>
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
      <div class="stats-sub">+${addedSeries}</div>
      <div class="stats-label">シリーズ</div>
    </div>

    <div class="stats-card">
      <div class="stats-icon">👤</div>
      <div class="stats-number">${totalCharacters}</div>
      <div class="stats-sub">+${addedCharacters}</div>
      <div class="stats-label">人物</div>
    </div>
  `;

  main.appendChild(dash);
}



//==============================
//ダッシュボード改造（＋⚪︎冊）用
//==============================
function isCreatedInYear(item, year){

  const rawId =
    String(item.id || "");

  const timestamp =
    Number(
      rawId.replace(/\D/g, "")
    );

  if(!timestamp) return false;

  const date =
    new Date(timestamp);

  return date.getFullYear() === year;
}



//==============================
//年間読了目標数
//==============================
function renderYearGoal(main, year){

  const yearlyCount =
    getYearReadCount(year);

  const percent =
    Math.min(
      yearlyCount / yearlyGoal * 100,
      100
    );

  const achieved =
    yearlyCount >= yearlyGoal;

  const goal =
    document.createElement("div");

  goal.className = "year-goal";

  goal.innerHTML = `
    <div class="year-goal-label">
      年間目標：
      ${yearlyCount} / ${yearlyGoal}冊
      ${achieved ? "🎉年間目標達成！" : ""}
    </div>

    <div class="year-goal-bar-bg">
      <div
        class="year-goal-bar ${achieved ? "achieved" : ""}"
        style="width:${percent}%;"
      ></div>
    </div>
  `;

  main.appendChild(goal);
}

//==============================
//年ヘッダー部分
//==============================
function renderStatsYearHeader(main, year){

  const head =
    document.createElement("div");

  head.className =
    "stats-year-header";

  head.innerHTML = `
    <button onclick="changeStatsYear(-1)">
      ←
    </button>

    <h2>${year}年 統計</h2>

    <button onclick="changeStatsYear(1)">
      →
    </button>
  `;

  main.appendChild(head);
}


//==============================
//年グラフカード
//==============================
function renderStatsYearCard(main, year){

  const yearCard =
    document.createElement("div");

  yearCard.className =
    "stats-year-card";

  if(enableGoal){
    renderYearGoal(yearCard, year);
  }

  renderMonthlyGraph(
    yearCard,
    year
  );

  main.appendChild(yearCard);
}
