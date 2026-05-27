//==============================
//
// STATS 統計関係
//
//==============================

//==============================
//====グラフ、年間目標年送り
//==============================
function changeStatsYear(diff){
  statsYear += diff;
  renderStats();
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
//====ヒートマップカラー
//==============================
function getHeatColor(count){
  if(count === 0) return "#9b8e82"; //鼯鼠
  if(count === 1) return "#f8d8c6"; //乙女
  if(count === 2) return "#f7ed92"; //承和
  if(count === 3) return "#fddb5d"; //くちなし
  if(count === 4) return "#aacf53"; //萌葱
  return "#78ccd2"; //白群
  }






//==============================
//====カレンダー、統計ページの表示
//==============================
function renderStats(){

setActiveMenu("menu-stats");

  const main = document.getElementById("page-stats");
  main.innerHTML = "";

  const year = statsYear;

  main.innerHTML = `
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:16px;
    ">
      <button onclick="changeStatsYear(-1)">←</button>

      <h2>${year}年 統計</h2>

      <button onclick="changeStatsYear(1)">→</button>
    </div>
  `;


  
  //年間目標
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
    ">
    </div>

  </div>
  `;
  if(enableGoal){
      main.appendChild(goal);
  }
  
//  renderSummary(main);
renderMiniCalendar(main);

const spacer = document.createElement("div");
spacer.style.height = "24px";
main.appendChild(spacer);

renderMonthlyGraph(main, year);
// renderReadingHistory(main);
}
//==============================
//====小さめ表示のカレンダー（統計ページ用）
//==============================
function renderMiniCalendar(main){

  const now = miniMonth;
  const year = statsYear;
  const month = now.getMonth();

  // ===== ヘッダー =====

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.justifyContent = "top";
  header.style.marginBottom = "8px";

  const prev = document.createElement("button");
  prev.textContent = "←";

  prev.onclick = ()=>{
    miniMonth.setMonth(miniMonth.getMonth() - 1);
    renderStats();
  };

  const title = document.createElement("div");
  title.textContent =
    `${year}年 ${month+1}月`;

  const next = document.createElement("button");
  next.textContent = "→";

  next.onclick = ()=>{
    miniMonth.setMonth(miniMonth.getMonth() + 1);
    renderStats();
  };

  header.append(prev);
  header.append(title);
  header.append(next);

  main.appendChild(header);

  // ===== 読書データ =====

  const map = {};

  books.forEach(b=>{
    (b.readDates || b.dates || []).forEach(date=>{
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

    // 今日
    const today =
      new Date().toISOString().slice(0,10);

    if(dateStr === today){
      cell.style.border =
        "2px solid #f8a484"
    }

    cell.innerHTML =
      "<div>" + d + "</div>" +
      "<div>" + (count || "") + "</div>";

    cell.onclick = ()=>{
      if(!map[dateStr]) return;

      openDayModal(
        dateStr,
        map[dateStr]
      );
    };

    grid.appendChild(cell);
  }

  main.appendChild(grid);
}



//==============================
//====月間読書グラフ表示
//==============================
function renderMonthlyGraph(main, year){

  const counts = getMonthlyCounts(year);

  const wrap = document.createElement("div");

  wrap.style.marginTop = "20px";

  counts.forEach((c,i)=>{

    const row = document.createElement("div");

    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "8px";

    row.innerHTML = `
  <div style="
    width:70px;
    font-size:12px;
    flex-shrink:0;
  ">
    ${i+1}月 (${c}冊)
  </div>

  <div style="
    flex:1;
    height:12px;
    background:#eee;
    border-radius:999px;
    overflow:hidden;
  ">

    <div style="
      width:${c*5}px;
      height:100%;
      background:#78ccd2;
    ">
    </div>

  </div>
`;

    wrap.appendChild(row);

  });

  main.appendChild(wrap);
}







