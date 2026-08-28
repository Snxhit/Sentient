export class MouseManager {
    constructor(sim) {
        this.sim = sim;
        this.coords = {
            x: 0,
            y: 0
        };
        this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    init() {
        this.sim.addEventListener("mousemove", this.handleMouseMove);
    }

    handleMouseMove(e) {
        const rect = this.sim.getBoundingClientRect();
        this.coords.x = e.clientX - rect.left;
        this.coords.y = e.clientY - rect.top;
    }
}