import { elements, htmlIncept } from "./base";
import Chart from "chart.js";
import * as util from "./utility";

export const renderVSPokemon = (pokeData, container) => {
  const htmlMarkup = `
<a data-value="${container}" href="#pokedex" class="compare__remove-btn">X</a>
    <figure class="compare__pokemon-img">
    <img src="../img/pokemonImages/${util.genName(
      pokeData.id,
      pokeData.uId,
      pokeData.form
    )}.png" alt="pokemon">
</figure>
<div class="pokemon__data">
    <h4 class="pokemon__data-name">${util.upCaseFirstChr(pokeData.name)}</h4>
    <h4 class="pokemon__data-number">#${pokeData.id}</h4>
    <div class="pokemon__data-type">
        ${util.renderTypes(pokeData.type)}
    </div>
</div>`;
  return htmlMarkup;
};

export const clearMarkup = () => {
  const DOMStrings = [
    ".versus__container.primaryInfo",
    ".versus__container.extra-stats",
    ".versus__container.evs",
    ".stats__defense.versus__container",
    ".stats__base-compare-table.versus__container",
    ".moves__levelup",
    ".moves__tms",
    ".moves__egg",
    ".moves__tutor"
  ];
  DOMStrings.forEach(dom => {
    document.querySelector(dom).innerHTML = "";
  });
};

export const renderCompare = pokeData => {
  for (let i = 0; i <= 1; i++) {
    document.querySelector(
      ".versus__container.primaryInfo"
    ).innerHTML += renderPrimary(pokeData[i]);
    document.querySelector(
      ".versus__container.extra-stats"
    ).innerHTML += util.renderAbilities(pokeData[i].abilities);
    document.querySelector(".versus__container.evs").innerHTML += renderEVs(
      pokeData[i].ev
    );
    document.querySelector(
      ".stats__defense.versus__container"
    ).innerHTML += renderDamageMultipliers(pokeData[i].typeDamage, i);
    document.querySelector(
      ".stats__base-compare-table.versus__container"
    ).innerHTML += renderStatsTable(
      pokeData[i].stats,
      pokeData[i].statsMinMax,
      pokeData[i].statTotal,
      pokeData[i].percent,
      i
    );
    renderMoves(pokeData[i].moves, i);
  }
  renderStatsRadar(pokeData);
  util.updateStartPercentageBars(["tblCompareStats-0","tblCompareStats-1"]);

};

const renderPrimary = pokeData => {
  const htmlMarkup = `
<section class="versus__info primaryInfo">
    <h1 class="heading-1 versus__name"><span>${util.upCaseFirstChr(
      pokeData.name
    )}</span> <span>#${pokeData.id}</span></h1>
    <img class="primaryInfo__left-image" src="../img/pokemonImages/${util.genName(
      pokeData.id,
      pokeData.uId,
      pokeData.form
    )}.png" alt="">
    <div class="primaryInfo__left-overlay-container">
        <div class="pokemon__data-type">
            ${util.renderTypes(pokeData.types, true)}
        </div>
    </div>
</section>
`;
  return htmlMarkup;
};

export const updateStatsMinMax = (values, index) => {
  const tableRows = document.querySelectorAll(`#tblCompareStats-${index}`);
  tableRows.forEach(elem => {
    const tempTitle = elem.getAttribute("data-value");
    elem.querySelector(".stat__min").innerHTML = values[tempTitle].min;
    elem.querySelector(".stat__max").innerHTML = values[tempTitle].max;
  });
};

const renderStatsRadar = pokeData => {
  const chart = document.getElementById("elemCompareRadar");
  const statsTitles = ["attack", "defense", "hp", "spAtk", "spDef", "speed"];
  const pointTitles = [
    "Attack",
    "Defense",
    "HP",
    "Special Attack",
    "Special Defense",
    "Speed"
  ];

  let largest = 0;

  let dataSetTemplate = [
    {
      label: "",
      backgroundColor: "#76cde744",
      borderColor: "#76cde7",
      pointBackgroundColor: "rgba(179,181,198,1)",
      pointBorderColor: "#2b9ec8",
      pointBorderWidth: 3,
      pointRadius: 3,
      pointHoverBackgroundColor: "#76cde7",
      pointHoverBorderColor: "rgb(179,181,198)",
      pointHoverBorderWidth: 5,
      data: []
    },
    {
      backgroundColor: "#e7768644",
      borderColor: "#e77686",
      pointBackgroundColor: "rgb(255,188,201)",
      pointBorderColor: "#c82b4f",
      pointBorderWidth: 3,
      pointRadius: 3,
      pointHoverBackgroundColor: "#e77686",
      pointHoverBorderColor: "rgb(255,188,201)",
      pointHoverBorderWidth: 5,
      data: []
    }
  ];

  const labelCallback = (tooltipItem, data) => {
    let labelMarkup =
      data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
    return " : " + labelMarkup;
  };

  //used to find the largest value to base the radar chart around
  pokeData.forEach((e, i) => {
    statsTitles.forEach(e1 => {
      largest < e.stats[e1] ? (largest = e.stats[e1]) : "";
      dataSetTemplate[i].data.push(e.stats[e1]);
      dataSetTemplate[i].label = util.upCaseFirstChr(e.name);
    });
  });

  let dataLiteracy = {
    labels: pointTitles,
    datasets: dataSetTemplate
  };

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
        label: labelCallback
      }
    }
  };
  if (radarChart) radarChart.destroy();
  let radarChart = new Chart(chart, {
    type: "radar",
    data: dataLiteracy,
    options: options
  });
};

const renderDamageMultipliers = (typeDamage, index) => {
  let htmlMarkup = "";
  let damageChategories = Object.keys(typeDamage);
  const tableTiles = ["Defense", "Attack"];
  let damageKeys = [
    Object.keys(typeDamage[damageChategories[0]]),
    Object.keys(typeDamage[damageChategories[1]])
  ];
  htmlMarkup += `
    <div class="versus__container versus__container--column versus__container--half">
    <h3 class="heading-3">`;
  damageKeys.forEach((e, i) => {
    htmlMarkup += `<span id="lblCompareEffectiveness_${index}-${i}" class="effectiveness__tab  ${
      i == 0 ? "effectiveness__tab--active" : ""
    }">${tableTiles[i]}</span>${i == 0 ? "/" : ""}`;
  });
  htmlMarkup += `</h3>`;
  damageKeys.forEach((e, i) => {
    htmlMarkup += `
            <table id="tblCompareEffectiveness_${index}-${i}" class="table effectiveness versus__container--half ${
      i == 0 ? "effectiveness--visible" : ""
    }">`;
    e.forEach(e1 => {
      htmlMarkup += util.renderEffectivenessMarkup(
        e1,
        typeDamage[damageChategories[i]][e1]
      );
    });
    htmlMarkup += `</table>`;
  });;
  return htmlMarkup+"</div>";
};

const renderStatsTable = (stats, minMax, total, percent, index) => {
  let htmlMarkup = `
<table id="tblCompareStats-${index}" class="versus__table stats__base-table table">
    <thead>
        <th class="table__heading" colspan="3">Stats</th>
        <th class="table__heading">Min</th>
        <th class="table__heading">Max</th>
    </thead>
    <tbody>`;
  util.utillityObj.forEach(stat => {
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
                At Lvl <input id="txtCompareLevelCalculator-${index}" type="number" min="1" max="100" placeholder="100">
            </th>
        </tr>
    </tfoot>
</table>`;
  return htmlMarkup;
};

const renderEVs = ev => {
  let htmlMarkup = `
<div class="extra-stats__evs">
    <div class="extra-stats__evs-display">
    ${util.genEvMarkup(ev)}`;
  return htmlMarkup + "</div>";
};

const renderMoveRow = (rowData, isLevelup) => {
  return `
<tr class="table__row">
    ${isLevelup ? `<td class="table__stats-val">${rowData.l}</td>` : ""}
    <td class="table__stats-val">${util.upCaseFirstChr(rowData.n)}</td>
    <td class="table__stats-val">
        ${util.renderTypes([rowData.t], true)}
    </td>
    <td class="table__stats-val">
        <button class="status status--${rowData.d}"></button>
    </td>
    <td class="table__stats-val">${rowData.p == null ? "_" : rowData.p}</td>
    <td class="table__stats-val">${rowData.a == null ? "_" : rowData.a}</td>
    <td class="table__stats-val">${rowData.pp}</td>
    <td class="table__stats-val">${rowData.ef}x</td>
</tr>`;
};

const renderMoveTable = (moveTable, typeTable, id, index) => {
  const isLevelup = typeTable == "Moves learned by leveling-up" ? true : false;
  let htmlMarkUp = "";
  let rowMarkup = "";
  if (moveTable.length) {
    moveTable.forEach(e => {
      rowMarkup += util.renderMoveRow(e, isLevelup,true);
    });
    htmlMarkUp = `
<section class="moves__section">
    <table id="moves__${id}-${index}"  class="moves__moves table table__sortable">
        <thead>
            <tr>
                ${
                  isLevelup
                    ? `<th data-value="0-int" id="moves__${id}--Lvl" class="table__heading table__sortable">Lvl</th>`
                    : ""
                }
                <th  ${
                  isLevelup ? 'data-value="1-str"' : 'data-value="0-str"'
                } id="moves__${id}--Move" class="table__heading table__sortable">Name</th>
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
                <th  ${
                  isLevelup ? 'data-value="7-int"' : 'data-value="6-int"'
                } id="moves__${id}--PP" class="table__heading table__sortable">FX</th>
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
    <p>This pokemon does not have any move gained through this method</p>
</section >`;
  }
  return htmlMarkUp;
};

const renderMoves = (moves, index) => {
  const keys = Object.keys(moves);
  const htmlSelectors = {
    "level-up": ".moves__levelup",
    machine: ".moves__tms",
    egg: ".moves__egg",
    tutor: ".moves__tutor"
  };
  keys.forEach(e => {
    document.querySelector(
      `.versus__container${htmlSelectors[e]}`
    ).innerHTML += renderMoveTable(moves[e], htmlSelectors[e], e, index);
  });
};
