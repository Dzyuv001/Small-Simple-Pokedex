export const elements = {
    // a js object (dictionary to store the elements of the DOM)
    pokedexDisplay: document.querySelector(".pokedex__display"),
    pokedexLoadMore: document.querySelector(".pokedex__loadMore"),
    pokemonPopup: document.querySelector("#pokemon"),
    pokemonPopupChild: document.querySelector("#pokemon .popup__container"),
    comparePopupChild: document.querySelector("#compare .popup__container"),
    genCheckbutton: document.querySelectorAll(".options__chk--gen"),
    optionsShow: document.querySelector(".options__chk-btn"),
    searchField: document.querySelector(".search__field"),
    searchBtn: document.querySelector(".search__btn"),
    searchType1: document.querySelector(".search__type-1"),
    searchType2: document.querySelector(".search__type-2"),
    searchMoveType: document.querySelector(".search__move-type"),
    searchColor: document.querySelector(".search__color"),
    searchShape: document.querySelector(".search__shape"),
    searchEggGroup: document.querySelector(".search__egg-group"),
    searchGenArray: document.querySelectorAll(".search__chk--gen"),
    searchNameMovesArray: document.querySelectorAll(".search__name-move"),
    likes: document.querySelector(".liked"),
    likesList: document.querySelector(".liked__list"),
    likesMenu: document.querySelector(".liked__field"),
    likeRemoveBtn: document.querySelector(".liked__remove")
};


// <!-- beforebegin -->
// <p>
//   <!-- afterbegin -->
//   foo
//   <!-- beforeend -->
// </p>
// <!-- afterend -->

export const htmlIncept = {
    beforeBegin: "beforeBegin",
    afterBegin: "afterBegin",
    beforeEnd: "beforeEnd",
    afterEnd: "afterEnd"
}

export const domStrings = {
    genCheckbutton: "options__chk--gen" //,
    // optionsShow
};


export const renderLoader = (parent,queryString) => {
    console.log("this is the parent element", parent);
    const loaderMarkup = `
    <div class="loader" data-value="${queryString}">
    <svg>
        <use xlink:href="./img/icons/sprites.svg#icon-loader"></use>
    </svg>
</div>
`;
    parent.insertAdjacentHTML(htmlIncept.afterBegin, loaderMarkup);
};

export const removeLoader = (parent) => {
    console.log("parent when removing element", parent);
    const loader = parent.querySelector(".loader");

    if (loader) {
        parent.removeChild(loader);
    }
};