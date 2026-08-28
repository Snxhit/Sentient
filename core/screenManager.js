export class ScreenManager {
    constructor(canvasElement, containerElement) {
        this.sim = canvasElement;
        this.container = containerElement;

        this.resizeCanvas = this.resizeCanvas.bind(this);
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.sim.focus();
        });

        window.addEventListener("resize", this.resizeCanvas);
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.sim.width = this.container.clientWidth;
        this.sim.height = this.container.clientHeight;
    }
}

export default ScreenManager;