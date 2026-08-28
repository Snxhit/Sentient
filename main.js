import ScreenManager from "./core/screenManager.js";
import CONFIG from "./core/config.js";

import { Keyboard } from "./input/keyboard.js";
import { CameraSystem } from "./input/cameraSystem.js";
import { MouseManager } from "./input/mouseManager.js";

import { render } from "./render/renderer.js";
import { getHoveredTile } from "./render/helpers.js";

import { EntityManager } from "./entities/entityManager.js";
import { Human } from "./entities/human.js";
import { Cat } from "./entities/cat.js";

import { generateTerrain } from "./world/terrain.js";
import { World } from "./world/world.js";

const sim = document.getElementById("sim");
const ctx = sim.getContext("2d");

const container = document.getElementById("container");
const tooltip = document.getElementById("tooltip");

let activeBrush = "pointer";
let timeSetting = "normal";

const screenManager = new ScreenManager(sim, container);
screenManager.init();

const keyboard = new Keyboard();
keyboard.init();
const mouseManager = new MouseManager(sim);
mouseManager.init();

const cameraSystem = new CameraSystem(sim);

const world = new World(CONFIG.world.width, CONFIG.world.height, generateTerrain(CONFIG.world.width, CONFIG.world.height));
world.generate();

const entityManager = new EntityManager(world);
entityManager.spawn(new Human(10, 10));
entityManager.spawn(new Cat(20, 10));

sim.addEventListener("click", () => {
  const hovered = getHoveredTile(world, cameraSystem.camera, mouseManager.coords);

  if (hovered) {
    if (activeBrush == "pointer") {
      console.log(hovered);
    } else if (activeBrush == "food") {
      world.getTile(hovered.x, hovered.y).resource = "food";
    } else if (activeBrush == "dirt") {
      world.getTile(hovered.x, hovered.y).terrain = "dirt";
      world.getTile(hovered.x, hovered.y).solid = true;
    } else if (activeBrush == "water") {
      world.getTile(hovered.x, hovered.y).terrain = "water";
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

document.getElementById("pointerBrush").addEventListener("click", () => {
  activeBrush = "pointer";
});

document.getElementById("foodBrush").addEventListener("click", () => {
  activeBrush = "food";
});

document.getElementById("dirtBrush").addEventListener("click", () => {
  activeBrush = "dirt";
});

document.getElementById("waterBrush").addEventListener("click", () => {
  activeBrush = "water";
});

document.getElementById("eraserBrush").addEventListener("click", () => {
  activeBrush = "eraser";
});

document.getElementById("humanBrush").addEventListener("click", () => {
  activeBrush = "human";
});

document.getElementById("entitiesCategory").addEventListener("click", () => {
  document.getElementById("tilesPanel").classList.remove("open");
  document.getElementById("entitiesPanel").classList.toggle("open");
});

document.getElementById("tilesCategory").addEventListener("click", () => {
  document.getElementById("entitiesPanel").classList.remove("open");
  document.getElementById("tilesPanel").classList.toggle("open");
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
        if (below.terrain == "air" && below.resource == null) {
          current.resource = null;
          below.resource = "food";
        }
      }

      if (current.terrain === "water") {
        if (below.terrain == "air") {
          current.terrain = "air";
          below.terrain = "water";
        }
      }
    }
  }

  entityManager.simulate();
}


function loop() {
  const now = Date.now();

  cameraSystem.move(keyboard.keys);
  if (keyboard.keys["space"]) {
    if (timeSetting != "paused") {
      timeSetting = "paused";
      document.getElementById("pauseButton").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
      document.getElementById("playButton").style.backgroundColor = "rgba(255, 255, 255, 0)";
      document.getElementById("twoXButton").style.backgroundColor = "rgba(255, 255, 255, 0)";
      keyboard.keys["space"] = false;
    } else {
      timeSetting = "normal";
      CONFIG.simulation.tickRate = 300;
      document.getElementById("pauseButton").style.backgroundColor = "rgba(255, 255, 255, 0)";
      document.getElementById("playButton").style.backgroundColor = "rgba(255, 255, 255, 0.5)";
      document.getElementById("twoXButton").style.backgroundColor = "rgba(255, 255, 255, 0)";
      keyboard.keys["space"] = false;
    }
  }

  if (now - lastTick > CONFIG.simulation.tickRate) {
    if (timeSetting != "paused") {
      simulate();
    }
    lastTick = now;
  }

  render(ctx, world, entityManager, cameraSystem.camera, mouseManager.coords, activeBrush, tooltip, sim);
  requestAnimationFrame(loop);
}

loop();