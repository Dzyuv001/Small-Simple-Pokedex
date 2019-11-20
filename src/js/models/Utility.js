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
