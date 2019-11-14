import axios from "axios";
import { api } from "../config";
import pokedex from "../JSON/smallPokedexV2.json";
import typeData from "../JSON/slimTypes.json";
import * as util from "../utility";
import typesList from "../JSON/typesList.json";
import movesList from "../JSON/minMoves.json";
import pokemonToSpecies from "../JSON/pokemonToSpecies.json"
import Move from "../models/Moves";

export default class Pokemon {
    constructor(query) {
        this.query = query;
    }

    getPokemonData() {// primary entry point into getting data for a pokemon
        this.pokeData = {};
        this.getData();
        this.getApiData();
        this.getSpecies();
        this.getDamageTypes();
    }

    getDisplayData(uId) { //gets data that will be display in the like panel
        let id = uId > 10000 ? pokemonToSpecies[uId] : uId;
        return {
            uId,
            id,
            name: uId == id ? pokedex[id].n : pokedex[id].v[uId].n,
            type: pokedex[id].v[uId].t,
            form: pokedex[id].v[uId].f
        };
    }

    async getApiData() {//get the primary data
        try {
            const res = await axios(api.pokemon + this.query.id);
            let pokedexData = res.data;
            const statNames = ["speed", "spDef", "spAtk", "defense", "attack", "hp"];
            let parameters = ["stats", "ev", "percent", "statsMinMax"];
            this.pokeData.primary.baseExp = pokedexData.base_experience;
            parameters.forEach(param => this.pokeData[param] = {});
            this.pokeData.statTotal = 0;
            pokedexData.stats.forEach((e, i) => { //e = element , i = index
                const tempStat = parseInt(e.base_stat);
                this.pokeData.stats[statNames[i]] = tempStat;
                this.pokeData.ev[statNames[i]] = parseInt(e.effort);
                this.pokeData.statTotal += tempStat;
            });
            this.setMinMax(100);
            pokedexData.stats.forEach((e, i) => { //e = element , i = index
                this.pokeData.percent[statNames[i]] = Math.round((this.pokeData.stats[statNames[i]] / this.pokeData.statTotal) * 1000) / 10;
            });
            this.pokeData.heldItem = await (this.getHeldItem(pokedexData.held_items));
            this.pokeData.abilities = [];
            pokedexData.abilities.forEach(async e => {
                this.pokeData.abilities.push({
                    isHidden: e.is_hidden,
                    name: e.ability.name,
                    description: await (this.getAbility(e.ability.url))
                });
            })
            this.pokeData.primary.weight = pokedexData.weight;
            this.pokeData.primary.height = pokedexData.height;
            this.getMoves(await pokedexData.moves);
        } catch (error) {
            console.log(error);
        }
    }

    setMinMax(level) {
        let min, max;
        const statNames = ["speed", "spDef", "spAtk", "defense", "attack"];
        const lvl = parseInt(level);
        min = Math.floor((2 * this.pokeData.stats.hp * lvl) / 100) + lvl + 10;
        max = Math.floor((((2 * this.pokeData.stats.hp) + 31 + (Math.floor(252 / 4))) * lvl) / 100) + lvl + 10;
        this.pokeData.statsMinMax.hp = { min, max };
        statNames.forEach(e => {
            const tempStat = parseInt(this.pokeData.stats[e]);
            min = Math.floor((((tempStat * 2)) * lvl / 100 + 5) * 0.9);
            max = Math.floor(((tempStat * 2 + 31 + (252 / 4)) * lvl / 100 + 5) * 1.1);
            this.pokeData.statsMinMax[e] = { min, max }
        });
    }

    getMinMax() { //return the value of stats min max
        return this.pokeData.statsMinMax;
    }

    getExpNeededForLevel(growthRate, level) {//calculate the exp need for entered level
        level = level > 100 ? 100 : level;// cap the upper level to 100
        level = level < 1 ? 1 : level;// cap the lower level to min which is 1
        switch (growthRate) {// check what type of exp gain the pokemon have
            case "slow":
                return 5 * (Math.pow(level, 3)) / 4;
            case "medium":
                return Math.pow(level, 3);
            case "medium-slow":
                return Math.floor((6 * (Math.pow(level, 3)) / 5) - (15 * Math.pow(level, 2)) + 100 * level - 140);
            case "fast":
                return Math.floor((4 * Math.pow(level, 3)) / 5);
            case "fast-then-very-slow":
                if (level < 15) {
                    return Math.floor(Math.pow(level, 3) * ((((level + 1) / 3) + 24) / 50));
                } else if (15 <= level && level <= 36) {
                    return Math.floor(Math.pow(level, 3) * ((level + 14) / 50));
                } else {
                    return Math.floor(Math.pow(level, 3) * ((Math.floor(level / 2) + 32) / 50));
                }
            case "slow-then-very-fast":
                if (level < 50) {
                    return Math.floor(((Math.pow(level, 3) * (100 - level))) / 50);
                } else if (50 <= level && level <= 68) {
                    return Math.floor((Math.pow(level, 3) * (150 - level)) / 100);
                } else if (68 <= level && level < 98) {
                    return Math.floor((Math.pow(level, 3) * ((1911 - (10 * level)) / 3)) / 500);
                } else {
                    return Math.floor((Math.pow(level, 3) * (160 - level)) / 100)
                }
            default:
                console.alert("There is an issue");
                break;
        }
    }

    async getHeldItem(heldItems) {
        //used to get the held item data from the pokemon api call and the item api call
        let storedData = [];// the array will store a collection of objects
        // the object will consist of an id,name, rarity (change of pokemon holding the item) and the effect of the item
        if (heldItems.length > 0) {// check if a pokemon is holding and item
            for (let i = 0; i <= heldItems.length - 1; i++) {
                // if the pokemon is holding an item the item array will be looped through
                try {
                    //an pokemon api call will be made to get the description of an item
                    // the rest of the item info will be gotten from the
                    //pokemon api call where this function is being called from
                    const queryString = heldItems[i].item.url;
                    const res = await axios(queryString);
                    const itemData = res.data;
                    // the info object will be pushed into the array that will store all the held item info
                    storedData.push({
                        id: this.getUrlId(queryString),
                        name: heldItems[i].item.name,
                        rarity: heldItems[i].version_details[0].rarity,
                        effect: itemData.effect_entries[0].short_effect
                    });
                } catch (error) {
                    console.log(error);
                }
            }
            return storedData;
        } else {
            //if the pokemon is found not to be holding an item a null be sent as a response
            return null;
        }
    }

    async getAbility(queryString) {//used to get the ability description from the pokemon api
        try {
            const res = await axios(queryString);
            return await (res.data.effect_entries[0].short_effect);
        } catch (error) {
            console.log(error);
        }
    }

    getGenderData(genderRate) {//get the gender of the pokemon
        if (genderRate == -1) {// the pokemon is genderless
            return null;
        } else {//the pokemon has gender and the percentage will be calucalted
            return {
                f: (genderRate / 8) * 100,
                m: ((8 - genderRate) / 8) * 100
            };
        }
    }

    async getGrowthRate(query) {// get the growth rate of the pokemon
        try {
            const res = await axios(query);//getting the data from the api
            let growthData = res.data;
            this.pokeData.primary.growth = {
                formula: growthData.formula,
                growthRate: growthData.name
            };
        }
        catch (error) {
            console.log(error);
        }
    }

    async getSpecies() {//get the species data from the api
        try {
            const id = this.query.id > 10000 ? pokemonToSpecies[this.query.id] : this.query.id;
            const res = await axios(api.species + id);
            let species = res.data;
            this.getGrowthRate(species.growth_rate.url);
            this.pokeData.primary.shape = [this.getUrlId(species.shape.url), species.shape.name];
            this.pokeData.genders = await this.getGenderData(species.gender_rate);
            this.pokeData.primary.baseFriendship = species.base_happiness;
            this.pokeData.catchRate = species.capture_rate;
            this.pokeData.eggData = {}
            this.pokeData.eggData.hatchCount = species.hatch_counter;
            this.pokeData.eggData.eggGroup = [];
            species.egg_groups.forEach(e => this.pokeData.eggData.eggGroup.push(e.name));
            this.pokeData.evolutionTree = await this.getEvolution(species.evolution_chain.url);
            let flavorText = species.flavor_text_entries[species.flavor_text_entries.length - 1].flavor_text;
            // used to remove instance of off enter key presses that made the text display in odd ways
            flavorText = flavorText.replace("", "");
            this.pokeData.flavorText = flavorText;
        } catch (error) {
            console.log(error);
        }
    }

    async getEvolution(queryString) {//getting the evolution data from the pokemon API
        try {
            const res = await axios(queryString);
            let evolution = res.data;
            return await this.navEvolutionTree(evolution.chain, true);
        } catch (error) {
            console.log(error);
        }
    }

    async navEvolutionTree(evoChain, root) {//getting and traversing the evolution node tree stored in the evolution request
        try {
            let evoNode = {};
            evoNode.name = evoChain.species.name;
            let res = await axios(api.pokemon + evoNode.name);
            evoNode.id = res.data.id;
            root ? evoNode.requirement = 0 : evoNode.requirement = await this.setupEvolutionCriteria(evoChain.evolution_details);
            evoNode.types = [];
            evoNode.isRoot = root;
            res.data.types.forEach(type => {
                evoNode.types.push(util.getValKey(typesList, type.type.name));
            });
            if (evoChain.evolves_to) {
                evoNode.evolutions = [];
                evoChain.evolves_to.forEach(async e => {
                    evoNode.evolutions.push(await this.navEvolutionTree(e, false));
                });
            }
            return evoNode;
        } catch (error) {
            console.log(error);
        }
    }

    async setupEvolutionCriteria(evolutionDetails) {//format the the evolution reason
        let tempString = "";
        if (evolutionDetails[0]) {
            if (evolutionDetails[0].min_level !== null) {
                tempString += "level " + evolutionDetails[0].min_level + " ";
            }
            if (evolutionDetails[0].held_item !== null) {
                tempString += "when holding " + evolutionDetails[0].held_item.name;
            }
            if (evolutionDetails[0].item !== null) {
                tempString += "when given " + evolutionDetails[0].item.name;
            }
            if (evolutionDetails[0].min_happiness !== null) {
                tempString += "friendship over" + evolutionDetails[0].min_happiness;
            }
            if (evolutionDetails[0].time_of_day !== "") {
                tempString += "during " + evolutionDetails[0].time_of_day + "time";
            }
            if (evolutionDetails[0].relative_physical_stats !== null) {
                const tempCriteria = ["Attack < Defense", "Attack = Defense", "Attack > Defense"];
                tempString += " " + (tempCriteria[evolutionDetails[0].relative_physical_stats] + 1);
            }
            if (evolutionDetails[0].location !== null) {
                tempString += " At ";
                let temKeys = Object.keys(evolutionDetails);
                for (let i = 0; i < temKeys.length; i++) {
                    tempString += evolutionDetails[temKeys[i]].location + (i !== temKeys.length ? " or " : " ");
                }
            }
            if (evolutionDetails[0].trigger.name === "trade") {
                tempString += " Traiding ";
            }
            if (evolutionDetails[0].location) {
                if (evolutionDetails[0].gender !== null) {
                    tempString += (evolutionDetails[0].gender === 1 ? " Female " : " Male ");
                }
            }
        }
        return tempString;
    }

    getUrlId(url) {//used to get ids from the stored URL
        return parseInt(url.split("/")[6]);
    }

    async getMoves(moves) {
        //the moves will be separated into 4 catagories
        this.pokeData.moves = {};
        let moveGain = ["level-up", "egg", "tutor", "machine"];
        moveGain.forEach(e => { this.pokeData.moves[e] = [] });
        moves.forEach(e => {
            let tempMoveData = movesList[e.move.name.replace(/\-/g, "_")];
            const tempLevel = e.version_group_details[0].move_learn_method.name == moveGain[0] ?
                e.version_group_details[0].level_learned_at : "";
            let tempMove = new Move(tempMoveData, tempLevel);
            const method = e.version_group_details[0].move_learn_method.name;
            this.pokeData.moves[method].push(tempMove);
        });
    }

    getData() {
        const uId = this.query.id;
        const id = uId > 10000 ? pokemonToSpecies[uId] : uId;
        const pokemon = pokedex[id];
        this.pokeData.primary = {
            color: pokemon.c,
            name: pokemon.n != "" ? pokemon.n : pokemon.v[uId].n,
            type: pokemon.v[uId].t,
            growth: this.growth,
            height: 0,
            weight: 0,
            id: id,
            uId: uId,
            form: pokemon.v[uId].f
        };
    }

    getDamageTypes() {
        let keys = Object.keys(typeData); //getting type data keys for the later on looping
        let tempTypes = { //setting up the type damage object
            "defense": { "Immune_to": {}, "Resistant_to": {}, "Normal_damage": {}, "Week_to": {} },
            "attack": { "Super_effective": {}, "Normal_damage": {}, "Not_very_effective": {}, "No_damage": {} }
        };
        //similar to the keys array seen before the two array bellow are for looping and calculating needs
        const attackGroups = ["Super_effective", "Normal_damage", "Not_very_effective", "No_damage"];
        const defenseGroup = ["Week_to", "Normal_damage", "Resistant_to", "Immune_to",];
        //using the pre-calculated data
        tempTypes.attack = this.calcTypeDamage(tempTypes.attack, attackGroups, keys, "attack");
        tempTypes.defense = this.calcTypeDamage(tempTypes.defense, defenseGroup, keys, "defense");
        //setting the type data
        this.pokeData.typeDamage = tempTypes;
    }

    calcTypeDamage(typeGroup, group, keys, action) {
        let tempDamageGroup = typeGroup;
        //looping through all the damage types
        for (let i = 0; i < keys.length; i++) {
            //used to get rid of the two pseudo-types
            if (keys[i] != "10001" && keys[i] != "10002") {
                //calculating type damage using a ternary operator to check if the damage will be based of 2 or 1 types
                let tempTypeDamage = (action == "defense" && this.pokeData.primary.type.length > 1) ?
                    typeData[this.pokeData.primary.type[0]][action][keys[i]] *
                    typeData[this.pokeData.primary.type[1]][action][keys[i]] :
                    typeData[this.pokeData.primary.type[0]][action][keys[i]];
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
};
