import ScreenManager from "./core/screenManager.js";
import CONFIG from "./core/config.js";

import { Keyboard } from "./input/keyboard.js";
import { camera, CameraSystem } from "./input/cameraSystem.js";
import { mouse } from "./input/mouse.js";

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

const keyboard = new Keyboard();
keyboard.init();
const cameraSystem = new CameraSystem(camera, sim);

const world = new World(CONFIG.world.width, CONFIG.world.height, generateTerrain(CONFIG.world.width, CONFIG.world.height));
world.generate();

const entityManager = new EntityManager(world);
entityManager.spawn(new Human(10, 10));
entityManager.spawn(new Cat(20, 10));

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

  cameraSystem.move(keyboard.keys);

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