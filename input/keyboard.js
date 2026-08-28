export class Keyboard {
    constructor() {
        this.keys = { w: false, a: false, s: false, d: false, o: false, p: false, space: false }
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    init() {
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
    }

    handleKeyDown(e) {
        if (e.key in this.keys) {
            this.keys[e.key] = true;
        }
        if (e.key === " ") {
            this.keys["space"] = true;
        }
    }

    handleKeyUp(e) {
        if (e.key in this.keys) {
            this.keys[e.key] = false;
        }
        if (e.key === " ") {
            this.keys["space"] = false;
        }
    }
}