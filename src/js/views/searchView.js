import * as base from "./base";

// Stat = ((Base * 2 + IV + (EV/4)) * Level / 100 + 5) * Nmod

// Except for HP, which is:

// HP = (Base * 2 + IV + (EV/4)) * Level / 100 + 10 + Level

export const getInput = () => {//used to get the search criteria
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

export const clearInput = () => {

}

export const clearResult = () => {

}

const toggleLikes = (uId) => {

}

const pad = (str, max) => {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}

const genName = (id, uId, f) => {
    if (parseInt(uId) < 10000) {
        return pad(id, 3);
    }
    return `${pad(id, 3)}${f}`;
}

const renderPokemon = (form, likes) => {
    let markup = `
<div class="pokemon__container">`
    form.forEach((e, i) => {
        markup += `
    <div id="pokemon__Id--${e.uId}" class="pokemon__sub-container ${i > 0 ? 'pokemon__sub-container--visible' : ''}" >
        <div class="pokemon__buttons">
            <button data-value="${e.uId}" class="pokemon__vs">
                <svg>
                    <use xlink:href="./img/icons/sprites.svg#icon-vs"></use>
                </svg>
            </button>
            <button data-value="${e.uId}" class="pokemon__liked">
                <svg>
                    <use xlink:href="./img/icons/sprites.svg#icon-like${"undefined" !== typeof likes[e.uId] ? "" : "_dislike"}"></use>
                </svg>
            </button>
        </div>
        <figure class="pokemon__img">
            <a class="pokemon__link" href="?type=pokemon&id=${e.uId}#pokemon">
            <img src="../img/pokemonImages/${genName(e.id, e.uId, e.f)}.png" alt="pokemon">
            </a>
        </figure>
        <div class="pokemon__data">
            <a class="pokemon__link" href="?type=pokemon&id=${e.uId}#pokemon">
                <h4 class="pokemon__data-name">${e.n.charAt(0).toUpperCase() + e.n.slice(1)}</h4>
                <h4 class="pokemon__data-number">#${e.id}</h4>
            </a>
        <div class="pokemon__data-type">
            ${renderType(e.t)}
        </div>
    </div>
    </div>`;
    //image of pokemon <img src="../img/pokemonImages/${genName(e.id, e.uId, e.f)}.png" alt="pokemon"> 
    });
    if (form.length > 1) {
        markup += `<div class="pokemon__rad-container">`;
        form.forEach((e, i) => {
            markup += `<input name="${e.id}" class="pokemon__rad" data-value="${e.uId}" id="rad__Id--${e.uId}" type="radio" name="pokemon" ${i < 1 ? 'checked="checked"' : ""}>`;
        });
        markup += "</div>";
    }
    markup += `
</div>`;
    base.elements.pokedexDisplay.insertAdjacentHTML('beforeend', markup);
}

const renderType = (type) => {
    let typesMarkup = "";
    type.forEach(elem => {
        typesMarkup += `<button href="#" class="type type__${elem}"></button>`
    });
    return typesMarkup;
}

export const clearPokdex = () => {
    base.elements.pokedexDisplay.innerHTML = "";
}

export const renderPokedex = (pokemons, start, end, max, likes) => {
    const pokedexLoadMore = document.querySelector(".pokedex__loadMore");
    if (pokedexLoadMore) {
        pokedexLoadMore.parentNode.removeChild(pokedexLoadMore);
    }
    for (let i = start; i <= end; i++) {
        renderPokemon(pokemons[i], likes);
    }
    if (start + 42 <= max) {
        const htmlMarkup = `<button class="pokedex__loadMore btn btn--large grid__spanAll-width">Load more</button>`;
        base.elements.pokedexDisplay.insertAdjacentHTML(base.htmlIncept.beforeEnd, htmlMarkup);
    }
}
