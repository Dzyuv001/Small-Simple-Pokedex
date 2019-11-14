export default class Likes {
    constructor() {
        this.likes = {};
    }

    addLike(id, uId, name, types, form) {// adds like to the likes object
        const like = { id, uId, name, types, form };
        this.likes[uId] = like;
        return like;
    }

    deleteLike(uId) {// remove particular like from likes object
        delete this.likes[uId];
    }

    isLiked(uId) {// check if the element is liked
        return "undefined" !== typeof this.likes[uId];
    }

    getNumLikes() {//number of likes stored in the Likes Object
        return Object.keys(this.likes).length;
    }

    storeData() {// stored data using the LocalStorage API
        localStorage.setItem("likes", JSON.stringify(this.likes));
    }

    readStorage() {//used to read the LocalStorage API
        try {
            const storage = JSON.parse(localStorage.getItem("likes"));
            if (storage) this.likes = storage;
        } catch (error) {

        }
    }
}