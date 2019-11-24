import axios from "axios";
import { api } from "../config";
import pokedex from "../JSON/smallPokedexV2.json";
import pokemonUIdToId from "../JSON/pokemonToSpecies.json";
import * as utility from "./Utility";

export default class Compare {
  constructor(query) {
    this.pokeComp = [];
    for (let i = 0; i < 2; i++) {
      this.pokeComp[i] = {};
      this.pokeComp[i].id = "";
      this.pokeComp[i].uId = "";
    }
    if (query) {
      this.query = query;
      for (let i = 0; i < 2; i++) {
        const tempUId = query[`pokemon${i + 1}`];
        this.pokeComp[i].uId = tempUId;
        this.pokeComp[i].id = pokemonUIdToId[tempUId]
          ? pokemonUIdToId[tempUId]
          : tempUId;
      }
    }
  }

  getComparisonIds() {
    //used to get array of unique ids for the pokemon
    return [this.pokeComp[0].uId, this.pokeComp[1].uId];
  }

  isReadyForComparison() {
    //check if the compareson popup can be shown
    return this.pokeComp[0].id != "" && this.pokeComp[1].id != "";
  }

  isVsSettable(id) {
    //used to check if the compare option can be set
    const id0 = this.pokeComp[0].id;
    const id1 = this.pokeComp[1].id;
    const id0Blank = id0 == "";
    const id1Blank = id1 == "";
    const oneBlank = id0Blank || id1Blank;
    const allBlank = id0Blank && id1Blank;
    const uniquer = (id != id0 && !id0Blank) || (id != id1 && !id1Blank);
    return allBlank || (oneBlank && uniquer);
  }

  unSetIdOfPokemon(container) {
    //used to clear id
    this.pokeComp[container - 1].uId = "";
    this.pokeComp[container - 1].id = "";
  }

  setIdOfPokemon(pokemonID) {
    //set values of id and uId
    if (this.pokeComp[0].id === "") {
      this.pokeComp[0].uId = pokemonID;
      this.pokeComp[0].id =
        pokemonID > 10000 ? pokemonUIdToId[pokemonID] : pokemonID;
      return 1;
    } else if (this.pokeComp[1].id === "") {
      this.pokeComp[1].uId = pokemonID;
      this.pokeComp[1].id =
        pokemonID > 10000 ? pokemonUIdToId[pokemonID] : pokemonID;
      return 2;
    }
  }

  setVSPokemonData(uId) {
    //used to set the primary data 
    let pokemon = {};
    let id;
    uId > 10000 ? (id = pokemonUIdToId[uId]) : (id = uId);
    pokemon = pokedex[id];
    return {
      id: id,
      uId: uId,
      name: id == uId ? pokemon.n : pokemon.v[uId].n,
      type: pokemon.v[uId].t,
      form: pokemon.v[uId].f
    };
  }

  async getCompareData() {
    //used to get the pokemon data so that it can be displayed 
    //looping twice to get the pokemon data for both pokemon
    for (let i = 0; i <= 1; i++) {
      try {
        let workingId = this.query
          ? this.query[`pokemon${i + 1}`]
          : this.pokeComp[i].uId;
        const res = await axios(api.pokemon + workingId);
        let pokedexData = res.data;
        //prepping attributes for the comparison pokemon
        this.pokeComp[i].abilities = [];
        this.pokeComp[i].statTotal = 0;
        utility.parameters.forEach(param => {
          //setting empty object parameters to other objects
          this.pokeComp[i][param] = {};
        });
        //setting the stats, evs and calculating stat total parameters 
        pokedexData.stats.forEach((e, i1) => {
          //e = element , i1 = index
          const tempStat = parseInt(e.base_stat);
          this.pokeComp[i].stats[utility.statNames[i1]] = tempStat;
          this.pokeComp[i].ev[utility.statNames[i1]] = parseInt(e.effort);
          this.pokeComp[i].statTotal += tempStat;
        });
        //
        this.pokeComp[i].statsMinMax = utility.calcMinMax(
          100,
          this.pokeComp[i].stats
        );
        //calculate the percentages for each stat and store them in the corresponding pokemon
        pokedexData.stats.forEach((e, i1) => {
          this.pokeComp[i].percent[utility.statNames[i1]] =
            Math.round(
              (this.pokeComp[i].stats[utility.statNames[i1]] /
                this.pokeComp[i].statTotal) *
                1000
            ) / 10;
        });
        //setting the moves of the pokemon
        this.pokeComp[i].moves = await utility.getMoves(pokedexData.moves);
        pokedexData.abilities.forEach(async e => {
          this.pokeComp[i].abilities.push({
            isHidden: e.is_hidden,
            name: e.ability.name,
            description: await utility.getAbility(e.ability.url)
          });
        });
        //
        this.getPrimaryData(i);
        this.pokeComp[i].typeDamage = utility.getDamageTypes(
          this.pokeComp[i].types
        );
      } catch (error) {
        console.log(error);
      }
    }
    //adding the effectiveness of the moves to the moves data
    for (let i = 0; i <= 1; i++) {
      this.getDamageEffectiveness(i, this.pokeComp[i].moves);
    }
  }

  getMinMax(index) {
    //return the value of stats min max
    return this.pokeComp[index].statsMinMax;
  }

  setMinMax(level, index) {
    // set the min max values of stats
    this.pokeComp[index].statsMinMax = utility.calcMinMax(
      level,
      this.pokeComp[index].stats
    );
  }

  getDamageEffectiveness(index) {
    //used to set the damage multiplier based on the opponents type(s) 
    const effectKeys = Object.keys(this.pokeComp[index].typeDamage.defense);
    const moveGroupKeys = Object.keys(this.pokeComp[index].moves);
    const typeEffectiveness = [];
    effectKeys.forEach(e => {
      typeEffectiveness.push(
        this.pokeComp[index == 0 ? 1 : 0].typeDamage.defense[e]
      );
    });
    // loops through the move groups
    moveGroupKeys.forEach(e => {
      // used to check if the current move group is blank
      if (this.pokeComp[index].moves[e].length > 0) {
        //loop through all the moves in the move groups
        for (let i = 0; i <= this.pokeComp[index].moves[e].length - 1; i++) {
          // tempMove stores a particular more from the current category of moves 
          let tempMove = this.pokeComp[index].moves[e][i];
          //loop though the opponent pokemon's damage multipliers
          for (let e2 of typeEffectiveness) {
            //if the damage multiplier type = tempMove type the multiplier will be set
            if (e2.hasOwnProperty(tempMove.t)) {
              this.pokeComp[index].moves[e][i].ef = e2[tempMove.t];
              break;
            }
          }
        }
      }
    });
  }

  getPrimaryData(i) {
    // setting primary data
    const name =
      this.pokeComp[i].id == this.pokeComp[i].uId
        ? pokedex[this.pokeComp[i].id].n
        : pokedex[this.pokeComp[i].id].v[this.pokeComp[i].uId].n;
    const type = pokedex[this.pokeComp[i].id].v[this.pokeComp[i].uId].t;
    this.pokeComp[i].name = name;
    this.pokeComp[i].types = type;
  }
}
