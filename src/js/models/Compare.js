import axios from "axios";
import { api } from "../config";
import pokedex from "../JSON/smallPokedexV2.json";
import typeData from "../JSON/slimTypes.json";
import pokemonUIdToId from "../JSON/pokemonToSpecies.json";
import movesList from "../JSON/minMoves.json";
import Move from "../models/Moves";

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
                this.pokeComp[i].uId = tempUId
                this.pokeComp[i].id = pokemonUIdToId[tempUId] ? pokemonUIdToId[tempUId] : tempUId;
            }
        }
    }

    isVsSettable(id) {//used to check if the compare option can be set
        const id0 = this.pokeComp[0].id;
        const id1 = this.pokeComp[1].id;
        const id0Blank = id0 == "";
        const id1Blank = id1 == "";
        const oneBlank = id0Blank || id1Blank;
        const allBlack = id0Blank && id1Blank;
        const uniquer = (id != id0) && !id0Blank || (id != id1) && !id1Blank;
        return allBlack || (oneBlank && uniquer);
    }

    unSetIdOfPokemon(container) {//used to clear id
        this.pokeComp[container - 1].uId = "";
        this.pokeComp[container - 1].id = "";

    }

    setIdOfPokemon(pokemonID) {//set values of id and uId
        if (this.pokeComp[0].id === "") {
            this.pokeComp[0].uId = pokemonID;
            this.pokeComp[0].id = pokemonID > 10000 ? pokemonUIdToId[pokemonID] : pokemonID;
            return 1;
        } else if (this.pokeComp[1].id === "") {
            this.pokeComp[1].uId = pokemonID;
            this.pokeComp[1].id = pokemonID > 10000 ? pokemonUIdToId[pokemonID] : pokemonID;
            return 2;
        }
    }

    getVSPokemonData(uId) {//get
        let pokemon = {};
        let id;
        uId > 10000 ? id = pokemonUIdToId[uId] : id = uId;
        pokemon = pokedex[id];
        return {
            id: id,
            uId: uId,
            name: id == uId ? pokemon.n : pokemon.v[uId].n,
            type: pokemon.v[uId].t,
            form: pokemon.v[uId].f
        };
    }

    getPokemonIdes() {
        return [this.pokeComp[0].id, this.pokeComp[1].id];
    }

    async getCompareData() {
        let statNames = ["speed", "spDef", "spAtk", "defense", "attack", "hp"];
        let parameters = ["stats", "ev", "percent", "statsMinMax"];
        for (let i = 0; i <= 1; i++) {
            try {
                let workingId = this.query ? this.query[`pokemon${i + 1}`] : this.pokeComp[i].uId;
                const res = await axios(api.pokemon + workingId);
                let pokedexData = res.data;
                this.pokeComp[i].abilities = [];
                this.pokeComp[i].statTotal = 0;
                parameters.forEach(param => { //setting empty object parameters to other objects
                    this.pokeComp[i][param] = {};
                });
                pokedexData.stats.forEach((e, i1) => { //e = element , i1 = index
                    const tempStat = parseInt(e.base_stat);
                    this.pokeComp[i].stats[statNames[i1]] = tempStat;
                    this.pokeComp[i].ev[statNames[i1]] = parseInt(e.effort);
                    this.pokeComp[i].statTotal += tempStat;
                });
                this.setMinMax(100, i);
                pokedexData.stats.forEach((e, i1) => {
                    this.pokeComp[i].percent[statNames[i1]] = Math.round((this.pokeComp[i].stats[statNames[i1]] / this.pokeComp[i].statTotal) * 1000) / 10;
                });
                this.getMoves(await pokedexData.moves, i);
                pokedexData.abilities.forEach(async e => {
                    this.pokeComp[i].abilities.push({
                        isHidden: e.is_hidden,
                        name: e.ability.name,
                        description: await (this.getAbility(e.ability.url))
                    });
                });
                this.getPrimaryData(i);
                this.getDamageTypes(i);
            } catch (error) {
                console.log(error);
            }
        }
        for (let i = 0; i <= 1; i++) {
            this.getDamageEffectiveness(i, this.pokeComp[i].moves);
        }
    }

    setMinMax(level, i) {//
        let min, max;
        const statNames = ["speed", "spDef", "spAtk", "defense", "attack"];
        const lvl = parseInt(level);
        min = Math.floor((2 * this.pokeComp[i].stats.hp * lvl) / 100) + lvl + 10;
        max = Math.floor((((2 * this.pokeComp[i].stats.hp) + 31 + (Math.floor(252 / 4))) * lvl) / 100) + lvl + 10;
        this.pokeComp[i].statsMinMax.hp = { min, max };
        statNames.forEach(e => {
            const tempStat = parseInt(this.pokeComp[i].stats[e]);
            min = Math.floor((((tempStat * 2)) * lvl / 100 + 5) * 0.9);
            max = Math.floor(((tempStat * 2 + 31 + (252 / 4)) * lvl / 100 + 5) * 1.1);
            this.pokeComp[i].statsMinMax[e] = { min, max }
        });
    }

    async getAbility(queryString) {
        //used to get the ability description
        try {
            const res = await axios(queryString);
            return await (res.data.effect_entries[0].short_effect);
        } catch (error) {
            console.log(error);
        }
    }

    getUrlId(url) {
        return parseInt(url.split("/")[6]);
    }

    async getMoves(moves, i) {
        //the moves will be separated into 4 catagories
        this.pokeComp[i].moves = {};
        let moveGain = ["level-up", "egg", "tutor", "machine"];
        moveGain.forEach(e => { this.pokeComp[i].moves[e] = [] });
        moves.forEach(e => {
            let tempMoveData = movesList[e.move.name.replace(/\-/g, "_")];
            const tempLevel = e.version_group_details[0].move_learn_method.name == moveGain[0] ?
                e.version_group_details[0].level_learned_at : "";
            let tempMove = new Move(tempMoveData, tempLevel);
            const method = e.version_group_details[0].move_learn_method.name;
            this.pokeComp[i].moves[method].push(tempMove);
        });
    }

    getDamageEffectiveness(index, moves) {
        const effectKeys = Object.keys(this.pokeComp[index].typeDamage.defense);
        const moveGroupKeys = Object.keys(this.pokeComp[index].moves);
        const typeEffectiveness = [];
        effectKeys.forEach(e => {
            typeEffectiveness.push(this.pokeComp[index == 0 ? 1 : 0].typeDamage.defense[e]);
        });
        moveGroupKeys.forEach(e => { // loops through the move groups
            if (this.pokeComp[index].moves[e].length > 0) {// used to check if the current move group is black
                for (let i = 0; i <= this.pokeComp[index].moves[e].length - 1; i++) {
                    let tempMove = this.pokeComp[index].moves[e][i];
                    for (let e2 of typeEffectiveness) {
                        if (e2.hasOwnProperty(tempMove.t)) {
                            this.pokeComp[index].moves[e][i].ef = e2[tempMove.t];
                            break;
                        }
                    }
                }
            }
        });
    }

    getPrimaryData(i) {// setting primary data
        const name = this.pokeComp[i].id == this.pokeComp[i].uId ? pokedex[this.pokeComp[i].id].n : pokedex[this.pokeComp[i].id].v[this.pokeComp[i].uId].n;
        const type = pokedex[this.pokeComp[i].id].v[this.pokeComp[i].uId].t;
        this.pokeComp[i].name = name;
        this.pokeComp[i].types = type;
    }

    getDamageTypes(index) {//get damage data
        let keys = Object.keys(typeData); //getting type data keys for the later on looping
        let tempTypes = { //setting up the type damage object
            "defense": { "Immune_to": {}, "Resistant_to": {}, "Normal_damage": {}, "Week_to": {} },
            "attack": { "Super_effective": {}, "Normal_damage": {}, "Not_very_effective": {}, "No_damage": {} }
        };
        //similar to the keys array seen before the two array bellow are for looping and calculating needs
        const attackGroups = ["Super_effective", "Normal_damage", "Not_very_effective", "No_damage"];
        const defenseGroup = ["Week_to", "Normal_damage", "Resistant_to", "Immune_to",];
        //using the pre-calculated data
        tempTypes.attack = this.calcTypeDamage(tempTypes.attack, attackGroups, keys, "attack", index);
        tempTypes.defense = this.calcTypeDamage(tempTypes.defense, defenseGroup, keys, "defense", index);
        //setting the type data
        this.pokeComp[index].typeDamage = tempTypes;
    }

    calcTypeDamage(typeGroup, group, keys, action, index) {//used to calculate the damage will be done and add it to a specific category
        let tempDamageGroup = typeGroup;
        //looping through all the damage types
        for (let i = 0; i < keys.length; i++) {
            //used to get rid of the two pseudo-types
            if (keys[i] != "10001" && keys[i] != "10002") {
                //calculating type damage using a ternary operator to check if the damage will be based of 2 or 1 types
                let tempTypeDamage = (action == "defense" && this.pokeComp[index].types.length > 1) ?
                    typeData[this.pokeComp[index].types[0]][action][keys[i]] *
                    typeData[this.pokeComp[index].types[1]][action][keys[i]] :
                    typeData[this.pokeComp[index].types[0]][action][keys[i]];
                //the if statement are being used to write the value to the corresponding category
                if (tempTypeDamage > 1) {
                    tempDamageGroup[group[0]][[keys[i]]] = tempTypeDamage;
                } else if (tempTypeDamage == 1) {
                    tempDamageGroup[group[1]][[keys[i]]] = tempTypeDamage;
                } else if (tempTypeDamage < 1 && tempTypeDamage > 0) {
                    tempDamageGroup[group[2]][keys[i]] = tempTypeDamage;
                } else {
                    tempDamageGroup[group[3]][keys[i]] = tempTypeDamage;
                }
            }
        }
        return tempDamageGroup;
    }
}