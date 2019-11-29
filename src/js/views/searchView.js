import * as base from "./base";
import * as util from "./utility";

export const getInput = () => {
  //used to get the search criteria
  const searchCriteria = {};
  searchCriteria.search = base.elements.searchField.value;
  searchCriteria.pokemonMoves = "";
  base.elements.searchNameMovesArray.forEach(e => {
    if (e.checked) {
      searchCriteria.pokemonMoves = e.value;
    }
  });
  searchCriteria.type1 = base.elements.searchType1.value;
  searchCriteria.type2 = base.elements.searchType2.value;
  searchCriteria.color = base.elements.searchColor.value;
  searchCriteria.shape = base.elements.searchShape.value;
  searchCriteria.moveType = base.elements.searchMoveType.value;
  searchCriteria.eggGroup = base.elements.searchEggGroup.value;
  searchCriteria.gen = "";
  base.elements.searchGenArray.forEach(e => {
    searchCriteria.gen += e.checked ? "1" : "0";
  });
  return searchCriteria;
};

export const setInput = (queryString)=>{
  //used to set the search criteria
  base.elements.searchField.value = queryString.search;
  base.elements.searchNameMovesArray[queryString.pokemonMoves].checked = true;
  base.elements.searchType1.value = queryString.type1;
  base.elements.searchType2.value = queryString.type2;
  base.elements.searchColor.value = queryString.color;
  base.elements.searchShape.value= queryString.shape;
  base.elements.searchMoveType.value =queryString.moveType;
  base.elements.searchEggGroup.value= queryString.eggGroup;
  queryString.split("").forEach((val,i)=>{
    base.elements.searchGenArray[i].checked = parseInt(val)
  });
}

const renderPokemon = (form, likes) => {
  //used to render the pokemon 
  let markup = `
<div class="pokemon__container">`;
  form.forEach((e, i) => {
    markup += `
    <div id="pokemon__Id--${e.uId}" class="pokemon__sub-container ${
      i > 0 ? "pokemon__sub-container--visible" : ""
    }" >
        <div class="pokemon__buttons">
            <button data-value="${e.uId}" class="pokemon__vs">
                <svg>
                    <use xlink:href="../img/icons/sprites.svg#icon-vs"></use>
                </svg>
            </button>
            <button data-value="${e.uId}" class="pokemon__liked">
                <svg>
                    <use xlink:href="../img/icons/sprites.svg#icon-like${
                      "undefined" !== typeof likes[e.uId] ? "" : "_dislike"
                    }"></use>
                </svg>
            </button>
        </div>
        <figure class="pokemon__img">
            <a class="pokemon__link" href="?type=pokemon&id=${e.uId}#pokemon">
            <img src="../img/pokemonImages/${util.genName(
              e.id,
              e.uId,
              e.f
            )}.png" alt="${e.n}">
            </a>
        </figure>
        <div class="pokemon__data">
            <a class="pokemon__link" href="?type=pokemon&id=${e.uId}#pokemon">
                <h4 class="pokemon__data-name">${e.n.charAt(0).toUpperCase() +
                  e.n.slice(1)}</h4>
                <h4 class="pokemon__data-number">#${e.id}</h4>
            </a>
        <div class="pokemon__data-type">
            ${renderType(e.t)}
        </div>
    </div>
    </div>`;
  });
  if (form.length > 1) {
    markup += `<form class="pokemon__rad-container">`;
    form.forEach((e, i) => {
      markup += `<input name="${e.id}" class="pokemon__rad" data-value="${
        e.uId
      }" id="rad__Id--${e.uId}" type="radio" name="pokemon" ${
        i < 1 ? 'checked="checked"' : ""
      }>`;
    });
    markup += "</form>";
  }
  markup += `
</div>`;
  base.elements.pokedexDisplay.insertAdjacentHTML("beforeend", markup);
};

const renderType = type => {
  let typesMarkup = "";
  type.forEach(elem => {
    typesMarkup += `<button href="#" class="type type__${elem}"></button>`;
  });
  return typesMarkup;
};

export const clearPokdex = () => {
  base.elements.pokedexDisplay.innerHTML = "";
};

export const renderPokedex = (pokemons, start, end, max, likes) => {
  const pokedexLoadMore = document.querySelector(".pokedex__loadMore");
  if (pokedexLoadMore) {
    pokedexLoadMore.parentNode.removeChild(pokedexLoadMore);
  }
  if (end > 0) {
    for (let i = start; i <= end; i++) {
      if (pokemons[i] !== undefined) {
        renderPokemon(pokemons[i], likes);
      }
    }
    if (start + 42 <= max) {
      const htmlMarkup = `<button class="pokedex__loadMore btn btn--large grid__spanAll-width">Load more</button>`;
      base.elements.pokedexDisplay.insertAdjacentHTML(
        base.htmlIncept.beforeEnd,
        htmlMarkup
      );
    }
  } else {
    const htmlMarkup = '<h2 class="heading-2">No pokemon found</h2>';
    base.elements.pokedexDisplay.insertAdjacentHTML("beforeend", htmlMarkup);
  }
};
