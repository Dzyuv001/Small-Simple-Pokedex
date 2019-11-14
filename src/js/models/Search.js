import pokedex from "../JSON/smallPokedexV2.json";
import moves from "../JSON/minMoves.json";
import * as util from "../utility";
import formToSpecies from "../JSON/pokemonToSpecies.json";

export default class Search {
    constructor(query) {
        this.setQuery(query)
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

    setQuery(query) { // used to rest the query string and some display elements
        this.query = query ? query : util.getURLParams(query);
        console.warn(JSON.stringify(this.query));
        this.start = -1;
        this.end = -1;
    }

    isNewQuery() {// used to check if the new query is new or the user is just triggered the same query
        //the this is done to prevent the website from doing the same query over and over;
        return (this.oldQuery == {} || (this.oldQuery != this.query));

    }

    resetQueryResults() {
        this.result = [];
        this.matchingIds = [];
    }

    getResults() {
        if (JSON.stringify(this.query) != this.clearQuery) {
            if (this.oldQuery != this.query) {
                //the query will be checked
                this.resetQueryResults();
                if (this.query.search && (this.query.pokemonMoves == "1" || this.query.pokemonMoves == "3")) { //calling pokemon
                    this.searchPokemonName();
                }
                if (this.query.search && (this.query.pokemonMoves == "2" || this.query.pokemonMoves == "3")) {
                    this.searchMove();
                }
                //there are 8 different possibilities
                //they are no types , type1 , type2 and type1 and type2
                //and those can be seen as filtering existing ids or find pokemon with searched types
                if (this.matchingIds.length == 0) {
                    //checks if filter or search operation
                    if (this.query.type1 != 0) {
                        this.matchingIds = this.searchType(false);
                        if (this.query.type2 != 0) {
                            this.type2Ids = this.searchType(true);
                            this.type2Ids.forEach(e => {
                                if (!this.matchingIds.includes(e)) this.matchingIds.push(e);
                            });
                        }
                    } else if (this.query.type2 != 0) {
                        this.matchingIds = this.searchType(true);
                    }
                } else {
                    if (this.query.type1 != 0) {
                        this.type1Ids = this.searchType(false);
                        if (this.query.type2 != 0) {
                            this.type2Ids = this.searchType(true);
                            this.type2Ids.forEach(e => {
                                if (!this.type1Ids.includes(e)) this.type1Ids.push(e);
                            });
                        }
                        this.filterOut(this.type1Ids);
                    } else if (this.query.type2 != 0) {
                        this.filterOut(this.searchType(true));
                    }
                }
                if (this.query.gen != "" && this.query.gen !== "0000000" || this.isQueryFieldUpdated["gen"]) {
                    this.searchGen();
                }
                if (this.query.color != "0" || this.isQueryFieldUpdated["color"]) {
                    this.searchColor();
                }
                if (this.query.shape != "0" || this.isQueryFieldUpdated["shape"]) {
                    this.searchShape();
                }
                if (this.query.eggGroup != "0" || this.isQueryFieldUpdated["eggGroup"]) {
                    this.searchEggGroup();
                }
                if (this.query.moveType != "0" || this.isQueryFieldUpdated["moveType"]) {
                    this.searchMoveType();
                }

                this.matchingIds.forEach(e => {
                    const tempId = e > 10000 ? formToSpecies[e] : e;
                    let tempPokemon = pokedex[tempId];
                    console.log("The value",e,tempId);
                    if (!this.result.hasOwnProperty(tempId)) this.result[tempPokemon.id] = [];
                    this.setResultElement(tempId, e);
                });
                this.result = this.result.filter(v => v != "");
                this.result.forEach((e) => {

                })
            }
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
        this.result[print ? id - 1 : id].push(
            {
                id: id,
                n: pokedex[id].v[uId].n != "" ? pokedex[id].v[uId].n : pokedex[id].n,
                t: pokedex[id].v[uId].t,
                uId: pokedex[id].v[uId].id,
                f: pokedex[id].v[uId].f
            }
        );
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
            if (this.matchingIds.indexOf(e) != -1) {
                this.matchingIds.splice(this.matchingIds.indexOf(e), 1);
            }
        });
    }

    getGen() {
        console.log("running gen filter");
        let array = [];
        //the generation binary string is converted
        this.query.gen.split("").forEach((e, i) => { e == "1" ? array.push(true) : array.push(false) });
        return array;
    }

    writeIds(idsArray) {
        if (this.matchingIds.length == 0) {
            this.matchingIds = idsArray;
        } else {
            this.filterOut(idsArray);
        }
        console.log("this is the ids being write", this.matchingIds);
    }

    searchPokemonName() { // search the pokemon species data for a pokemon with a matching name
        console.log("running name filter");
        this.pokemonKeys.forEach(i => { //looping through the pokemon data
            //looping through the pokemon data
            //this will allow for the looping through the pokemon forms
            let form = Object.keys(pokedex[i].v); // creating a list of

            form.forEach(i1 => {
                console.log()
                let name = pokedex[i].n;
                let fromName = pokedex[i].v[i1].n;
                if (name.includes(this.query.search) || fromName.includes(this.query.search)) {//used to check if the search text matches the current name
                    this.matchingIds.push(i1);//if the name matches add its id to the matching id list
                }
            });
        });
    }

    searchMove() {//used to check if the text matches the the move name
        console.log("running move name filter");
        this.moveKeys.forEach(i => {//looping through the moves to look at what pokemon may have then
            if (i === this.query.search) {
                moves[i].pmon.forEach(e => {// looping through the pokemon
                    //adding the ids of the pokemon that match the search criteria
                    //the ternary check checks if the id has been added or not
                    !this.matchingIds.includes(e) ? this.matchingIds.push(e) : "";
                });
            }
        });
    }

    searchMoveType() {
        let seen = {} // used to store non duplicate data;
        let tempMoveType = [];
        this.moveKeys.forEach(i => {
            if (this.matchingIds.length == 0 ?
                moves[i].t == this.query.pokemonMoves :
                moves[i].t != this.query.pokemonMoves) {
                // if(moves[i].t == this.query.pokemonMoves){
                moves[i].pmon.forEach(e=>{
                    // console.log("name",e)
                    seen[e]=true;
                });
            }
        });
        tempMoveType = Object.keys(seen);
        console.log("chrisss chan",tempMoveType);
        this.writeIds(tempMoveType);
    }

    searchType(type) {
        console.log("running type filter");
        let typeIdsArray = [];
        this.pokemonKeys.forEach(i => {
            let form = Object.keys(pokedex[i].v); // creating a list of pokemon forms
            form.forEach(i1 => {
                if (pokedex[i].v[i1].t[type] == (type ? this.query.type1 : this.query.type2)) {
                    typeIdsArray.push(pokedex[i].v[i1].id);
                }
            });
        });
        return typeIdsArray;
    }

    searchGen() {
        let genMask = this.getGen();
        console.log("running gen filter");
        let genTempArray = [];
        this.pokemonKeys.forEach(e => {
            //the current pokedex entry's gen value is compared into the
            //gen mask to see if the value is present in the gen mask
            // if so it will be added to the array.
            if (this.matchingIds.length == "0" ? genMask[pokedex[e].g - 1] : !genMask[pokedex[e].g - 1]) {
                let form = Object.keys(pokedex[e].v);
                genTempArray.splice(genTempArray.length - 1, 0, ...form);// add the froms array to the
            }
        });
        this.writeIds(genTempArray);
    }

    searchShape() {
        console.log("running shape filter");
        let tempShapeArray = [];
        this.pokemonKeys.forEach(e => {
            if (this.matchingIds.length == 0 ?
                pokedex[e].s == this.query.shape :
                pokedex[e].s != this.query.shape) {
                let form = Object.keys(pokedex[e].v);
                tempShapeArray.splice(tempShapeArray.length - 1, 0, ...form);
            }
        });
        this.writeIds(tempShapeArray);
    }

    searchEggGroup() {
        console.log("running egg filter");
        let tempEggGroupArray = [];
        this.pokemonKeys.forEach(e => {
            if (this.matchingIds.length == 0 ?
                pokedex[e].e == this.query.eggGroup :
                pokedex[e].e != this.query.eggGroup) {
                let form = Object.keys(pokedex[e].v);
                tempEggGroupArray.splice(tempEggGroupArray.length - 1, 0, ...form);
            }
        });
        this.writeIds(tempEggGroupArray);
    }

    searchColor() {
        console.log("running color filter");
        let tempColorArray = [];
        this.pokemonKeys.forEach(e => {
            if (this.matchingIds.length == 0 ?
                pokedex[e].c == this.query.color :
                pokedex[e].c != this.query.color) {
                //find all the form ids of pokemon that DO NOT have the color that is being searched
                let form = Object.keys(pokedex[e].v);
                tempColorArray.splice(tempColorArray.length - 1, 0, ...form);
            }
        });
        this.writeIds(tempColorArray);
    }
}