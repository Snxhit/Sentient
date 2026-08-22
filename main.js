import CONFIG from "./core/config.js";

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
  const hovered = getHoveredTile();

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

function screenToWorld(mx, my) {
  return {
    x: (mx + camera.x) / CONFIG.world.tileSize,
    y: (my + camera.y) / CONFIG.world.tileSize
  }
}

const world = new World(CONFIG.world.width, CONFIG.world.height, generateTerrain(CONFIG.world.width, CONFIG.world.height));
world.generate();

function getHoveredTile() {
  const worldCoords = screenToWorld(mouse.x, mouse.y);

  const tx = Math.floor(worldCoords.x);
  const ty = Math.floor(worldCoords.y);

  if (tx < 0 || ty < 0 || tx >= CONFIG.world.width || ty >= CONFIG.world.height) {
    return null;
  };

  return {
    x: tx,
    y: ty,
    tile: world.getTile(tx, ty)
  };
}

function getHumanTile(tx, ty) {
  return entityManager.getEntitiesByType(Human).find(h =>
    tx >= Math.floor(h.x) &&
    tx < Math.floor(h.x + h.width) &&
    ty >= Math.floor(h.y) &&
    ty < Math.floor(h.y + h.height)
  ) || null;
}

class Entity {
  constructor(x, y, config = {}) {
    this.x = x;
    this.y = y;
    this.vx = config.vx ?? 0;
    this.vy = config.vy ?? 0;
    this.moveDir = config.moveDir ?? 0;
    this.moveTime = config.moveTime ?? 0;
    this.onGround = config.onGround ?? false;
    this.width = config.width ?? 1;
    this.height = config.height ?? 1;
    this.color = config.color ?? "#ffffff";
    this.bcolor = config.bcolor ?? "#000000";
    this.isAlive = true;
  }
  
  simulate() {

  }
}

class Human extends Entity {
  constructor(x, y, config = {}) {
    super(x, y, {
      width: 1,
      height: 2,
      color: "#f5c6a5",
      bcolor: "#c49e82",
      ...config
    });

    this.health = config.health ?? 10;
    this.satiety = config.satiety ?? 100;
  }

  simulate() {
    if (this.satiety > 0) {
      this.satiety -= 4;
    } else if (this.satiety <= 0) {
      this.satiety = 0;
      if (this.health > 0) {
        this.health -= 1;
      } else {
        this.isAlive = false;
        this.health = 0;
      }
    }

    this.vy += CONFIG.physics.gravity;
    if (this.vy > CONFIG.physics.terminalVelocity) {
      this.vy = CONFIG.physics.terminalVelocity;
    }

    this.onGround = false;

    let remainingY = this.vy;

    while (Math.abs(remainingY) > 0) {
      const step = Math.sign(remainingY) * Math.min(Math.abs(remainingY), CONFIG.physics.maxStep);
      const nextY = this.y + step;

      if (collidesAt(world, this.x, nextY, this.width, this.height)) {
        if (step > 0) {
          const hitTileY = Math.floor(nextY + this.height - 1e-6);
          this.y = hitTileY - this.height;
          this.onGround = true;
        }
        this.vy = 0;
        break;
      }

      this.y = nextY;
      remainingY -= step;
    }

    if (this.onGround) {
      const foodTarget = findNearestFoodTile(this.x, this.y, CONFIG.entities.foodSmellRange);

      if (foodTarget) {
        const dx = foodTarget.x - this.x;
        if (Math.abs(dx) < 0.01) {
          this.moveDir = 0;
        } else {
          this.moveDir = dx > 0 ? 1 : -1;
        }

        const newX = this.x + this.moveDir;
        if (!collidesAt(world, newX, this.y, this.width, this.height)) {
          this.x += this.moveDir;
        } else if (!collidesAt(world, newX, this.y - 1, this.width, this.height)) {
          this.y -= 1;
          this.x += this.moveDir;
        }

        if (newX == foodTarget.x) {
          world.getTile(foodTarget.x, foodTarget.y).resource = null;
          this.satiety += 10;
        }
      } else {
        if (this.moveTime <= 0) {
          let r = Math.random();
          if (r < 0.33) {
            this.moveDir = -1;
          } else if (r < 0.66) {
            this.moveDir = 1;
          } else {
            this.moveDir = 0;
          }

          this.moveTime = Math.floor(Math.random() * 10) + 5;
        }

        let newX = this.x + this.moveDir;
        if (!collidesAt(world, newX, this.y, this.width, this.height)) {
          this.x += this.moveDir;
        } else if (!collidesAt(world, newX, this.y - 1, this.width, this.height)) {
          this.y -= 1;
          this.x += this.moveDir;
        }

        this.moveTime -= 1;
      }
    }
  }
}

class Cat extends Entity {
  constructor(x, y, config = {}) {
    super(x, y, {
      width: 1,
      height: 1,
      color: "#e2d739",
      bcolor: "#9d9528",
      ...config
    });

    this.health = config.health ?? 5;
    this.satiety = config.satiety ?? 100;
  }

  simulate() {
    if (this.satiety > 0) {
      this.satiety -= 4;
    } else if (this.satiety <= 0) {
      this.satiety = 0;
      if (this.health > 0) {
        this.health -= 1;
      } else {
        this.isAlive = false;
        this.health = 0;
      }
    }

    this.vy += CONFIG.physics.gravity;
    if (this.vy > CONFIG.physics.terminalVelocity) {
      this.vy = CONFIG.physics.terminalVelocity;
    }

    this.onGround = false;

    let remainingY = this.vy;

    while (Math.abs(remainingY) > 0) {
      const step = Math.sign(remainingY) * Math.min(Math.abs(remainingY), CONFIG.physics.maxStep);
      const nextY = this.y + step;

      if (collidesAt(world, this.x, nextY, this.width, this.height)) {
        if (step > 0) {
          const hitTileY = Math.floor(nextY + this.height - 1e-6);
          this.y = hitTileY - this.height;
          this.onGround = true;
        }
        this.vy = 0;
        break;
      }

      this.y = nextY;
      remainingY -= step;
    }

    if (this.onGround) {
      const foodTarget = findNearestFoodTile(this.x, this.y, CONFIG.entities.foodSmellRange);

      if (foodTarget) {
        const dx = foodTarget.x - this.x;
        if (Math.abs(dx) < 0.01) {
          this.moveDir = 0;
        } else {
          this.moveDir = dx > 0 ? 1 : -1;
        }

        const newX = this.x + this.moveDir;
        if (!collidesAt(world, newX, this.y, this.width, this.height)) {
          this.x += this.moveDir;
        } else if (!collidesAt(world, newX, this.y - 1, this.width, this.height)) {
          this.y -= 1;
          this.x += this.moveDir;
        }

        if (newX == foodTarget.x) {
          world.getTile(foodTarget.x, foodTarget.y).resource = null;
          this.satiety += 10;
        }
      } else {
        if (this.moveTime <= 0) {
          let r = Math.random();
          if (r < 0.33) {
            this.moveDir = -1;
          } else if (r < 0.66) {
            this.moveDir = 1;
          } else {
            this.moveDir = 0;
          }

          this.moveTime = Math.floor(Math.random() * 10) + 5;
        }

        let newX = this.x + this.moveDir;
        if (!collidesAt(world, newX, this.y, this.width, this.height)) {
          this.x += this.moveDir;
        } else if (!collidesAt(world, newX, this.y - 1, this.width, this.height)) {
          this.y -= 1;
          this.x += this.moveDir;
        }

        this.moveTime -= 1;
      }
    }
  }
}

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

      e.simulate();
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

function findNearestFoodTile(originX, originY, smellRange) {
  let closest = null;
  let closestDistSq = Infinity;

  const minX = Math.max(0, Math.floor(originX - smellRange));
  const maxX = Math.min(CONFIG.world.width - 1, Math.floor(originX + smellRange));
  const minY = Math.max(0, Math.floor(originY - smellRange));
  const maxY = Math.min(CONFIG.world.height - 1, Math.floor(originY + smellRange));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (world.getTile(x, y).resource !== "food") {
        continue;
      }

      const dx = x - originX;
      const dy = y - originY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= smellRange * smellRange && distSq < closestDistSq) {
        closest = { x, y };
        closestDistSq = distSq;
      }
    }
  }

  return closest;
}

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

function render() {
  ctx.clearRect(0, 0, sim.width, sim.height);

  for (let y = 0; y < world.height; y++) {
    for (let x = 0; x < world.width; x++) {
      const screenX = x * CONFIG.world.tileSize - camera.x;
      const screenY = y * CONFIG.world.tileSize - camera.y;

      const tile = world.getTile(x, y);

      if (tile.solid) {
        ctx.fillStyle = "#6d4c41";
      } else {
        ctx.fillStyle = "#87ceeb";
      }

      if (tile.resource == "food") {
        ctx.fillStyle = "#03bf03";
      }

      ctx.fillRect(screenX, screenY, CONFIG.world.tileSize, CONFIG.world.tileSize);

      ctx.strokeStyle = "#00000020";
      ctx.strokeRect(screenX, screenY, CONFIG.world.tileSize, CONFIG.world.tileSize);
    }
  }

  const hovered = getHoveredTile();

  if (hovered) {
    const screenX = hovered.x * CONFIG.world.tileSize - camera.x;
    const screenY = hovered.y * CONFIG.world.tileSize - camera.y;

    ctx.lineWidth = 2;

    if (activeBrush == "pointer") {
      ctx.strokeStyle = "yellow";
      ctx.strokeRect(screenX, screenY, CONFIG.world.tileSize, CONFIG.world.tileSize);
    } else if (activeBrush == "food") {
      ctx.strokeStyle = "green";
      ctx.strokeRect(screenX, screenY, CONFIG.world.tileSize, CONFIG.world.tileSize);
    } else if (activeBrush == "dirt") {
      ctx.strokeStyle = "#573a30";
      ctx.strokeRect(screenX, screenY, CONFIG.world.tileSize, CONFIG.world.tileSize);
    } else if (activeBrush == "eraser") {
      ctx.strokeStyle = "black";
      ctx.strokeRect(screenX, screenY, CONFIG.world.tileSize, CONFIG.world.tileSize);
    } else if (activeBrush == "human") {
      ctx.strokeStyle = "#f5c6a5";
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, screenY, CONFIG.world.tileSize, CONFIG.world.tileSize * 2);
    }

    // tooltip stoof (its in render cuz ion wanna put it elsewhere)
    if (activeBrush == "pointer") {
      tooltip.style.display = "block";

      const rect = sim.getBoundingClientRect();

      tooltip.style.left = rect.left + mouse.x + 5 + "px";
      tooltip.style.top = rect.top + mouse.y + 5 + "px";

      const t = hovered.tile;
      const h = getHumanTile(hovered.x, hovered.y);

      if (h) {
        tooltip.innerHTML = `Human at (${hovered.x}, ${hovered.y}) rn.<br>Health: ${h.health}<br>Satiety: ${h.satiety}`;
      } else {
        tooltip.innerHTML = `We at (${hovered.x}, ${hovered.y}) rn.`;
      }
    } else {
      tooltip.style.display = "none";
    }
  } else {
    tooltip.style.display = "none";
  }

  entityManager.entities.forEach(e => {
    const screenX = e.x * CONFIG.world.tileSize - camera.x;
    const screenY = e.y * CONFIG.world.tileSize - camera.y;

    ctx.fillStyle = e.color;
    ctx.fillRect(
      screenX,
      screenY,
      CONFIG.world.tileSize * e.width,
      CONFIG.world.tileSize * e.height
    );
    ctx.strokeStyle = e.bcolor;
    ctx.strokeRect(screenX, screenY, CONFIG.world.tileSize * e.width, CONFIG.world.tileSize * e.height);
  });

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

  render();
  requestAnimationFrame(loop);
}

loop();
