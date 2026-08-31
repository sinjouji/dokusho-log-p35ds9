//===============================
//
// 私用 SYNC.JS
// 同期処理や共通化したくない部分の置き場
//
//===============================

window.syncMode = "sync";


//==============================
// 同期ON/OFF
//==============================

let enableSync =
  localStorage.getItem("enableSync") !== "false";

function isSyncEnabled(){
  return enableSync === true;
}

function setSyncEnabled(enabled){

  enableSync = enabled;

  localStorage.setItem(
    "enableSync",
    String(enabled)
  );

  // OFF → ON に切り替えた場合
  // 現在のデータをすぐFirestoreへ同期
  if(enabled){

    const data = {
      books,
      characters,
      tagMaster,
      seriesMaster,
      dailyLogs
    };

    syncToFirestore(data);

  }

}




//===============================
// 一度だけローカル保存キー名変更
//===============================
const oldData =
  localStorage.getItem("bookAppData");

const newData =
  localStorage.getItem("dokushoLogData");

if(!newData && oldData){

  localStorage.setItem(
    "dokushoLogData",
    oldData
  );

}




// ==============================
// Firestore変更管理
// ==============================

let pendingSync = {
  books: false,
  series: false,
  characters: false,
  tagMaster: false,
  dailyLogs: false
};

//==============================
// Firestore保存成功後の変更マーク解除
//==============================
function clearDataChanged(type){

  if(
    Object.prototype.hasOwnProperty.call(
      pendingSync,
      type
    )
  ){

    pendingSync[type] = false;

  }

}


//変更の有無の判定用関数
function markDataChanged(type){

  if(
    Object.prototype.hasOwnProperty.call(
      pendingSync,
      type
    )
  ){

    pendingSync[type] = true;

  }

}

//===============================
// savedata 同期
//===============================
async function syncToFirestore(data){

  // =========================
  // books
  // =========================

  if(pendingSync.books){

  await window.setDoc(
    window.doc(
      window.db,
      "app",
      "books"
    ),
    {
      books: data.books || []
    }
  );

  clearDataChanged("books");

  console.log("Firestore books 保存完了");
}


  // =========================
  // series
  // =========================

  if(pendingSync.series){

    await window.setDoc(
      window.doc(
        window.db,
        "app",
        "series"
      ),
      {
        series: data.seriesMaster || []
      }
    );
    
    clearDataChanged("series");

    console.log("Firestore series 保存完了");
  }


  // =========================
  // characters
  // =========================

  if(pendingSync.characters){

    await window.setDoc(
  window.doc(
    window.db,
    "app",
    "characters"
  ),
  {
    characters: data.characters || []
  }
);

clearDataChanged("characters");

console.log("Firestore characters 保存完了");
  }


  // =========================
  // tagMaster
  // =========================

  if(pendingSync.tagMaster){

    await window.setDoc(
  window.doc(
    window.db,
    "app",
    "tagMaster"
  ),
  {
    tagMaster: data.tagMaster || []
  }
);

clearDataChanged("tagMaster");

console.log("Firestore tagMaster 保存完了");
  }


  // =========================
  // dailyLogs
  // =========================

  if(pendingSync.dailyLogs){

    await window.setDoc(
  window.doc(
    window.db,
    "app",
    "dailyLogs"
  ),
  {
    dailyLogs: data.dailyLogs || {}
  }
);

clearDataChanged("dailyLogs");

console.log("Firestore dailyLogs 保存完了");
  }


  console.log("Firestore保存完了");

}

//==============================
// Firestoreからデータを読み込む
//==============================
async function loadDataFromFirestore(){

  if(!window.firebaseReady){

    console.log("⏳ Firebase待機中...");

    await new Promise(resolve =>
      setTimeout(resolve, 100)
    );

    return loadDataFromFirestore();
  }

  // =========================
  // Firestoreから各データを取得
  // =========================

  const booksSnap =
    await window.getDoc(
      window.doc(
        window.db,
        "app",
        "books"
      )
    );

  const seriesSnap =
    await window.getDoc(
      window.doc(
        window.db,
        "app",
        "series"
      )
    );

  const charactersSnap =
    await window.getDoc(
      window.doc(
        window.db,
        "app",
        "characters"
      )
    );

  const tagMasterSnap =
    await window.getDoc(
      window.doc(
        window.db,
        "app",
        "tagMaster"
      )
    );

  const dailyLogsSnap =
    await window.getDoc(
      window.doc(
        window.db,
        "app",
        "dailyLogs"
      )
    );


  // =========================
  // データをまとめる
  // =========================

  const data = {

    books:
      booksSnap.exists()
        ? booksSnap.data().books || []
        : [],

    seriesMaster:
      seriesSnap.exists()
        ? seriesSnap.data().series || []
        : [],

    characters:
      charactersSnap.exists()
        ? charactersSnap.data().characters || []
        : [],

    tagMaster:
      tagMasterSnap.exists()
        ? tagMasterSnap.data().tagMaster || []
        : [],

    dailyLogs:
      dailyLogsSnap.exists()
        ? dailyLogsSnap.data().dailyLogs || {}
        : {}

  };


  // =========================
  // ローカルにもバックアップ
  // =========================

  localStorage.setItem(
    "dokushoLogData",
    JSON.stringify(data)
  );


  return data;
}



//==============================
//====🔑データの保存処理：超重要！！
//==============================
async function saveData(){

  const data = {
    books,
    characters,
    tagMaster,
    seriesMaster,
    dailyLogs
  };

  // ローカル保存
  localStorage.setItem(
    "dokushoLogData",
    JSON.stringify(data)
  );

  // 同期版の場合だけFirestoreへ保存
  if(
  isSyncMode() &&
  isSyncEnabled()
){

  await syncToFirestore(data);

}

}




async function getSyncData(){

  return await loadDataFromFirestore();

}


//==========
//データ移行用
//==========
async function migrateFirestoreData(){

  console.log("🚚 Firestoreデータ移行開始");

  try{

    // =========================
    // 旧 app/data を取得
    // =========================

    const oldSnap =
      await window.getDoc(
        window.doc(
          window.db,
          "app",
          "data"
        )
      );

    if(!oldSnap.exists()){

      console.log(
        "⚠️ 旧 app/data が見つかりません"
      );

      return;

    }

    const oldData =
      oldSnap.data();
      
      //カウント用
      const migrationBooks =
  oldData.books || [];

const migrationSeries =
  (oldData.series || [])
    .concat(
      oldData.seriesMaster || []
    );

const migrationCharacters =
  oldData.characters || [];

const migrationTagMaster =
  oldData.tagMaster || [];

const migrationDailyLogs =
  oldData.dailyLogs || {};


    console.log(
      "旧データ取得完了",
      oldData
    );


    // =========================
    // 新しい5つの部屋へ保存
    // =========================

    await window.setDoc(
  window.doc(
    window.db,
    "app",
    "books"
  ),
  {
    books: migrationBooks
  }
);


   await window.setDoc(
  window.doc(
    window.db,
    "app",
    "series"
  ),
  {
    series: migrationSeries
  }
);


    await window.setDoc(
  window.doc(
    window.db,
    "app",
    "characters"
  ),
  {
    characters: migrationCharacters
  }
);


   await window.setDoc(
  window.doc(
    window.db,
    "app",
    "tagMaster"
  ),
  {
    tagMaster: migrationTagMaster
  }
);


   await window.setDoc(
  window.doc(
    window.db,
    "app",
    "dailyLogs"
  ),
  {
    dailyLogs: migrationDailyLogs
  }
);


   console.log(
  "✅ Firestoreデータ移行完了"
);

console.log(
  "📊 移行データ件数",
  {
    books: migrationBooks.length,
    series: migrationSeries.length,
    characters: migrationCharacters.length,
    tagMaster: migrationTagMaster.length,
    dailyLogs: Object.keys(migrationDailyLogs).length
  }
);

  }catch(e){

    console.error(
      "❌ Firestoreデータ移行失敗",
      e
    );

    alert(
      "Firestoreデータ移行に失敗しました。\n" +
      e.message
    );

  }

}


