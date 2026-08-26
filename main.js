import CONFIG from "./core/config.js";

import { render } from "./render/renderer.js";
import { getHoveredTile } from "./render/helpers.js";

import { Entity } from "./entities/entity.js";
import { Human } from "./entities/human.js";
import { Cat } from "./entities/cat.js";

import { generateTerrain } from "./world/terrain.js";
import { World } from "./world/world.js";
import { collidesAt } from "./world/collision.js";

const sim = document.getElementById("sim");
const ctx = sim.getContext("2d");

const container = document.getElementById("container");
const tooltip = document.getElementById("tooltip");

document.addEventListener("DOMContentLoaded", () => {
  sim.focus();
});

function resizeCanvas() {
  sim.width = container.clientWidth;
  sim.height = container.clientHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let activeBrush = "pointer";
let timeSetting = "normal";

const camera = {
  x: 0,
  y: 0,
  speed: 15
}

const keys = {
  w: false,
  s: false,
  a: false,
  d: false
}

const mouse = {
  x: 0,
  y: 0
}

sim.addEventListener("click", () => {
  const hovered = getHoveredTile(world, camera, mouse);

  if (hovered) {
    if (activeBrush == "pointer") {
      console.log(hovered);
    } else if (activeBrush == "food") {
      world.getTile(hovered.x, hovered.y).resource = "food";
    } else if (activeBrush == "dirt") {
      world.getTile(hovered.x, hovered.y).terrain = "dirt";
      world.getTile(hovered.x, hovered.y).solid = true;
    } else if (activeBrush == "eraser") {
      world.getTile(hovered.x, hovered.y).terrain = "air";
      world.getTile(hovered.x, hovered.y).solid = false;
      world.getTile(hovered.x, hovered.y).resource = null;
    } else if (activeBrush == "human") {
      entityManager.spawn(new Human(hovered.x, hovered.y));
    }
  };
});

sim.addEventListener("mousemove", (e) => {
  const rect = sim.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

const world = new World(CONFIG.world.width, CONFIG.world.height, generateTerrain(CONFIG.world.width, CONFIG.world.height));
world.generate();


class EntityManager {
  constructor() {
    this.entities = [];
  }

  spawn(entityInstance) {
    this.entities.push(entityInstance);
    return entityInstance;
  }

  simulate() {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];

      if (!e.isAlive) {
        this.entities.splice(i, 1);
        continue;
      }

      e.simulate(world);
    }
  }

  getEntitiesByType(type) {
    return this.entities.filter(e => e instanceof type);
  }
}

const entityManager = new EntityManager();

entityManager.spawn(new Human(10, 10));
entityManager.spawn(new Cat(20, 10));

window.addEventListener("keydown", (e) => {
  if (e.key === "w") {
    camera.y -= camera.speed;
  }
  if (e.key === "s") {
    camera.y += camera.speed;
  }
  if (e.key === "a") {
    camera.x -= camera.speed;
  }
  if (e.key === "d") {
    camera.x += camera.speed;
  }
  if (e.key === "o") {
    if (CONFIG.world.width * CONFIG.world.tileSize * 0.9 >= window.innerWidth && CONFIG.world.height * CONFIG.world.tileSize * 0.9 >= window.innerHeight) {
      CONFIG.world.tileSize *= 0.9;
    };
  }
  if (e.key === "p") {
    CONFIG.world.tileSize *= 1.1;
  }

  CONFIG.world.tileSize = Math.max(5, Math.min(CONFIG.world.tileSize, 60));

  camera.x = Math.max(0, Math.min(camera.x, CONFIG.world.width * CONFIG.world.tileSize - sim.width));
  camera.y = Math.max(0, Math.min(camera.y, CONFIG.world.height * CONFIG.world.tileSize - sim.height));
});

window.addEventListener("keydown", (e) => {
  if (e.key in keys) keys[e.key] = true;
  if (e.key === "o") {
    if (CONFIG.world.width * CONFIG.world.tileSize * 0.9 >= window.innerWidth && CONFIG.world.height * CONFIG.world.tileSize * 0.9 >= window.innerHeight) {
      CONFIG.world.tileSize *= 0.9;
    };
  }
  if (e.key === "p") {
    CONFIG.world.tileSize *= 1.1;
  }

});

window.addEventListener("keyup", (e) => {
  if (e.key in keys) keys[e.key] = false;
});

function updateCamera() {
  if (keys.w) camera.y -= camera.speed;
  if (keys.s) camera.y += camera.speed;
  if (keys.a) camera.x -= camera.speed;
  if (keys.d) camera.x += camera.speed;
  CONFIG.world.tileSize = Math.max(5, Math.min(CONFIG.world.tileSize, 60));

  camera.x = Math.max(0, Math.min(camera.x, CONFIG.world.width * CONFIG.world.tileSize - sim.width));
  camera.y = Math.max(0, Math.min(camera.y, CONFIG.world.height * CONFIG.world.tileSize - sim.height));
}

document.getElementById("pointerBrush").addEventListener("click", () => {
  activeBrush = "pointer";
});

document.getElementById("foodBrush").addEventListener("click", () => {
  activeBrush = "food";
});

document.getElementById("dirtBrush").addEventListener("click", () => {
  activeBrush = "dirt";
});

document.getElementById("eraserBrush").addEventListener("click", () => {
  activeBrush = "eraser";
});

document.getElementById("humanBrush").addEventListener("click", () => {
  activeBrush = "human";
});

document.getElementById("pauseButton").addEventListener("click", () => {
  timeSetting = "paused";
  document.getElementById("pauseButton").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
  document.getElementById("playButton").style.backgroundColor = "rgba(255, 255, 255, 0)";
  document.getElementById("twoXButton").style.backgroundColor = "rgba(255, 255, 255, 0)";
});

document.getElementById("playButton").addEventListener("click", () => {
  timeSetting = "normal";
  CONFIG.simulation.tickRate = 300;
  document.getElementById("pauseButton").style.backgroundColor = "rgba(255, 255, 255, 0)";
  document.getElementById("playButton").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
  document.getElementById("twoXButton").style.backgroundColor = "rgba(255, 255, 255, 0)";
});

document.getElementById("twoXButton").addEventListener("click", () => {
  timeSetting = "double";
  CONFIG.simulation.tickRate = 150;
  document.getElementById("pauseButton").style.backgroundColor = "rgba(255, 255, 255, 0)";
  document.getElementById("playButton").style.backgroundColor = "rgba(255, 255, 255, 0)";
  document.getElementById("twoXButton").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
});

let lastTick = 0;
function simulate() {

  for (let y = world.height - 2; y >= 0; y--) {
    for (let x = 0; x < world.width; x++) {
      const current = world.getTile(x, y);
      const below = world.getTile(x, y + 1);

      if (current.resource === "food") {
        if (below.terrain !== "dirt" && below.resource !== "food") {
          current.resource = null;
          below.resource = "food";
        }
      }
    }
  }

  entityManager.simulate();
}


function loop() {
  const now = Date.now();

  updateCamera();

  if (now - lastTick > CONFIG.simulation.tickRate) {
    if (timeSetting != "paused") {
      simulate();
    }
    lastTick = now;
  }

  render(ctx, world, entityManager, camera, mouse, activeBrush, tooltip, sim);
  requestAnimationFrame(loop);
}

loop();
