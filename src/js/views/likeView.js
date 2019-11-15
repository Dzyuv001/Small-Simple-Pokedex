import { elements } from "base";

export const toggleLikeMenu = numLikes => {
  document.querySelector(".liked__field").style.visibility =
    numLikes > 0 ? "visible" : "hidden";
};

export const toggleLikeBtn = (uId, isLiked) => {
  const elem = document.querySelector(
    `#pokemon__Id--${uId} .pokemon__liked svg use`
  );
  console.log("the button is ", elem);
  if (elem) {
    elem.setAttribute(
      "xlink:href",
      `./img/icons/sprites.svg#icon-like${isLiked ? "" : "_dislike"}`
    );
    console.log(
      "the data for the like is ",
      uId,
      isLiked,
      isLiked ? "" : "_dislike",
      elem.getAttribute("xlink:href")
    );
  }
};

const renderTypes = type => {
  let typesMarkup = "";
  type.forEach(e => {
    typesMarkup += `<p class="type--small type__${e}"></p>`;
  });
  return typesMarkup;
};

const upCaseFirstChr = str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const pad = (str, max) => {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
};

const genName = (id, uId, f) => {
  if (parseInt(uId) < 10000) {
    return pad(id, 3);
  }
  return `${pad(id, 3)}${f}`;
};

export const renderLike = like => {
  const htmlMarkup = `
<li id="like__link-${like.uId}" class="liked__link">
    <a class="pokemon__link" href="?type=pokemon&amp;id=${like.uId}#pokemon">
    <img class="liked__img"src="../img/pokemonImages/${genName(
      like.id,
      like.uId,
      like.form
    )}.png" alt="pokemon">
     <!--<img src="img/pokemonGifs/${like.id}.gif" alt="">-->
    </a>
    <div class="liked__data">
           <h4>
            <span class="liked__num">${upCaseFirstChr(like.name)}</span>
            #<span class="liked__name">${like.id}</span>
        </h4>
         <div class="liked__type">
             ${renderTypes(like.types)}
        </div>
    </div>
    <div class="liked__buttons">
        <button data-value="${like.uId}" class="liked__remove liked__btn">
        <svg>
            <use xlink:href="./img/icons/sprites.svg#icon-like"></use>
        </svg>
        </button>
        <button data-value="${like.uId}" class="liked__vs liked__btn">
        <svg>
            <use xlink:href="./img/icons/sprites.svg#icon-vs"></use>
        </svg>
        </button>
    </div>
</li>`;
  document
    .querySelector(".liked__list")
    .insertAdjacentHTML("beforeend", htmlMarkup);
};

export const deleteLike = uId => {
  const elem = document.getElementById(`like__link-${uId}`);
  // used to store the element dom reference of the element that will be removed form the like list
  if (elem) elem.remove(elem);
};
