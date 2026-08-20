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





//===============================
// savedata 同期
//===============================
async function syncToFirestore(data){

  await window.setDoc(
    window.doc(window.db, "app", "data"),
    data
  );

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

  const snap =
    await window.getDoc(
      window.doc(
        window.db,
        "app",
        "data"
      )
    );

  if(!snap.exists()){
    return null;
  }

  const data = snap.data();

  // ローカルにもバックアップ
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




