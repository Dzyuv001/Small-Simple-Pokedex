

export default class Move {
    constructor(data, level) {
        this.id = data.id;
        this.n = data.n;
        this.p = data.p;
        this.pp = data.pp;
        this.a = data.a;
        this.d = data.d;
        this.t = data.t;
        level != "" ? this.l = level : this.l = "";
    }
}