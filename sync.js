//===============================
//
// 私用 SYNC.JS 共通化チェックOK
//
// 要確認：setSyncEnabled()の挙動、rebuildBookMap()の呼び出し挙動
//
//
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



async function setSyncEnabled(enabled){

  // 切り替え前の状態を保存
  const wasEnabled = enableSync;

  enableSync = enabled;

  localStorage.setItem(
    "enableSync",
    String(enabled)
  );

  // OFF → ON に切り替えた場合だけ、
  // ローカルデータを優先して全データを同期する
  if(!wasEnabled && enabled){

    const data = {
      books,
      characters,
      tagMaster,
      seriesMaster,
      dailyLogs
    };

    // 5種類すべてを未同期扱いにする
    pendingSync.books = true;
    pendingSync.series = true;
    pendingSync.characters = true;
    pendingSync.tagMaster = true;
    pendingSync.dailyLogs = true;

    savePendingSync();

    // 保存開始を表示
    updateDataSyncStatus(null, "saving");

    try{
      await syncToFirestore(data);

      console.log(
        "ローカルデータのFirestoreへの同期処理が完了しました"
      );

      // 未同期データが残っていない場合だけ完了表示
      if(hasPendingSyncChanges()){
        updateDataSyncStatus(null, "unsynced");
      }else{
        updateDataSyncStatus(null, "synced");
      }

    }catch(e){
      console.error(
        "Firestoreへの全データ同期に失敗しました",
        e
      );

      // 保存に失敗した場合は未同期として表示
      updateDataSyncStatus(null, "unsynced");
    }

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


const PENDING_SYNC_KEY = "dokushoLogPendingSync";

const PENDING_SYNC_DEFAULT = {
  books: false,
  series: false,
  characters: false,
  tagMaster: false,
  dailyLogs: false
};

function loadPendingSync(){
  try{
    const saved = localStorage.getItem(PENDING_SYNC_KEY);

    if(!saved){
      return { ...PENDING_SYNC_DEFAULT };
    }

    return {
      ...PENDING_SYNC_DEFAULT,
      ...JSON.parse(saved)
    };

  }catch(e){
    console.error("未同期状態の読み込み失敗", e);
    return { ...PENDING_SYNC_DEFAULT };
  }
}

let pendingSync = loadPendingSync();

function savePendingSync(){
  localStorage.setItem(
    PENDING_SYNC_KEY,
    JSON.stringify(pendingSync)
  );
}


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
    savePendingSync();
  }
}

function markDataChanged(type){
  if(
    Object.prototype.hasOwnProperty.call(
      pendingSync,
      type
    )
  ){
    pendingSync[type] = true;
    savePendingSync();
  }
}

//===============================
// Firestore読込前の安全確認用
//===============================
// 未同期の変更が残っているか確認
function hasPendingSyncChanges(){
  return Object.values(pendingSync).some(Boolean);
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
async function loadDataFromFirestore({ saveLocal = true } = {}){

  if(!window.firebaseReady){

    console.log("⏳ Firebase待機中...");

    await new Promise(resolve =>
      setTimeout(resolve, 100)
    );

    return loadDataFromFirestore({ saveLocal });
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
  // 必要な場合だけローカルにも保存
  // =========================

  if(saveLocal){
    localStorage.setItem(
      "dokushoLogData",
      JSON.stringify(data)
    );
  }

  return data;
}



/*=======================
 同期版：ローカルからデータ呼び出し
 ※高速起動用キャッシュ
=======================*/
function loadDataFromLocal(){

  const saved = localStorage.getItem(
    "dokushoLogData"
  );

  if(!saved){
    return null;
  }

  return JSON.parse(saved);

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

    // 保存開始を表示
    updateDataSyncStatus(null, "saving");

    try{

      await syncToFirestore(data);

      // 未同期の変更が残っていないか確認
      if(hasPendingSyncChanges()){
        updateDataSyncStatus(null, "unsynced");
      }else{
        updateDataSyncStatus(null, "synced");
      }

    }catch(e){

      console.error(
        "Firestoreへの保存に失敗しました",
        e
      );

      // 保存失敗時は未同期として表示
      updateDataSyncStatus(null, "unsynced");

      // 呼び出し元でも失敗を検知できるようにする
      throw e;

    }

  }

}





async function getSyncData(saveLocal = true){

  return await loadDataFromFirestore({
    saveLocal
  });

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




// =========================
// 
// =========================

