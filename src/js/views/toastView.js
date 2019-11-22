export const renderToast = (message) =>{
    var elem = document.querySelector(".toast");
    elem.classList.add("toast--show");
    elem.querySelector("p").innerHTML = message;
    setTimeout(()=> elem.classList.remove("toast--show"), 3000);
}