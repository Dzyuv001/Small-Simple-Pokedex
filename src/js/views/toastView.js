export const renderToast = (message) =>{
    var elem = document.querySelector(".toast");
    elem.classList.add("toast--show");
    setTimeout(()=> elem.classList.remove("toast--show"), 3000);
  
}