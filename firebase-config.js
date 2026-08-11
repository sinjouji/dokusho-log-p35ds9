//
// FIREBASE-CONFIG.JS
// watasi
// ほぼ変更しない API

(async function(){

  console.log("🔥 firebase-config START");

  const {
    initializeApp
  } = await import(
    "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js"
  );

  const {
    getFirestore,
    doc,
    setDoc,
    getDoc
  } = await import(
    "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js"
  );

  const firebaseConfig = {
      apiKey: "AIzaSyDvYzIGUPnflmLtQh0lGmtHprk6cetHeYE",
  authDomain: "myreadinglog-e0cc4.firebaseapp.com",
  projectId: "myreadinglog-e0cc4",
  storageBucket: "myreadinglog-e0cc4.firebasestorage.app",
  messagingSenderId: "1005754930934",
  appId: "1:1005754930934:web:cb92ea93a66245243cfed7",
  measurementId: "G-ES0WYH0VXY"
  };

  const app =
    initializeApp(firebaseConfig);

  const db =
    getFirestore(app);

  window.db = db;
  window.doc = doc;
  window.setDoc = setDoc;
  window.getDoc = getDoc;

  window.firebaseReady = true;

  console.log(
    "🔥 firebase-config END",
    window.firebaseReady
  );

})();


/*
  apiKey: "AIzaSyDvYzIGUPnflmLtQh0lGmtHprk6cetHeYE",
  authDomain: "myreadinglog-e0cc4.firebaseapp.com",
  projectId: "myreadinglog-e0cc4",
  storageBucket: "myreadinglog-e0cc4.firebasestorage.app",
  messagingSenderId: "1005754930934",
  appId: "1:1005754930934:web:cb92ea93a66245243cfed7",
  measurementId: "G-ES0WYH0VXY"
  
  
  */