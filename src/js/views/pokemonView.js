import { elements, htmlIncept } from "./base";
import Chart from "chart.js";
import * as util from "../utility";

export const isSearchTextBlank = () => {
  return elements.searchField.value != "";
};

export const getStatsLevel = () => {
  return document.getElementById("txtLevelCalculator").value;
};

export const clearMarkup = () => {
  document.querySelector(".primaryInfo__left").innerHTML = "";
  document.querySelector(".primaryInfo__right").innerHTML = "";
  document.querySelector(".evolution").innerHTML = "";
  document.querySelector(".extra-stats").innerHTML = "";
  document.querySelector(".stats__defense").innerHTML = "";
  document.querySelector(".moves").innerHTML = "";
};

export const renderPokemon = (pokeData, isLiked) => {
  document.querySelector(".primaryInfo__left").innerHTML = renderPrimaryLeft(
    pokeData.primary
  );
  document.querySelector(".primaryInfo__right").innerHTML = renderPrimaryRight(
    pokeData.primary,
    pokeData.flavorText,
    pokeData.ev,
    pokeData.eggData,
    pokeData.genders,
    pokeData.catchRate
  );
  document.querySelector(".evolution").innerHTML = renderEvolutionTree(
    pokeData.evolutionTree
  );
  document.querySelector(".extra-stats").innerHTML =
    renderAbilities(pokeData.abilities) + renderHeldItems(pokeData.heldItem);
  renderStats(
    pokeData.stats,
    pokeData.statsMinMax,
    pokeData.statTotal,
    pokeData.percent,
    pokeData.ev
  );
  document.querySelector(".stats__defense").innerHTML = renderDamageMultipliers(
    pokeData.typeDamage
  );
  document.querySelector(".moves").innerHTML = renderMoves(pokeData.moves);
  document
    .querySelector(".popup__btn-like")
    .setAttribute("data-value", pokeData.primary.uId);
  toggleLike(pokeData.primary.uId, isLiked);

  renderStatsRadar(pokeData.stats, pokeData.primary.name);
};

export const toggleLike = isLiked => {
  const elem = document.querySelector(".popup__btn-like svg use");
  if (elem)
    elem.setAttribute(
      "xlink:href",
      `./img/icons/sprites.svg#icon-like${isLiked ? "" : "_dislike"}`
    );
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

const renderPrimaryLeft = data => {
  return `
    <h1 class="heading-1 grid__spanAll-width grid__center">${upCaseFirstChr(
      data.name
    )} #${data.id}</h1>
<section class="primaryInfo__left">
<img class="primaryInfo__left-image" src="../img/pokemonImages/${genName(
    data.id,
    data.uId,
    data.form
  )}.png" alt="pokemon">
    <div class="primaryInfo__left-overlay-container">
        ${renderTypes(data.type)}
    </div>
</section>`;
};

const renderTypes = types => {
  let tempTypeBtn = "";
  const typelphabetIds = {
    1: "13",
    2: "6",
    3: "8",
    4: "14",
    5: "11",
    6: "16",
    7: "1",
    8: "9",
    9: "17",
    10: "7",
    11: "18",
    12: "10",
    13: "4",
    14: "15",
    15: "12",
    16: "3",
    17: "2",
    18: "5"
  };
  types.forEach(e => {
    tempTypeBtn += `<a data-value="${typelphabetIds[e]}" href="" class="type type__${e}"></a>`;
  });
  return tempTypeBtn;
};

const renderPrimaryRight = (
  primaryData,
  flavorText,
  ev,
  eggData,
  gender,
  catchRate
) => {
  const color = [
    "Black",
    "Blue",
    "Brown",
    "Gray",
    "Green",
    "Pink",
    "Purple",
    "Red",
    "White",
    "Yellow"
  ];
  let height = "";
  const heightInInches = primaryData.height * 3.2808;
  height +=
    Math.trunc(heightInInches) +
    "'" +
    ((heightInInches - Math.floor(heightInInches)) * 12).toFixed(0) +
    '"  ';
  height += primaryData.height + "m";
  let weight = "";
  weight += Math.floor(primaryData.weight * 2.2).toFixed(2) + "lbs. ";
  weight += primaryData.weight + "kg ";
  let eggGroupsHTMLMarkup = " ";
  eggData.eggGroup.forEach((e, i) => {
    eggGroupsHTMLMarkup += `
<span class="eggGroup__variety-${e}">
    ${upCaseFirstChr(e)}
    ${i + 1 != eggData.eggGroup.length ? ", " : ""}
</span>`;
  });
  return `
        <div class="primaryInfo__right-element">
            <p class="primaryInfo__right-element-title">Height:</p>
            <p class="primaryInfo__right-element-data"> ${height}</p>
        </div>
        <div class="primaryInfo__right-element">
            <p class="primaryInfo__right-element-title">Weight:</p>
            <p class="primaryInfo__right-element-data">${weight}</p>
        </div>
       <div class="primaryInfo__right-element primaryInfo__right-element primaryInfo__right-element-full-width">
       <form class="primaryInfo__right-element-data primaryInfo__right-from input__form--flex-row-center">
       <p class="primaryInfo__right-element-title">Level Calculator: </p>
                <div class="primaryInfo__input-container input__field-container ">
                <input type="number" min="0" max="100" id="txtExp" class="input__field primaryInfo__right-text-input" placeholder="Desired Level">
                    <button data-value="${
                      primaryData.growth.growthRate
                    }" class="btn btn--small primary__btn">=</button>
                </div>
                <p class="primaryInfo__right-element-data" id="txtExpNeeded"></p>
            </form>
        </div>
        <div class="primaryInfo__right-element">
            <p class="primaryInfo__right-element-title">Base Exp:</p>
            <p class="primaryInfo__right-element-data">${
              primaryData.baseExp
            } exp</p>
        </div>
        <div class="primaryInfo__right-element">
            <p class="primaryInfo__right-element-title">Base Friendship:</p>
            <p class="primaryInfo__right-element-data">${
              primaryData.baseFriendship
            }</p>
        </div>
        <div class="primaryInfo__right-element">
            <p class="primaryInfo__right-element-title">Egg Group:</p>
            <p class="primaryInfo__right-element-data">${eggGroupsHTMLMarkup}</p>
        </div>
        <div class="primaryInfo__right-element">
            <p class="primaryInfo__right-element-title">Gender:</p>
            <p class="primaryInfo__right-element-data">
                <span class="primaryInfo__right-male">${
                  gender.m
                }% male</span><span class="primaryInfo__right-female">${
    gender.f
  }% female</span>
            </p>
        </div>
        <div class="primaryInfo__right-element">
            <p class="primaryInfo__right-element-title">Egg Cycles:</p>
            <p class="primaryInfo__right-element-data">${eggData.hatchCount}
                <span>(${formatNumber(
                  (eggData.hatchCount + 1) * 255
                )}–${formatNumber((eggData.hatchCount + 1) * 257)} steps)</span>
            </p>
        </div>
        <div class="primaryInfo__right-element">
        <p class="primaryInfo__right-element-title">Catch Rate:</p>
        <p class="primaryInfo__right-element-data">${catchRate}%</p>
    </div>
        <div class="primaryInfo__right-element">
            <p class="primaryInfo__right-element-title">Colours:</p>
            <p class="primaryInfo__right-element-data">
                <span class="primaryInfo__color primaryInfo__color--${
                  primaryData.color
                }">
                    ${color[primaryData.color - 1]}
                </span>
            </p>
        </div>
        <div class="primaryInfo__right-element">
            <p class="primaryInfo__right-element-title">Body Type: ${upCaseFirstChr(
              primaryData.shape[1]
            )}</p>
            <img src="img/bodystyle/Body${primaryData.shape[0]}.png" alt="">
        </div>
        <div class="primaryInfo__right-element primaryInfo__right-element-full-width">
        <p class="primaryInfo__right-element-title"> EV Stats</p>
        ${renderEVs(ev)}
        </div>
        <div class="primaryInfo__right-element primaryInfo__right-element-full-width">
            <p class="primaryInfo__right-element-title">Pokemon Description:</p>
            <p class="primaryInfo__right-element-data">${flavorText}</p>
        </div>`;
};

const renderStats = (stats, minMax, total, percent) => {
  let htmlMarkup = `
<!--<h2 class="heading-2">Base Stats</h2>
<h3 class="heading-3">
    <span id="lblBaseStats-0" class="stats__tab stats__tab--active">Radar Chart</span>/
    <span id="lblBaseStats-1" class="stats__tab">Stats Table</span>
</h3>-->`;
  document
    .querySelector(".stats__base")
    .insertAdjacentHTML(htmlIncept.afterBegin, htmlMarkup);
  htmlMarkup = renderStatsTable(stats, minMax, total, percent);
  document
    .querySelector(".stats__base")
    .insertAdjacentHTML(htmlIncept.beforeEnd, htmlMarkup);
};

const renderStatsTable = (stats, minMax, total, percent) => {
  const utillityObj = [
    { title: "HP", key: "hp" },
    { title: "Attack", key: "attack" },
    { title: "Defense", key: "defense" },
    { title: "Sp.Atk", key: "spAtk" },
    { title: "Sp.Def", key: "spDef" },
    { title: "Speed", key: "speed" }
  ];
  let htmlMarkup = `
<table id="elemBaseStats-1" class="stats__base-table stats__tab-element table">
    <thead>
        <th class="table__heading" colspan="3">Stats</th>
        <th class="table__heading">Min</th>
        <th class="table__heading">Max</th>
    </thead>
    <tbody>`;
  utillityObj.forEach(stat => {
    htmlMarkup += `
        <tr class="table__row stats__base-${stat.key}" data-value="${stat.key}">
            <td class="table__row-title stats__base-title">${stat.title}:</th>
            <td class="table__stats-val">${stats[stat.key]}</td>
            <td class="table__row-bar">
                <div class="table__row-bar-data stats__base-data" width="${
                  percent[stat.key]
                }%"></div>
            </td>
            <td class="table__stats-val stat__min">${minMax[stat.key].min}</td>
            <td class="table__stats-val stat__max">${minMax[stat.key].max}</td>
        </tr>`;
  });

  htmlMarkup += `
    </tbody>
    <tfoot>
        <tr>
            <td class="table__row-title">Total</th>
            <td class="table__stats-val">${total}</td>
            <th id="txtLevelCalc" class="table__update-field" colspan="3">
                At Lvl <input id="txtLevelCalculator" type="number" min="1" max="100" placeholder="100">
            </th>
        </tr>
    </tfoot>
</table>`;
  return htmlMarkup;
};

export const updateStatsMinMax = values => {
  const tableRows = document.querySelectorAll("#elemBaseStats-1 .table__row");
  tableRows.forEach(elem => {
    const tempTitle = elem.getAttribute("data-value");
    elem.querySelector(".stat__min").innerHTML = values[tempTitle].min;
    elem.querySelector(".stat__max").innerHTML = values[tempTitle].max;
  });
};

const renderStatsRadar = (stats, name) => {
  const chart = document.getElementById("elemBaseStats-0");
  const statsTitles = ["attack", "defense", "hp", "spAtk", "spDef", "speed"];
  const pointTitles = [
    "Attack",
    "Defense",
    "HP",
    "Special Attack",
    "Special Defense",
    "Speed"
  ];

  const statValues = [];
  let largest = 0;
  const labelCallback = (tooltipItem, data) => {
    let labelMarkup =
      data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
    return " : " + labelMarkup;
  };
  //used to find the largest value to base the radar chart around
  statsTitles.forEach(e => {
    largest < stats[e] ? (largest = stats[e]) : "";
    statValues.push(stats[e]);
  });

  var options = {
    responsive: true,
    maintainAspectRatio: true,
    scale: {
      ticks: {
        beginAtZero: true,
        max: largest
      }
    },
    tooltips: {
      enabled: true,
      mode: "single",
      callbacks: {
        labelColor: function(tooltipItem, chart) {
          return {
            borderColor: "#2b9ec8",
            backgroundColor: "#2b9ec8"
          };
        },
        label: labelCallback
      }
    }
  };

  var dataLiteracy = {
    labels: pointTitles,
    datasets: [
      {
        label: name,
        backgroundColor: "#76cde744",
        borderColor: "#76cde7",
        pointBackgroundColor: "rgba(179,181,198,1)",
        pointBorderColor: "#2b9ec8",
        pointBorderWidth: 3,
        pointRadius: 3,
        pointHoverBackgroundColor: "#d5d2a8",
        pointHoverBorderColor: "rgba(179,181,198,1)",
        pointHoverBorderWidth: 5,
        data: statValues
      }
    ]
  };
  if (radarChart) radarChart.destroy();
  let radarChart = new Chart(chart, {
    type: "radar",
    data: dataLiteracy,
    options: options
  });
  chart.removeAttribute("style");
};

const renderEffectivenessMarkup = (keyName, damageNType) => {
  let effectiveTableRow = `
<tr class="table__row">
    <td class="effectiveness__title table__row-title ">${keyName.replace(
      /_/g,
      " "
    )}: </td>
    <td class="effectiveness__container">
        ${buildContainers(damageNType)}
    </td>
</tr>`;
  return effectiveTableRow;
};

const buildContainers = damageNType => {
  let effectiveElements = "";
  Object.entries(damageNType).forEach(e => {
    effectiveElements += `
        <div class="effectiveness__element effectiveness__element-${e[0]}">
            <span class="effectiveness__value">${e[1]}×</span>
        </div>`;
  });
  return effectiveElements;
};

const renderDamageMultipliers = typeDamage => {
  let htmlMarkup = "";
  let damageChategories = Object.keys(typeDamage);
  const tableTiles = ["Defense", "Attack"];
  let damageKeys = [
    Object.keys(typeDamage[damageChategories[0]]),
    Object.keys(typeDamage[damageChategories[1]])
  ];
  htmlMarkup += `
    <h2 class="heading-2">Damage Multiplier</h2>
    <h3 class="heading-3">`;
  damageKeys.forEach((e, i) => {
    htmlMarkup += `<span id="lblEffectiveness-${i}" class="effectiveness__tab ${
      i == 0 ? "effectiveness__tab--active" : ""
    }">${tableTiles[i]}</span>${i == 0 ? "/" : ""}`;
  });
  htmlMarkup += `</h3>`;
  damageKeys.forEach((e, i) => {
    htmlMarkup += `
            <table id="tblEffectiveness-${i}" class="table effectiveness ${
      i == 0 ? "effectiveness--visible" : ""
    }">`;
    e.forEach(e1 => {
      htmlMarkup += renderEffectivenessMarkup(
        e1,
        typeDamage[damageChategories[i]][e1]
      );
    });
    htmlMarkup += `</table>`;
  });
  return htmlMarkup;
};

const renderAbilities = abilities => {
  let htmlMarkup = `
    <div class="extra-stats__abilities">
        <h2 class="heading-2">Abilities</h2>
        <table class="extra-stats__abilities-table table">
            <thead>
                <tr>
                    <th class="table__heading">Name</th>
                    <th class="table__heading">isHidden</th>
                    <th class="table__heading">Description</th>
                </tr>
            </thead>
        <tbody>`;
  abilities.forEach(e => {
    htmlMarkup += `
<tr class="table__row">
    <td class="table__stats-val">${upCaseFirstChr(e.name)}</td>
    <td class="table__stats-val">${e.isHidden}</td>
    <td class="table__stats-val">${e.description}</td>
</tr>`;
  });
  htmlMarkup += `
                </tbody>
            </table>
        </div>`;
  return htmlMarkup;
};

const renderHeldItems = heldItems => {
  let htmlMarkup = `<div class="extra-stats__items">`;

  if (heldItems) {
    htmlMarkup += `
        <div class="extra-stats__items">
            <h2 class="heading-2">Held Items</h2>
            <table class="extra-stats__items-table table">
                <thead>
                    <tr>
                        <th class="table__heading">Image</th>
                        <th class="table__heading">Name</th>
                        <th class="table__heading">Rarity</th>
                        <th class="table__heading">Effect</th>
                    </tr>
                </thead>
            <tbody>`;
    heldItems.forEach(e => {
      htmlMarkup += `
                    <tr class="table__row">
                        <td class="table__stats-val">image will go here</td>
                        <td class="table__stats-val">${upCaseFirstChr(
                          e.name
                        )}</td>
                        <td class="table__stats-val">${e.rarity}</td>
                        <td class="table__stats-val">${e.effect}%</td>
                    </tr>`;
    });
    htmlMarkup += `
                    </tbody>
                </table>
            </div>`;
  } else {
    htmlMarkup += `
<h2 class="heading-2">Held Items</h2>
<div class="extra-stats__items-container">
    <figure class="extra-stats__items-image">
        <img src="" alt="no items held" height="50%" width="50%">
    </figure>
    <h4 class="heading-4">There are no items held by this pokemon</h4>
</div>`;
  }
  htmlMarkup += "</div>";
  return htmlMarkup;
};

const upCaseFirstChr = str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const renderEVs = ev => {
  const evTitles = {
    hp: "HP",
    attack: "Atk",
    defense: "Def",
    spAtk: "Sp.Atk",
    spDef: "Sp.Def",
    speed: "Speed"
  };
  let evTotal = 0;
  let evKeys = ["hp", "attack", "defense", "spAtk", "spDef", "speed"];
  let htmlMarkup = `
<!--<div class="extra-stats__evs">
    <h2 class="heading-2">EV Stats</h2>-->
    <div class="extra-stats__evs-display">`;
  evKeys.forEach((e, i) => {
    evTotal += ev[e];
    htmlMarkup += `
<div class="extra-stats__evs-container-${e}">
    <p>${evTitles[e]}</p>
    <span class="extra-stats__evs-val">+${ev[e]}</span>
</div>`;
  });
  htmlMarkup += `
<div class="extra-stats__evs-container-total">
    <p>Total Points: ${evTotal}</p>
    </div>
</div>
<!--</div>-->`;
  return htmlMarkup;
};

const getChildMarkUp = evolutions => {
  let tempMarkup = "";
  let evoLength = evolutions.length;
  evolutions.forEach((e, i) => {
    const evoPointRotation =
      evoLength == 1 || (i == 2 && evoLength == 3)
        ? ""
        : ` evolution__pointer-${i + 1}Of${evoLength}`;
    tempMarkup += renderEvolutionNode(e, evoPointRotation);
  });
  return tempMarkup;
};

const renderEvolutionNode = (evoNode, pointerRotation) => {
  //used to render the html where the pokemon information will be displayed
  let htmlMarkup = ""; // stores the html markup
  let hasEvos = evoNode.evolutions.length > 0; //check if there are eny more evolutions
  // before {pokemon1} -> {evolutionFrom1} -> {otherEvolutuionFrom1}
  //                  -> {evolutionFrom1}
  // after {pokemon1}
  //                  -> {otherEvolutionFrom1}
  let childHTMLMarkup = hasEvos ? getChildMarkUp(evoNode.evolutions) : "";
  if (evoNode.evolutions.length > 1) {
    // additional html markup to make the data more presentable
    childHTMLMarkup = `<div class="evolution__container-column"> ${childHTMLMarkup} </div>`;
  }
  let sectionMarkup = `${
    evoNode.isRoot ? `<div class="evolution__container-row">` : ``
  }
    <div class="evolution__pokemon">
    <img class="evolution__pokemon-image" src="../img/pokemonImages/${genName(
      evoNode.id,
      evoNode.id
    )}.png" alt="pokemon">
        <h4 class="heading-4 evolution__pokemon-naming">
            <span class="evolution__pokemon-name">${upCaseFirstChr(
              evoNode.name
            )}</span>
            <span class="evolution__pokemon-number">#${evoNode.id}</span>
        </h4>
    <div class="evolution__pokemon-types">
    ${renderTypes(evoNode.types)}
    </div>
    </div>
    ${childHTMLMarkup}
    ${evoNode.isRoot ? `</div >` : ""}`;

  evoNode.isRoot
    ? (htmlMarkup += `${sectionMarkup}`)
    : (htmlMarkup += `
<div class="evolution__container-row">
    <div class="evolution__cause">
        <p class="evolution__pointer${pointerRotation}">→</p>
        <p class="evolution__requirement">${evoNode.requirement}</p>
    </div>
    ${sectionMarkup}
</div>`);
  return htmlMarkup;
};

const renderEvolutionTree = evolutionTree => {
  return `
    <h2 class="heading-2">Evolution</h2>
        <div class="evolution__type">
            ${renderEvolutionNode(evolutionTree, "")}
        </div>`;
};

const renderMoveRow = (rowData, isLevelup) => {
  return `
<tr class="table__row">
    ${isLevelup ? `<td class="table__stats-val">${rowData.l}</td>` : ""}
    <td class="table__stats-val">${upCaseFirstChr(rowData.n)}</td>
    <td class="table__stats-val moves__type">
        ${renderTypes([rowData.t])}
    </td>
    <td class="table__stats-val">
        <button class="status status--${rowData.d}"></button>
    </td>
    <td class="table__stats-val">${rowData.p == null ? "_" : rowData.p}</td>
    <td class="table__stats-val">${rowData.a == null ? "_" : rowData.a}</td>
    <td class="table__stats-val">${rowData.pp}</td>
</tr>`;
};

const renderMoveTable = (moveTable, typeTable, id) => {
  const isLevelup = typeTable == "Moves learned by leveling-up" ? true : false;
  let htmlMarkUp = "";
  let rowMarkup = "";
  if (moveTable.length) {
    moveTable.forEach(e => {
      rowMarkup += renderMoveRow(e, isLevelup);
    });
    htmlMarkUp = `<section class="moves__section">
    <h3 class="heading-3">${typeTable}</h3>

    <table id="moves__${id}"  class="moves__moves table table__sortable">
        <thead>
            <tr>
                ${
                  isLevelup
                    ? `<th data-value="0-int" id="moves__${id}--Lvl" class="table__heading table__sortable">Lvl</th>`
                    : ""
                }
                <th  ${
                  isLevelup ? 'data-value="1-str"' : 'data-value="0-str"'
                } id="moves__${id}--Move" class="table__heading table__sortable">Move</th>
                <th  ${
                  isLevelup ? 'data-value="2-data"' : 'data-value="1-data"'
                } id="moves__${id}--Type" class="table__heading table__sortable">Type</th>
                <th  ${
                  isLevelup ? 'data-value="3-str"' : 'data-value="2-str"'
                } id="moves__${id}--Category" class="table__heading table__sortable">Category</th>
                <th  ${
                  isLevelup ? 'data-value="4-int"' : 'data-value="3-int"'
                } id="moves__${id}--Power" class="table__heading table__sortable">Pwr</th>
                <th  ${
                  isLevelup ? 'data-value="5-int"' : 'data-value="4-int"'
                } id="moves__${id}--Accuracy" class="table__heading table__sortable">Acc</th>
                <th  ${
                  isLevelup ? 'data-value="6-int"' : 'data-value="5-int"'
                } id="moves__${id}--PP" class="table__heading table__sortable">PP</th>
            </tr>
        </thead>
        <tbody>
            ${rowMarkup}
        </tbody >
    </table >
</section > `;
  } else {
    htmlMarkUp += `
<section class="moves__section">
    <h3 class="heading-3">${typeTable}</h3>
    <figure class="">
        <img src="" alt="">
    </figure>
    <h4 class="heading-4">This pokemon does not have any move gained through this method</h4>
</section >`;
  }
  return htmlMarkUp;
};

const renderMoves = moves => {
  const keys = Object.keys(moves);
  let htmlMarkup = "";
  const tableTitles = {
    "level-up": "Moves learned by leveling-up",
    machine: "Moves learned from TMs",
    egg: "Moves learned from Egg",
    tutor: "Moves learned from"
  };
  keys.forEach(e => {
    htmlMarkup += renderMoveTable(moves[e], tableTitles[e], e);
  });
  return `
    <h2 class="heading-2 moves__title">Pokemon Moves</h2>${htmlMarkup}
    `;
};

const formatNumber = num => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};
