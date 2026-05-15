import FastNoiseLite from 'https://cdn.jsdelivr.net/npm/fastnoise-lite@1.1.1/FastNoiseLite.min.js';

const noise = new FastNoiseLite();

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

let tileSize = 20;
const SIM_WIDTH = 500;
const SIM_HEIGHT = 100;
let activeBrush = "pointer";

const camera = {
  x: 0,
  y: 0,
  speed: 20
}

const mouse = {
  x: 0,
  y: 0
}

const heights = [];

for (let x = 0; x < SIM_WIDTH; x++) {
  const n = noise.GetNoise(x * 0.20, 0);
  const h = Math.floor(70 + n * 20);
  heights.push(h);
}

sim.addEventListener("click", () => {
  const hovered = getHoveredTile();

  if (hovered) {
    if (activeBrush == "pointer") {
      console.log(hovered);
    } else if (activeBrush == "food") {
      grid[hovered.y][hovered.x].resource = "food";
    } else if (activeBrush == "dirt") {
      grid[hovered.y][hovered.x].terrain = "dirt";
      grid[hovered.y][hovered.x].solid = true;
    } else if (activeBrush == "eraser") {
      grid[hovered.y][hovered.x].terrain = "air";
      grid[hovered.y][hovered.x].solid = false;
      grid[hovered.y][hovered.x].resource = null;
    } else if (activeBrush == "human") {
        humans.push(
          {
            x: hovered.x,
            y: hovered.y,
            vx: 0,
            vy: 0,
            moveDir: 0,
            moveTime: 0,
            health: 10,
            satiety: 100,
            onGround: false,
            width: 1,
            height: 2,
            color: "#f5c6a5",
            bcolor: "#c49e82"
        });
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
    x: (mx + camera.x) / tileSize,
    y: (my + camera.y) / tileSize
  }
}

function getHoveredTile() {
  const world = screenToWorld(mouse.x, mouse.y);

  const tx = Math.floor(world.x);
  const ty = Math.floor(world.y);

  if (tx < 0 || ty < 0 || tx >= SIM_WIDTH || ty >= SIM_HEIGHT) {
    return null;
  };

  return {
    x: tx,
    y: ty,
    tile: grid[ty][tx]
  };
}

function getHumanTile(tx, ty) {
  return humans.find(h =>
    tx >= Math.floor(h.x) &&
    tx < Math.floor(h.x + h.width) &&
    ty >= Math.floor(h.y) &&
    ty < Math.floor(h.y + h.height)
  ) || null;
}

const grid = [];

for (let y = 0; y < SIM_HEIGHT; y++) {
  const row = [];
  for (let x = 0; x < SIM_WIDTH; x++) {
    const isGround = heights[x] <= y;
    row.push({
      terrain: isGround ? "dirt" : "air",
      solid: isGround,
      resource: null
    })
  }
  grid.push(row);
}

const humans = [
  {
    x: 10,
    y: 10,
    vx: 0,
    vy: 0,
    moveDir: 0,
    moveTime: 0,
    health: 10,
    satiety: 100,
    onGround: false,
    width: 1,
    height: 2,
    color: "#f5c6a5",
    bcolor: "#c49e82"
  }
];

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
    if (SIM_WIDTH * tileSize * 0.9 >= window.innerWidth && SIM_HEIGHT * tileSize * 0.9 >= window.innerHeight) {
      tileSize *= 0.9;
    };
  }
  if (e.key === "p") {
    tileSize *= 1.1;
  }

  tileSize = Math.max(5, Math.min(tileSize, 60));

  camera.x = Math.max(0, Math.min(camera.x, SIM_WIDTH * tileSize - sim.width));
  camera.y = Math.max(0, Math.min(camera.y, SIM_HEIGHT * tileSize - sim.height));
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

document.getElementById("eraserBrush").addEventListener("click", () => {
  activeBrush = "eraser";
});

document.getElementById("humanBrush").addEventListener("click", () => {
  activeBrush = "human";
});

function isSolid(x, y) {
  if (x < 0 || y < 0 || x >= SIM_WIDTH || y >= SIM_HEIGHT) {
    return true;
  }
  return grid[Math.floor(y)][Math.floor(x)].solid;
}

function collidesAt(x, y, width, height) {
  // ts for world boundaries, need fix this, doesnt take width into account
  if (x < 0) {
    return true;
  }
  const left = Math.floor(x);
  const right = Math.floor(x + width - 1e-6);
  const top = Math.floor(y);
  const bottom = Math.floor(y + height - 1e-6);

  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      if (isSolid(tx, ty)) {
        return true;
      }
    }
  }

  return false;
}

function findNearestFoodTile(originX, originY, smellRange) {
  let closest = null;
  let closestDistSq = Infinity;

  const minX = Math.max(0, Math.floor(originX - smellRange));
  const maxX = Math.min(SIM_WIDTH - 1, Math.floor(originX + smellRange));
  const minY = Math.max(0, Math.floor(originY - smellRange));
  const maxY = Math.min(SIM_HEIGHT - 1, Math.floor(originY + smellRange));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (grid[y][x].resource !== "food") {
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
const TICK_RATE = 300;
function simulate() {
  const GRAVITY = 0.2;
  const TERM_VEL = 6;
  const MAX_STEP = 0.25;
  const FOOD_SMELL_RANGE = 8;

  for (let y = SIM_HEIGHT - 1; y >= 0; y--) {
    for (let x = 0; x < SIM_WIDTH; x++) {
      let cTile = grid[y][x];
      if (cTile.resource == "food") {
        if (grid[y+1][x].terrain != "dirt" && grid[y+1][x].resource != "food") {
          grid[y][x].resource = null;
          grid[y+1][x].resource = "food";
        }
      }
    }
  }

  humans.forEach(h => {
    if (h.satiety > 0) {
      h.satiety -= 4;
    } else if (h.satiety <= 0) {
      h.satiety = 0;
      if (h.health > 0) {
        h.health -= 1;
      } else {
        h.health = 0;
      }
    }

    h.vy += GRAVITY;
    if (h.vy > TERM_VEL) {
      h.vy = TERM_VEL;
    }

    h.onGround = false;

    let remainingY = h.vy;

    while (Math.abs(remainingY) > 0) {
      const step = Math.sign(remainingY) * Math.min(Math.abs(remainingY), MAX_STEP);
      const nextY = h.y + step;

      if (collidesAt(h.x, nextY, h.width, h.height)) {
        if (step > 0) {
          const hitTileY = Math.floor(nextY + h.height - 1e-6);
          h.y = hitTileY - h.height;
          h.onGround = true;
        }
        h.vy = 0;
        break;
      }

      h.y = nextY;
      remainingY -= step;
    }

    if (h.onGround) {
      const foodTarget = findNearestFoodTile(h.x, h.y, FOOD_SMELL_RANGE);

      if (foodTarget) {
        const dx = foodTarget.x - h.x;
        if (Math.abs(dx) < 0.01) {
          h.moveDir = 0;
        } else {
          h.moveDir = dx > 0 ? 1 : -1;
        }

        const newX = h.x + h.moveDir;
        if (!collidesAt(newX, h.y, h.width, h.height)) {
          h.x += h.moveDir;
        } else if (!collidesAt(newX, h.y - 1, h.width, h.height)) {
          h.y -= 1;
          h.x += h.moveDir;
        }

        if (newX == foodTarget.x) {
          grid[foodTarget.y][foodTarget.x].resource = null;
          h.satiety += 10;
        }
      } else {
        if (h.moveTime <= 0) {
          let r = Math.random();
          if (r < 0.33) {
            h.moveDir = -1;
          } else if (r < 0.66) {
            h.moveDir = 1;
          } else {
            h.moveDir = 0;
          }

          h.moveTime = Math.floor(Math.random() * 10) + 5;
        }

        let newX = h.x + h.moveDir;
        if (!collidesAt(newX, h.y, h.width, h.height)) {
          h.x += h.moveDir;
        } else if (!collidesAt(newX, h.y - 1, h.width, h.height)) {
          h.y -= 1;
          h.x += h.moveDir;
        }

        h.moveTime -= 1;
      }
    }
  });
}

function render(params) {
  ctx.clearRect(0, 0, sim.width, sim.height);

  for (let y = 0; y < SIM_HEIGHT; y++) {
    for (let x = 0; x < SIM_WIDTH; x++) {
      const screenX = x * tileSize - camera.x;
      const screenY = y * tileSize - camera.y;

      const tile = grid[y][x];

      if (tile.solid) {
        ctx.fillStyle = "#6d4c41";
      } else {
        ctx.fillStyle = "#87ceeb";
      }

      if (tile.resource == "food") {
        ctx.fillStyle = "#03bf03";
      }

      ctx.fillRect(screenX, screenY, tileSize, tileSize);

      ctx.strokeStyle = "#00000020";
      ctx.strokeRect(screenX, screenY, tileSize, tileSize);
    }
  }

  const hovered = getHoveredTile();

  if (hovered) {
    const screenX = hovered.x * tileSize - camera.x;
    const screenY = hovered.y * tileSize - camera.y;

    ctx.lineWidth = 2;

    if (activeBrush == "pointer") {
      ctx.strokeStyle = "yellow";
      ctx.strokeRect(screenX, screenY, tileSize, tileSize);
    } else if (activeBrush == "food") {
      ctx.strokeStyle = "green";
      ctx.strokeRect(screenX, screenY, tileSize, tileSize);
    } else if (activeBrush == "dirt") {
      ctx.strokeStyle = "#573a30";
      ctx.strokeRect(screenX, screenY, tileSize, tileSize);
    } else if (activeBrush == "eraser") {
      ctx.strokeStyle = "black";
      ctx.strokeRect(screenX, screenY, tileSize, tileSize);
    } else if (activeBrush == "human") {
      ctx.strokeStyle = "#f5c6a5";
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, screenY, tileSize, tileSize*2);
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

  humans.forEach(h => {
    const screenX = h.x * tileSize - camera.x;
    const screenY = h.y * tileSize - camera.y;

    ctx.fillStyle = h.color;
    ctx.fillRect(
      screenX,
      screenY,
      tileSize * h.width,
      tileSize * h.height
    );
    ctx.strokeStyle = h.bcolor;
    ctx.strokeRect(screenX, screenY, tileSize * h.width, tileSize * h.height);
  });

}

function loop() {
  const now = Date.now();

  if (now - lastTick > TICK_RATE) {
    simulate();
    lastTick = now;
  }

  render();
  requestAnimationFrame(loop);
}

loop();
