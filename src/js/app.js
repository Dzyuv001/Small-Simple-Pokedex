import "../css/sass/main.scss";
import Search from "./models/Search";
import Pokemon from "./models/Pokemon";
import Compare from "./models/Compare";
import Likes from "./models/Likes";
import * as util from "./utility";
import * as searchView from "./views/searchView";
import * as pokemonView from "./views/pokemonView";
import * as compareView from "./views/compareView";
import * as likesView from "./views/likeView";
import * as toastView from "./views/toastView";
import * as base from "./views/base";

const controlSearch = async searched => {
  if (searched) {
    searchView.clearPokdex();
    const query = searchView.getInput();
    if (query) {
      if (!state.search) {
        state.search = new Search(query);
      } else {
        state.search.setQuery(query);
      }
      if (state.search.isNewQuery()) {
        base.renderLoader(base.elements.pokedexDisplay);
        state.search.getResults();
        setTimeout(() => {
          base.removeLoader(base.elements.pokedexDisplay);
          searchView.renderPokedex(
            state.search.result,
            state.search.start,
            state.search.end,
            state.search.max,
            state.likes.likes
          );
        }, 2000);
      }
    }
  }
};

const controlPokemon = async () => {
  const queryString = util.getURLParams(document.URL);
  if (queryString) {
    document.querySelector("#pokemon").classList.toggle("live");
    //set up object
    state.pokemon = await new Pokemon(queryString);
    pokemonView.clearMarkup();
    //add loader
    base.renderLoader(base.elements.pokemonPopupChild);
    base.elements.pokemonPopupChild.classList.add("info__loading");
    try {
      await state.pokemon.getPokemonData();
      setTimeout(() => {
        //remove loader
        base.removeLoader(base.elements.pokemonPopupChild);
        base.elements.pokemonPopupChild.classList.remove("info__loading");
        pokemonView.renderPokemon(
          state.pokemon.pokeData,
          state.likes.isLiked(state.pokemon.pokeData.primary.uId)
        );
      }, 4000);
    } catch (error) {
      toastView.renderToast(error);
    }
  }
};

//Control Compare
const controlCompare = async () => {
  const queryString = util.getURLParams(document.URL);
  document.querySelector("#compare").classList.toggle("live");
  if (queryString) {
    //add loader
    base.renderLoader(base.elements.comparePopupChild);
    base.elements.comparePopupChild.classList.add("info__loading");
    if (!state.compare) state.compare = new Compare(queryString);
    compareView.clearMarkup();
    try {
      await state.compare.getCompareData();
      //remove loader
      setTimeout(() => {
        base.removeLoader(base.elements.comparePopupChild);
        base.elements.comparePopupChild.classList.remove("info__loading");
        compareView.renderCompare(state.compare.pokeComp);
      }, 4000);
    } catch (error) {
      toastView.renderToast(error);
    }
  }
};

const prepComparison = async uId => {
  //setup object
  if (!state.compare) state.compare = new Compare();
  if (state.compare.isVsSettable(uId)) {
    let container = await state.compare.setIdOfPokemon(uId);
    let data = await state.compare.setVSPokemonData(uId);
    document.getElementById(
      `comparison__pokemon--${container}`
    ).innerHTML = compareView.renderVSPokemon(data, container);
    document
      .getElementById(`comparison__pokemon--${container}`)
      .parentElement.classList.toggle("live");
  }
  if (state.compare.isReadyForComparison()) {
    document
      .querySelector(".compare__btn")
      .classList.add("compare__btn--ready");
  }
};

const controlLikes = uId => {
  //check if not liked
  if (!state.likes.isLiked(uId)) {
    // if not liked
    //make sure the pokemon object exists
    if (!state.pokemon) state.pokemon = new Pokemon();
    //get the pokemon data => id, uId, type, name, form
    const pokemon = state.pokemon.getDisplayData(uId);
    //create a new like
    const newLike = state.likes.addLike(
      pokemon.id,
      pokemon.uId,
      pokemon.name,
      pokemon.type,
      pokemon.form
    );
    //save like data
    state.likes.storeData();
    //toggle Liked button to liked
    likesView.toggleLikeBtn(uId, true);
    //add the element
    likesView.renderLike(newLike);
  } else {
    // if liked save like data
    state.likes.storeData();
    //remove the like from the Likes Array on the Likes object
    state.likes.deleteLike(uId);
    //uncheck the like button
    likesView.toggleLikeBtn(uId, false);
    // remove hte likes element on the likes
    likesView.deleteLike(uId);
    //save like data
    state.likes.storeData();
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

const clearComparisonContainer = containerId => {
  if (!state.compare) {
    state.compare = new Compare();
  }
  state.compare.unSetIdOfPokemon(containerId);
  const container = document.getElementById(
    `comparison__pokemon--${containerId}`
  );
  container.innerHTML = "";
  container.parentElement.classList.toggle("live");
};

//Events
window.addEventListener("load", () => {
  // the event is ran when the page is loaded
  respondToQueryString(); //get the query string from the url
  //getLikes
  state.likes = new Likes(); // setting the like object to state
  state.likes.readStorage(); //reading the data from the local storage API
  controlSearch(true);
  const likeKeys = Object.keys(state.likes.likes); //getting keys from likes
  likeKeys.forEach(key => {
    //using said keys to loop through the object
    //function will render the likes on the like panel visible
    likesView.renderLike(state.likes.likes[key]);
  });
  //like panel visible
  likesView.toggleLikeMenu(state.likes.getNumLikes());
});

document.addEventListener("click", function(e) {
  e.stopPropagation();
  if (e.target) {
    if (e.target.className.includes("table__sortable")) {
      // the data value property will contain a two values split with a "-"
      let dataValueArray = e.target.getAttribute("data-value").split("-");
      let parent = e.target.parentNode;
      let parentDataValue = parent.getAttribute("data-value");
      if (parentDataValue) {
        if (parentDataValue === dataValueArray[0]) {
          e.target.innerHTML =
            e.target.innerHTML.indexOf("▲") != -1
              ? e.target.innerHTML.replace("▲", "▼")
              : e.target.innerHTML.replace("▼", "▲");
        } else {
          parent.getElementsByTagName("th")[parentDataValue].innerHTML = parent
            .getElementsByTagName("th")
            [parentDataValue].innerHTML.replace("▲", "")
            .replace("▼", "");
          e.target.innerHTML += "▲";
        }
      } else {
        e.target.innerHTML += "▲";
      }
      parent.setAttribute("data-value", dataValueArray[0]);
      util.sortTable(
        dataValueArray[0],
        e.target.parentNode.parentNode.parentNode.id,
        dataValueArray[1]
      );
    }
    if (e.target.className.includes("btn__circle--top")) {
      e.preventDefault();
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }

    if (e.target.className.includes("popup__btn-close")) {
      e.preventDefault();
      e.target.parentElement.parentElement.classList.toggle("live");
    }

    if (e.target.parentNode.className.includes("pokemon__link")) {
      e.preventDefault();
      window.history.pushState("", "Pokemon Name", e.target.parentNode.href);
      controlPokemon();
    }

    if (e.target.className.includes("compare__btn")) {
      if (state.compare && state.compare.isReadyForComparison()) {
        const currentURL = util.getPathFromUrl(window.location.href);
        const comparisonUIds = state.compare.getComparisonIds();
        const queryString = `?type=compare&pokemon1=${comparisonUIds[0]}&pokemon2=${comparisonUIds[1]}#compare`;
        const fullURL = currentURL + queryString;
        window.history.pushState("", "Versus Mode", fullURL);
        controlCompare();
      } else {
        toastView.renderToast("Two pokemon must be selected for comparison");
      }
    }
    if (
      e.target.className.includes("pokemon__vs") ||
      e.target.className.includes("liked__vs")
    ) {
      const uId = e.target.getAttribute("data-value");
      prepComparison(uId);
    }

    if (e.target.className.includes("popup__btn-like")) {
      const uId = e.target.getAttribute("data-value");
      pokemonView.toggleLike(state.likes.isLiked(uId));
      controlLikes(uId);
    }

    if (
      e.target.className.includes("pokemon__liked") ||
      e.target.className.includes("liked__remove")
    ) {
      const uId = e.target.getAttribute("data-value");
      controlLikes(uId);
    }

    if (e.target.className.includes("compare__remove-btn")) {
      e.preventDefault();
      const container = e.target.getAttribute("data-value");
      document
        .querySelector(".compare__btn")
        .classList.remove("compare__btn--ready");
      clearComparisonContainer(container);
    }

    if (
      e.target.className.includes("pokemon__rad") &&
      !e.target.className.includes("pokemon__rad-container")
    ) {
      const id = e.target.getAttribute("data-value");
      const elem = e.target.parentNode.parentNode.querySelectorAll(
        ".pokemon__sub-container"
      );
      elem.forEach(e => {
        e.classList.add("pokemon__sub-container--visible");
      });
      document
        .getElementById(`pokemon__Id--${id}`)
        .classList.remove("pokemon__sub-container--visible");
    }

    if (e.target.className.includes("live")) {
      e.target.classList.remove("live");
    }

    if (e.target.className.includes("pokedex__loadMore")) {
      state.search.getSearchStartEnd();
      searchView.renderPokedex(
        state.search.result,
        state.search.start,
        state.search.end,
        state.search.max,
        state.likes.likes
      );
    }

    if (e.target.className.includes("primary__btn")) {
      e.preventDefault();
      const growthRate = e.target.getAttribute("data-value");
      const txtExp = document.getElementById("txtExp");
      let level = txtExp.value;
      let expNeed = state.pokemon.getExpNeededForLevel(growthRate, level);
      const txtExpNeeded = document.getElementById("txtExpNeeded");
      txtExpNeeded.innerHTML = "  " + expNeed + " exp";
    }

    if (
      e.target.className.includes("effectiveness__tab") &&
      !e.target.className.includes("effectiveness__tab--active")
    ) {
      const id = e.target.getAttribute("id");
      const id_0 = id.split("-")[0];
      let lblEffectivenessString, tblEffectivenessString;
      if (id_0 == "lblEffectiveness") {
        lblEffectivenessString = "lblEffectiveness-";
        tblEffectivenessString = "tblEffectiveness-";
      } else {
        const idSection = id_0.split("_")[1];
        lblEffectivenessString = `lblCompareEffectiveness_${idSection}-`;
        tblEffectivenessString = `tblCompareEffectiveness_${idSection}-`;
      }
      const elementId = id.split("-")[1];
      const otherId = elementId == 1 ? 0 : 1;
      document
        .getElementById(lblEffectivenessString + elementId)
        .classList.add("effectiveness__tab--active");
      document
        .getElementById(tblEffectivenessString + elementId)
        .classList.add("effectiveness--visible");
      document
        .getElementById(lblEffectivenessString + otherId)
        .classList.remove("effectiveness__tab--active");
      document
        .getElementById(tblEffectivenessString + otherId)
        .classList.remove("effectiveness--visible");
    }

    if (
      e.target.className.includes("stats__tab") &&
      !e.target.className.includes("stats__tab--active")
    ) {
      const id = e.target.getAttribute("id");
      const id_0 = id.split("-")[0];
      let elemClass;
      let lblStatsString, elemStatsString;
      if (id_0 == "lblBaseStats") {
        lblStatsString = "lblBaseStats-";
        elemStatsString = "elemBaseStats-";
        elemClass = "stats__tab-element--visible";
      } else {
        lblStatsString = "lblCompareBaseStats-";
        elemStatsString = `elemCompareBaseStats-`;
        elemClass = "versus__toggle-element--visible";
      }
      const elementId = id.split("-")[1];
      const otherId = elementId == 1 ? 0 : 1;
      document
        .getElementById(lblStatsString + elementId)
        .classList.add("stats__tab--active");
      document
        .getElementById(elemStatsString + elementId)
        .classList.add(elemClass);
      document
        .getElementById(lblStatsString + otherId)
        .classList.remove("stats__tab--active");
      document
        .getElementById(elemStatsString + otherId)
        .classList.remove(elemClass);
    }
  }
});

window.onscroll = e => {
  const rem_10 = util.convertRemToPixels(10);
  var scrollTop =
    window.pageYOffset !== undefined
      ? window.pageYOffset
      : (document.documentElement || document.body.parentNode || document.body)
          .scrollTop;
  const rem_4 = rem_10 * 0.4;
  const percentStateScroll = (state.scrollY / innerHeight) * 100;
  const percentScrollTop = (scrollTop / innerHeight) * 100;
  if (
    // used to change the size of the pokemon being displayed
    state.scrollY == 0 ||
    percentStateScroll - percentScrollTop > 20 ||
    percentScrollTop - percentStateScroll > 20
  ) {
    state.scrollY = scrollTop;
    if (scrollTop >= rem_10) {
      document
        .querySelector(".pokedex__compare.compare")
        .classList.add("compare__compressed");
    } else {
      document
        .querySelector(".pokedex__compare.compare")
        .classList.remove("compare__compressed");
    }
  }
  if (scrollTop >= rem_4) {
    //used to show the scroll up screen
    document
      .querySelector(".btn__circle--top")
      .classList.add("btn__circle--top-visible");
  } else {
    document
      .querySelector(".btn__circle--top")
      .classList.remove("btn__circle--top-visible");
  }
};

base.elements.searchBtn.addEventListener("click", e => {
  e.preventDefault();
  controlSearch(true);
});

document.addEventListener("keyup", e => {
  if (e.keyCode === 13) {
    //enter key event
    const activeElement = document.activeElement.getAttribute("id");
    switch (activeElement) {
      case "txtLevelCalculator": // used to calculate stats for a single pokemon
        const statLevel = pokemonView.getStatsLevel();
        state.pokemon.setMinMax(statLevel);
        pokemonView.updateStatsMinMax(state.pokemon.getMinMax());
        break;
      case "txtCompareLevelCalculator-0":
      case "txtCompareLevelCalculator-1":
        // used to see which pokemons in the compare popup
        const pokemonIndex = activeElement.split("-")[1];
        state.compare.setMinMax(statLevel, pokemonIndex);
        compareView.updateStatsMinMax(state.compare.getMinMax(pokemonIndex));
        break;
      default:
        e.preventDefault();
        break;
    }
  }
});

const respondToQueryString = () => {
  //if there is a query string, the a response should be generated based on said query
  const queryString = util.getURLParams(document.URL);
  switch (queryString.type) {
    case "pokemon":
      controlPokemon();
      break;
    case "compare":
      prepComparison(queryString.pokemon1);
      prepComparison(queryString.pokemon2);
      controlCompare();
      break;
  }
};

const init = () => {
  // entry point to application
  const state = {};
  window.state = state;
  state.scrollY = 0;
  state.scrollX = 0;
};

init();
