import pokedex from "../JSON/smallPokedexV2.json";
import moves from "../JSON/minMoves.json";
import * as util from "../utility";
import formToSpecies from "../JSON/pokemonToSpecies.json";

export default class Search {
  constructor(query) {
    this.setQuery(query);
    this.isFiltrating = false; //state bool to see if the data is being searched or filtered
    this.clearQuery = `{"search":"","pokemonMoves":"1","type1":"0","type2":"0","color":"0","shape":"0","moveType":"0","eggGroup":"0","gen":"0000000"}`;
    this.pokemonKeys = Object.keys(pokedex); //store the id of the pokemon and not the
    this.moveKeys = Object.keys(moves);
    this.matchingIds = [];
    this.type1Ids = [];
    this.type2Ids = [];
    this.genIds = [];
    this.colorIds = [];
    this.shapeIds = [];
    this.eggGroupIds = [];
    this.moveTypeIds = [];
    this.result = [];
    this.start = -1;
    this.end = -1;
    this.oldQuery = {};
  }

  setQuery(query) {
    // used to rest the query string and some display elements
    this.query = query ? query : util.getURLParams(query);
    this.start = -1;
    this.end = -1;
  }

  isNewQuery() {
    // used to check if the new query is new or the user is just triggered the same query
    //the this is done to prevent the website from doing the same query over and over;
    return this.oldQuery == {} || this.oldQuery != this.query;
  }

  resetQueryResults() {
    this.result = [];
    this.matchingIds = [];
    this.isFiltrating = false;
  }

  getResults() {
    if (JSON.stringify(this.query) != this.clearQuery) {
      console.log("this is the query right here", this.query);
      this.resetQueryResults();
      //check if the user wants to search for pokemon name
      if (
        this.query.search &&
        (this.query.pokemonMoves == "1" || this.query.pokemonMoves == "3")
      ) {
        //calling pokemon
        this.searchPokemonName();
        this.isFiltrating = true;
      }
      //check if user wants to search for pokemon move name 
      if (
        this.query.search &&
        (this.query.pokemonMoves == "2" || this.query.pokemonMoves == "3")
      ) {
        this.searchMove();
        this.isFiltrating = true;
      }
        //there are 8 different possibilities
        //they are no types , type1 , type2 and type1 and type2
        //and those can be seen as filtering existing ids or find pokemon with searched types
        if (this.isFiltrating) {
          console.log("there are 0 matching ids");
          //checks if filter or search operation
          if (this.query.type1 != 0) {
            console.log("type 1 is set not to 0");
            this.matchingIds = this.searchType(false);
            if (this.query.type2 != 0) {
              console.log("type 2 is set not to 0");
              this.type2Ids = this.searchType(true);
              this.type2Ids.forEach(e => {
                if (!this.matchingIds.includes(e)) this.matchingIds.push(e);
              });
            }
          } else if (this.query.type2 != 0) {
            console.log("type 2 is set not to 0");
            this.matchingIds = this.searchType(true);
          }
        } else {
          if (this.query.type1 != 0) {
            this.isFiltrating = true;
            console.log("type 1 is set not to 0");
            this.type1Ids = this.searchType(false);
            if (this.query.type2 != 0) {
              console.log("type 2 is set not to 0");
              this.type2Ids = this.searchType(true);
              this.type2Ids.forEach(e => {
                if (!this.type1Ids.includes(e)) this.type1Ids.push(e);
              });
            }
            this.filterOut(this.type1Ids);
          } else if (this.query.type2 != 0) {
            this.isFiltrating = true;
            this.filterOut(this.searchType(true));
          }
        }
      //   console.log("after type search for types", this.matchingIds);
      //   if (this.query.gen != "") {
      //     this.isFiltrating = true;
      //     console.log("gen is being searched");
      //     this.searchGen();
      //   }
      //   console.log("after type search gen", this.matchingIds);

      //   if (this.query.color != "0") {
      //     this.isFiltrating = true;
      //     console.log("color is being searched");
      //     this.searchColor();
      //   }
      //   console.log("after type search colour", this.matchingIds);

      //   if (this.query.shape != "0") {
      //     this.isFiltrating = true;
      //     console.log("shape is being searched");
      //     this.searchShape();
      //   }
      //   console.log("after type search shape", this.matchingIds);

      //   if (this.query.eggGroup != "0") {
      //     this.isFiltrating = true;
      //     console.log("eggGroup is being searched");
      //     this.searchEggGroup();
      //   }
      //   console.log("after type search egg group", this.matchingIds);

      //   if (this.query.moveType != "0") {
      //     this.isFiltrating = true;
      //     console.log("moveType is being searched");
      //     this.searchMoveType();
      //   }
      //   console.log("after type search move Type", this.matchingIds);

      //loop through the the ids that matched the query
      console.log("the matching ids are", this.matchingIds);
      this.matchingIds.forEach(e => {
        //used to get id
        const tempId = e > 10000 ? formToSpecies[e] : e;
        //used to get pokemon data from pokedex
        let tempPokemon = pokedex[tempId];
        if (!this.result.hasOwnProperty(tempId))
          this.result[tempPokemon.id] = [];
        this.setResultElement(tempId, e);
        //used to remove blank elements
        this.result = this.result.filter(v => v != "");
      });
    } else {
      if (this.oldQuery != this.query) {
        this.resetQueryResults();
        this.pokemonKeys.forEach(e => {
          for (const e1 in pokedex[e].v) {
            if (!this.result.hasOwnProperty(e - 1)) this.result[e - 1] = [];
            this.setResultElement(e, e1, true);
          }
        });
      }
    }
    this.oldQuery = this.query;
    this.max = Object.keys(this.result).length;
    this.getSearchStartEnd();
  }

  isQueryFieldUpdated(field) {
    return this.oldQuery[field] == this.query[field];
  }

  setResultElement(id, uId, print = false) {
    // print bool that ether data printed directly or filtered and printed
    this.result[print ? id - 1 : id].push({
      id: id,
      n: pokedex[id].v[uId].n != "" ? pokedex[id].v[uId].n : pokedex[id].n,
      t: pokedex[id].v[uId].t,
      uId: pokedex[id].v[uId].id,
      f: pokedex[id].v[uId].f
    });
  }

  getSearchStartEnd() {
    const increment = 50;
    if (this.start == -1) {
      this.start = 0;
    } else if (this.start + increment < this.max) {
      this.start = this.end + 1;
    } else {
      this.start = this.max;
    }
    if (this.end + increment < this.max) {
      this.end += increment;
    } else {
      this.end = this.max;
    }
  }

  filterOut(filterArray) {
    filterArray.forEach(e => {
      if (!this.matchingIds.includes(e)) {
        this.matchingIds.splice(this.matchingIds.indexOf(e), 1);
      }
    });
  }

  getGen() {
    let array = [];
    //the generation binary string is converted
    this.query.gen.split("").forEach((e, i) => {
      e == "1" ? array.push(true) : array.push(false);
    });
    return array;
  }

  writeIds(idsArray) {
    if (this.isFiltrating) {
      this.filterOut(idsArray);
    } else {
      this.matchingIds = idsArray;
    }
  }

  searchPokemonName() {
    // search the pokemon species data for a pokemon with a matching name
    this.pokemonKeys.forEach(id => {
      //looping through the pokemon data
      //looping through the pokemon data
      //this will allow for the looping through the pokemon forms
      let form = Object.keys(pokedex[id].v); // creating a list of

      form.forEach(uId => {
        let name = pokedex[id].n;
        let fromName = pokedex[id].v[uId].n;
        if (
          name.includes(this.query.search) ||
          fromName.includes(this.query.search)
        ) {
          //used to check if the search text matches the current name
          this.matchingIds.push(uId); //if the name matches add its id to the matching id list
        }
      });
    });
  }

  searchMove() {
    //used to check if the text matches the the move name
    this.moveKeys.forEach(i => {
        console.log(i);
      //looping through the moves to look at what pokemon may have then
      if (i.replace(/_/g, " ").includes(this.query.search)) {
        moves[i].pmon.forEach(e => {
          // looping through the pokemon
          //adding the ids of the pokemon that match the search criteria
          //the ternary check checks if the id has been added or not
          !this.matchingIds.includes(e) ? this.matchingIds.push(e) : "";
        });
      }
    });
  }

  searchMoveType() {
    let seen = {}; // used to store non duplicate data;
    let tempMoveType = [];
    this.moveKeys.forEach(i => {
      if (moves[i].t == this.query.pokemonMoves) {
        moves[i].pmon.forEach(e => {
          seen[e] = true;
        });
      }
    });
    tempMoveType = Object.keys(seen);
    this.writeIds(tempMoveType);
  }

  searchType(whichType) {
    // which type will is bool  if false checking type 1 if true checking type
    let typeIdsArray = [];
    this.pokemonKeys.forEach(key => {
      let form = Object.keys(pokedex[key].v); // creating a list of pokemon forms
      form.forEach(formKey => {
        //+whichType turns 0 or 1 into bool
        if (
          pokedex[key].v[formKey].t[+whichType] ==
          (whichType ? this.query.type2 : this.query.type1)
        ) {
          typeIdsArray.push(pokedex[key].v[formKey].id);
        }
      });
    });
    return typeIdsArray;
  }

  searchGen() {
    let genMask = this.getGen();
    let genTempArray = [];
    console.log("the mask is ", genMask);
    this.pokemonKeys.forEach(e => {
      //the current pokedex entry's gen value is compared into the
      //gen mask to see if the value is present in the gen mask
      // if so it will be added to the array.
      if (
        this.isFiltrating
          ? !genMask[pokedex[e].g - 1]
          : genMask[pokedex[e].g - 1]
      ) {
        let form = Object.keys(pokedex[e].v);
        genTempArray.push(...form); // add the forms array to the
      }
    });
    console.log("after gen mask", genTempArray);
    this.writeIds(genTempArray);
  }

  searchShape() {
    let tempShapeArray = [];
    this.pokemonKeys.forEach(e => {
      if (
        this.isFiltrating
          ? pokedex[e].s != this.query.shape
          : pokedex[e].s == this.query.shape
      ) {
        let form = Object.keys(pokedex[e].v);
        tempShapeArray.push(...form);
      }
    });
    this.writeIds(tempShapeArray);
  }

  searchEggGroup() {
    let tempEggGroupArray = [];
    this.pokemonKeys.forEach(e => {
      if (
        this.isFiltrating
          ? pokedex[e].e == this.query.eggGroup
          : pokedex[e].e != this.query.eggGroup
      ) {
        let form = Object.keys(pokedex[e].v);
        tempEggGroupArray.push(...form);
      }
    });
    this.writeIds(tempEggGroupArray);
  }

  searchColor() {
    let tempColorArray = [];
    this.pokemonKeys.forEach(e => {
      if (
        this.isFiltrating
          ? pokedex[e].c == this.query.color
          : pokedex[e].c == this.query.color
      ) {
        //find all the form ids of pokemon that DO NOT have the color that is being searched
        let form = Object.keys(pokedex[e].v);
        tempColorArray.push(...form);
      }
    });
    console.log("color search", tempColorArray);
    this.writeIds(tempColorArray);
  }
}
