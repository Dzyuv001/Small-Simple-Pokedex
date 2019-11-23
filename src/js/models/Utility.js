import typeData from "../JSON/slimTypes.json";

export const statNames = ["speed", "spDef", "spAtk", "defense", "attack", "hp"];
export const parameters = ["stats", "ev", "percent", "statsMinMax"];

export const calcMinMax = (level, stats) => {
  const statNames = ["speed", "spDef", "spAtk", "defense", "attack"];
  let statsMinMax = {};
  let min, max;
  const lvl = parseInt(level);
  min = Math.floor((2 * stats.hp * lvl) / 100) + lvl + 10;
  max =
    Math.floor(((2 * stats.hp + 31 + Math.floor(252 / 4)) * lvl) / 100) +
    lvl +
    10;
  statsMinMax.hp = { min, max };
  statNames.forEach(e => {
    const tempStat = parseInt(stats[e]);
    min = Math.floor(((tempStat * 2 * lvl) / 100 + 5) * 0.9);
    max = Math.floor((((tempStat * 2 + 31 + 252 / 4) * lvl) / 100 + 5) * 1.1);
    statsMinMax[e] = { min, max };
  });
  return statsMinMax;
};

export const getDamageTypes = type => {
  let keys = Object.keys(typeData); //getting type data keys for the later on looping
  const removeIndex = keys.indexOf("10001");
  keys.splice(removeIndex, 2);
  //similar to the keys array seen before the two array bellow are for looping and calculating needs
  const titles = {
    attack: [
      "Super_effective",
      "Normal_damage",
      "Not_very_effective",
      "No_damage"
    ],
    defense: ["Week_to", "Normal_damage", "Resistant_to", "Immune_to"]
  };
  let tempTypes = {};
  const damage = ["attack", "defense"];
  //using the pre-calculated data
  damage.forEach(dmg => {
    tempTypes[dmg] = {};
    titles[dmg].forEach(t => {
      tempTypes[dmg][t] = {};
    });
    tempTypes[dmg] = calcTypeDamage(
      tempTypes[dmg],
      type,
      titles[dmg],
      keys,
      dmg
    );
  });

  //setting the type data
  return tempTypes;
};

const calcTypeDamage = (typeGroup, type, group, keys, action) => {
  try {
    //looping through all the damage types
    for (let i = 0; i < keys.length; i++) {
      //used to get rid of the two pseudo-types
      //calculating type damage using a ternary operator to check if the damage will be based of 2 or 1 types
      console.log(typeGroup, type, group, keys, action);
      let tempTypeDamage =
        action == "defense" && type.length > 1
          ? typeData[type[0]][action][keys[i]] *
            typeData[type[1]][action][keys[i]]
          : typeData[type[0]][action][keys[i]];
      //the if statement are being used to write the value to the corresponding category
      if (tempTypeDamage > 1) {
        typeGroup[group[0]][[keys[i]]] = tempTypeDamage;
      } else if (tempTypeDamage == 1) {
        typeGroup[group[1]][[keys[i]]] = tempTypeDamage;
      } else if (tempTypeDamage < 1 && tempTypeDamage > 0) {
        typeGroup[group[2]][keys[i]] = tempTypeDamage;
      } else {
        typeGroup[group[3]][keys[i]] = tempTypeDamage;
      }
    }
    return typeGroup;
  } catch (error) {
    console.log(error);
  }
};
