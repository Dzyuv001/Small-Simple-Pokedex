export const evTitles = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  spAtk: "Sp.Atk",
  spDef: "Sp.Def",
  speed: "Speed"
};
export let evKeys = ["hp", "attack", "defense", "spAtk", "spDef", "speed"];
export const utillityObj = [
  { title: "HP", key: "hp" },
  { title: "Attack", key: "attack" },
  { title: "Defense", key: "defense" },
  { title: "Sp.Atk", key: "spAtk" },
  { title: "Sp.Def", key: "spDef" },
  { title: "Speed", key: "speed" }
];
const pad = (str, max) => {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
};

export const genName = (id, uId, f) => {
  if (parseInt(uId) < 10000) {
    return pad(id, 3);
  }
  return `${pad(id, 3)}${f}`;
};

export const upCaseFirstChr = str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const renderTypes = types => {
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
    tempTypeBtn += `<button data-value="${typelphabetIds[e]}" class="type type__${e}"></button>`;
  });
  return tempTypeBtn;
};

export const updateStartPercentageBars = parentArray => {
  parentArray.forEach(elem => {
    document
      .getElementById(elem)
      .querySelectorAll(".table__row-bar-data.stats__base-data")
      .forEach(e => {
        const percent = e.getAttribute("width");
        e.style.width = percent;
      });
  });
};

export const genEvMarkup = ev => {
  let evTotal = 0;
  let htmlMarkup = "";
  evKeys.forEach(e => {
    evTotal += ev[e];
    htmlMarkup += `
<div class="extra-stats__evs-container-${e}">
    <p>${evTitles[e]}</p>
    <span class="extra-stats__evs-val">+${ev[e]}</span>
</div>`;
  });
  htmlMarkup += `
<div class="extra-stats__evs-container-total">
    <p>Total Points:</p>
    <span class="extra-stats__evs-avl">${evTotal}</span>
    </div>
</div>`;
  return htmlMarkup;
};

export const renderMoveRow = (rowData, isLevelup, isCompare) => {
  return `
  <tr class="table__row">
      ${isLevelup ? `<td class="table__stats-val">${rowData.l}</td>` : ""}
      <td class="table__stats-val">${upCaseFirstChr(rowData.n)}</td>
      <td class="table__stats-val">
          ${renderTypes([rowData.t])}
      </td>
      <td class="table__stats-val">
          <button class="status status--${rowData.d}"></button>
      </td>
      <td class="table__stats-val">${rowData.p == null ? "_" : rowData.p}</td>
      <td class="table__stats-val">${rowData.a == null ? "_" : rowData.a}</td>
      <td class="table__stats-val">${rowData.pp}</td>
  ${isCompare ? '<td class="table__stats-val">' + rowData.ef + "x</td>" : ""}
  </tr>`;
};

export const renderEffectivenessMarkup = (keyName, damageNType) => {
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

export const renderAbilities = abilities => {
  let htmlMarkup = `
      <div class="extra-stats__abilities">
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
