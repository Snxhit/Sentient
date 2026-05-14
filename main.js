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
const SIM_WIDTH = 100;
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
  const n = noise.GetNoise(x * 0.02, 0);
  const h = Math.floor(30 + n * 20);
  heights.push(h);
}

sim.addEventListener("click", () => {
  const hovered = getHoveredTile();

  if (hovered) {
    if (activeBrush == "pointer") {
      console.log(hovered);
    } else if (activeBrush == "food") {
      grid[hovered.y][hovered.x].resource = "food";
    };
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

function isSolid(x, y) {
  if (x < 0 || y < 0 || x >= SIM_WIDTH || y >= SIM_HEIGHT) {
    return true;
  }
  return grid[Math.floor(y)][Math.floor(x)].solid;
}

function collidesAt(x, y, width, height) {
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

let lastTick = 0;
const TICK_RATE = 300;
function simulate() {
  const GRAVITY = 0.2;
  const TERM_VEL = 6;
  const MAX_STEP = 0.25;

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
      if (h.satiety <= -1) {
        // loop through a certain radius of blocks or smth to search for food.
      } else {
        let r = Math.random();
        if (r < 0.33) {
          h.x += 1;
        } else if (r >= 0.33 && r < 0.66) {
          h.x -= 1;
        }
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

    if (activeBrush == "pointer") {
      ctx.strokeStyle = "yellow";
    } else if (activeBrush == "food") {
      ctx.strokeStyle = "green";
    }
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX, screenY, tileSize, tileSize);

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
