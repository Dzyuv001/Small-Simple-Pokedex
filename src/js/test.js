// import axios from "axios";
// import pokemonSpecies from "./JSON/pokemonSpecies.json";
// import pokemon from "./JSON/tempPokedex.json";
// import type from "./JSON/typesList.json";
// import defenceTypes from "./JSON/defenceTypes.json";
// import moves from "./JSON/moves.json";
// import pokedex from "./JSON/tempPokedex.json";
// import { createBrotliCompress } from "zlib";
// import typesList from "./typesList.json";

// import pokemonColours from "./pokemonColoursSmall.json";
// import generationsSmall from "./generationsSmall.json";

// export default class Test {

//     async getPokemonSpecies() {
//         console.log("we added this test back in");
//         pokemonSpecies.forEach(e => {
//             console.log(e.id); //add the rest of the specieas entereies
//         });
//         // try {
//         //     let pokemonSpeciesData = [];
//         //     const res = await axios("https://pokeapi.co/api/v2/pokemon-species/?offset=0&limit=808");
//         //     const species = res.data;
//         //     console.log(species);
//         //     console.log("so why are we not getting the data here ");
//         //     for(let i=300; i< 400;i++){
//         //         let speciasData = await axios(`https://pokeapi.co/api/v2/pokemon-species/${i+1}/`);
//         //         pokemonSpeciesData.push(speciasData.data);
//         //     }
//         //     // console.log("test");
//         //     console.log(JSON.stringify(pokemonSpeciesData));
//         // } catch (error) {
//         //     console.log(error);
//         // }
//     }

//     // async genDamageNums() {
//     //     try {
//     //         const res = await axios("https://pokeapi.co/api/v2/type");
//     //         const urls = res.data.results;
//     //         // console.log(urls);
//     //         this.results = {};
//     //         this.flippedTypes = {};
//     //         for (let key in type) {
//     //             this.flippedTypes[type[key]] = key;
//     //         }
//     //         urls.forEach((e, i) => { this.getDamage(e, i); });
//     //         console.log(this.results);
//     //         // console.log();
//     //         // console.log(JSON.stringify(this.results));
//     //         var data = await JSON.stringify(this.results);
//     //         console.log(data);
//     //     } catch (error) {
//     //         console.log(error);
//     //     }
//     // }

//     // async getDamage(elem, index) {
//     //     try {
//     //         // const typeData = await axios(elem.url);
//     //         // const damageValue = await typeData.data.damage_relations;
//     //         const damageValue = defenceTypes;
//     //         // console.log(elem);
//     //         // console.log(damageValue);
//     //         // console.log(damageValue[this.flippedTypes[elem.name]]);
//     //         const typeDamage = {};
//     //         const damages = ["no_damage", "half_damage", "double_damage"];
//     //         const damageMultiplyer = { "no_damage": "0", "half_damage": "0.5", "double_damage": "2" }
//     //         // console.log(`setting the attack for group ${index}`);
//     //         typeDamage.defence = { "1": "1", "2": "1", "3": "1", "4": "1", "5": "1", "6": "1", "7": "1", "8": "1", "9": "1", "10": "1", "11": "1", "12": "1", "13": "1", "14": "1", "15": "1", "16": "1", "17": "1", "18": "1", "10001": "1", "10002": "1" };
//     //         typeDamage.attack = { "1": "1", "2": "1", "3": "1", "4": "1", "5": "1", "6": "1", "7": "1", "8": "1", "9": "1", "10": "1", "11": "1", "12": "1", "13": "1", "14": "1", "15": "1", "16": "1", "17": "1", "18": "1", "10001": "1", "10002": "1" };
//     //         damages.forEach((e, i) => { // loop for attack
//     //             // console.log(damageValue[this.flippedTypes[elem.name]][e + "_to"]);
//     //             damageValue[this.flippedTypes[elem.name]][e + "_to"].forEach(el => {
//     //                 // console.log(this.flippedTypes[el.name]);
//     //                 typeDamage.attack[this.flippedTypes[el.name]] = damageMultiplyer[e];
//     //                 console.log(`this is for ${elem.name} the type is  ${el.name} and it will deal ${damageMultiplyer[e]}x damage`);
//     //             });
//     //             damageValue[this.flippedTypes[elem.name]][e + "_from"].forEach(el => {
//     //                 typeDamage.defence[this.flippedTypes[el.name]] = damageMultiplyer[e];
//     //             });
//     //         });
//     //         this.results[this.flippedTypes[elem.name]] = await typeDamage;
//     //     } catch (error) {
//     //         console.log(error);
//     //     }
//     // }


//     // https://pokeapi.co/api/v2/move/?offset=0&limit=1000
//     // async getMovesDB() {
//     //     let damageClass = { "physical": "1", "special": "2", "status": "3" }
//     //     let movesDB = {}
//     //     moves.forEach(e => {//set up the object arrays
//     //         const tempName = e.name.replace(/\-/g, "_");
//     //         movesDB[tempName] = {};
//     //         movesDB[tempName].pmon = []; // pokemon
//     //         movesDB[tempName].id = e.id; //id
//     //         movesDB[tempName].n = e.name;// name
//     //         movesDB[tempName].p = e.power;//power
//     //         movesDB[tempName].pp = e.pp;//pp
//     //         movesDB[tempName].a = e.accuracy;//accuracy
//     //         movesDB[tempName].d = damageClass[e.damage_class.name];//damage class
//     //         movesDB[tempName].t = e.type.url.replace("https://pokeapi.co/api/v2/type/", "").replace("/", "");
//     //         console.log(tempName);
//     //         // console.log(e.id);
//     //     });
//     //     console.log(movesDB);
//     //     pokedex.forEach(e => {//loop through pokemon
//     //         e.stats.moves.forEach(e1 => { // loop rhrought pokemon's moves
//     //             const tempName = e1.move.name.replace(/\-/g, "_");
//     //             try {
//     //                 movesDB[tempName].pmon.push(e.stats.id); // find move in the moves db and add pokemon's id to the list
//     //             } catch (error) {
//     //                 console.log(`This is the pokemon and moves that have issues ${tempName}`);
//     //                 // console.log();
//     //                 // console.log(movesDB.hasOwnProperty[e1.move.name]);
//     //                 // console.log(e);
//     //             }
//     //         });
//     //     });
//     //     console.log(JSON.stringify(movesDB));
//     //     // moves.forEach(e => {
//     //     //     movesDB[e.name] = {};
//     //     //     movesDB[e.name].pokemon_list = [];
//     //     //     pokedex.forEach(e1 => {
//     //     //         // console.log(e1);
//     //     //         e1.moves.forEach(e2 => {
//     //     //             console.log(e2.move.url.replace("https://pokeapi.co/api/v2/move/", "").replace("/", ""));
//     //     //             // if (e2.move.url.replace("https://pokeapi.co/api/v2/move/", "").replace("/", "") == e.id) movesDB[e.name].pokemon.push(e.id);
//     //     //         });
//     //     //     });
//     //     // });
//     //     // console.log(movesDB);
//     //     // try {
//     //     // const resMoves = await axios("https://pokeapi.co/api/v2/move/https://pokeapi.co/api/v2/move/?offset=0&limit=1000");
//     //     // const resPokemon = await axios("https://pokeapi.co/api/v2/pokemon/?limit=970&offset=0");
//     //     //     let movesDb = []; //used to get the move data from the api
//     //     //     for(let i = 10000; i <10018;i++){
//     //     //         let move = await axios(`https://pokeapi.co/api/v2/move/${i+1}/`);
//     //     //         movesDb.push(move.data);
//     //     //     }
//     //     //     console.log(JSON.stringify(movesDb));
//     //     // } catch (error) {
//     //     //     console.log(error);
//     //     // }
//     // }

//     getUrlId(url) {
//         return parseInt(url.split("/")[6]);
//     }

//     async getResult() {
//         // try {
//         // const res = await axios("https://pokeapi.co/api/v2/pokemon/?limit=970&offset=0");
//         // console.log(res);
//         // this.count = res.data.count;
//         // this.results = res.data.results;
//         // console.log(`There are ${this.count} pokemon in the pokemon api. Here is the list of all of them`);
//         // this.results.forEach((e, i) => {
//         //     console.log(`The name is : ${e.name} and the the number is #${i + 1}`);
//         // });
//         let pokedexV1 = {};
//         let usedIds = [];
//         console.log(pokemonSpecies);
//         pokemonSpecies.forEach(e0 => {
//             for (let e1 of e0.varieties) {
//                 let id = this.getUrlId(e1.pokemon.url);
//                 pokedexV1[id] ="";
//                 pokedexV1[id] = e0.id;
//             }
//         });
//         // pokemonSpecies.forEach(e0 => {
//         //     if (!usedIds.includes(e0.id)) {
//         //         usedIds.push(e0.id);
//         //         pokedexV1[e0.id] = {};
//         //         pokedexV1[e0.id].n = e0.name;
//         //         pokedexV1[e0.id].id = parseInt(e0.id);
//         //         pokedexV1[e0.id].g = this.getUrlId(e0.generation.url);
//         //         pokedexV1[e0.id].c = this.getUrlId(e0.color.url);
//         //         pokedexV1[e0.id].s = this.getUrlId(e0.shape.url);
//         //         pokedexV1[e0.id].e = [];
//         //         e0.egg_groups.forEach(e1 => {
//         //             pokedexV1[e0.id].e.push(this.getUrlId(e1.url));
//         //         });
//         //         pokedexV1[e0.id].v = {};
//         //         e0.varieties.forEach(e1 => {
//         //             let tempKey = this.getUrlId(e1.pokemon.url);
//         //             // console.log(tempKey);
//         //             pokedexV1[e0.id].v[tempKey] = {};
//         //             pokedexV1[e0.id].v[tempKey].id = tempKey;
//         //         });
//         //         let tempObjs = [];
//         //         // console.log(pokedexV1[e0.id].v);
//         //         for (let e1 in pokedexV1[e0.id].v) {
//         //             // console.log(e1);
//         //             for (let i = 0; i < pokemon.length; i++) {
//         //                 // console.log(`${pokemon[i].stats.id === e1}`);
//         //                 if (pokemon[i].stats.id == e1) {
//         //                     tempObjs.push(pokemon[i].stats);
//         //                     // console.log("this ran at least once");
//         //                     break;
//         //                 }
//         //             }
//         //         }
//         //         // console.log(tempObjs);
//         //         tempObjs.forEach((e1, i) => {
//         //             // pokedexV1[e0.id].v[e1.id].h = tempObjs[i].height;
//         //             // pokedexV1[e0.id].v[e1.id].w = tempObjs[i].width;
//         //             pokedexV1[e0.id].v[e1.id].n = tempObjs[i].name === e0.name ? "" : tempObjs[i].name;
//         //             pokedexV1[e0.id].v[e1.id].t = [];
//         //             // console.log(tempObjs[i].types)
//         //             tempObjs[i].types.reverse().forEach(e2 => {
//         //                 pokedexV1[e0.id].v[e1.id].t.push(this.getUrlId(e2.type.url));
//         //             });
//         //         });
//         //     }
//         // });
//         console.log(JSON.stringify(pokedexV1));
//     }
//     //     // pokedex2.forEach((e, i) => {
//     //     //     //  console.log(e.name);
//     //     //     const pokemonType = (arr) => {
//     //     //         let types = [];
//     //     //         arr.reverse().forEach(val => {
//     //     //             types.push(parseInt(typesList.getKeyByValue(val.type.name)));
//     //     //         });
//     //     //         return types;
//     //     //     };
//     //     //     const _color = () => {
//     //     //         for (let key in pokemonColours) {
//     //     //             // console.log(pokemonColours[key].pokemon_species);
//     //     //             if (pokemonColours[key].pokemon_species.includes(e.stats.species.name)) {
//     //     //                 return pokemonColours[key].id;
//     //     //             }
//     //     //         }
//     //     //     }
//     //     //     const _gen = () => {
//     //     //         for (let key in generationsSmall) {
//     //     //             if (generationsSmall[key].includes(e.stats.species.name)) {
//     //     //                 return key;
//     //     //             }
//     //     //         }
//     //     //     }
//     //     //     let pokemon = {
//     //     //     };
//     //     //     pokedexV3.push(pokemon);

//     //     // });
//     //     // console.log("test");
//     //     // console.log(pokedex2[1].stats.types[0].type.name);
//     //     // for(let key in pokemonColours) {
//     //     //     console.log(pokemonColours[key]);
//     //     // }
//     //     // console.log(pokedexV3);
//     //     // console.groupCollapsed(JSON.stringify(pokedexV3));

//     //     // console.log(res.data.results);
//     //     // let pokedex = [];
//     //     // for (let i = 0; i < res.data.results.length; i++) {
//     //     //     try {
//     //     //         let pokemonData = await axios(res.data.results[i].url);
//     //     //         pokedex.push({ name: res.data.results[i].name, stats: pokemonData.data});
//     //     //     } catch (error) {
//     //     //     }
//     //     // }
//     //     // console.log(JSON.stringify(pokedex));
//     //     // } catch(error) {
//     //     //     console.log(`the error is ${error}`);
//     //     // }
//     // }
//     // }


//     // Object.prototype.getKeyByValue = function (value) {
//     //         for (var prop in this) {
//     //             if (this.hasOwnProperty(prop)) {
//     //                 if (this[prop] === value) return prop;
//     //             }
//     //         }
//     //     }

// }