//==============================
// UI
//
// ユーザーのインターフェースやで
//==============================



//==============================
// 通知
//==============================
function showToast(message){

  const toast =
    document.createElement("div");

  toast.className = "toast";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(()=>{
    toast.classList.add("show");
  },10);

  setTimeout(()=>{

    toast.classList.remove("show");

    setTimeout(()=>{
      toast.remove();
    },300);

  },2000);
}


//==============================
//右下の「↑」ちゃん
//==============================
function scrollToTop(){
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}




