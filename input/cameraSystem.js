import CONFIG from "../core/config.js";

export const camera = {
  x: 0,
  y: 0,
  speed: 15
}


export class CameraSystem {
    constructor(camera, sim) {
        this.camera = camera;
        this.sim = sim;
    }

    move(keys) {
        if (keys.w) this.camera.y -= this.camera.speed;
        if (keys.s) this.camera.y += this.camera.speed;
        if (keys.a) this.camera.x -= this.camera.speed;
        if (keys.d) this.camera.x += this.camera.speed;
        if (keys.o) this.zoomOut();
        if (keys.p) this.zoomIn();

        this.clamp();
    }

    zoomOut() {
        const nextWidth = CONFIG.world.width * CONFIG.world.tileSize * 0.95;
        const nextHeight = CONFIG.world.height * CONFIG.world.tileSize * 0.95;

        if (nextWidth >= window.innerWidth && nextHeight >= window.innerHeight) {
            CONFIG.world.tileSize *= 0.95;
        }
        this.clamp();
    }

    zoomIn() {
        CONFIG.world.tileSize *= 1.05;
        this.clamp();
    }

    clamp() {
        CONFIG.world.tileSize = Math.max(5, Math.min(CONFIG.world.tileSize, 60));
        
        const maxExtentX = CONFIG.world.width * CONFIG.world.tileSize - this.sim.width;
        const maxExtentY = CONFIG.world.height * CONFIG.world.tileSize - this.sim.height;

        this.camera.x = Math.max(0, Math.min(this.camera.x, maxExtentX));
        this.camera.y = Math.max(0, Math.min(this.camera.y, maxExtentY));
    }
}