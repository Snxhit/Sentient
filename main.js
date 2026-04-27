const sim = document.getElementById("sim");
const ctx = sim.getContext("2d");

const container = document.getElementById("container");

function resizeCanvas() {
  sim.width = container.clientWidth;
  sim.height = container.clientHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let tileSize = 20;
const SIM_WIDTH = 100;
const SIM_HEIGHT = 100;

const camera = {
  x: 0,
  y: 0,
  speed: 20
}

const grid = [];

for (let y = 0; y < SIM_HEIGHT; y++) {
  const row = [];
  for (let x = 0; x < SIM_WIDTH; x++) {
    const isGround = y > 60;
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
    onGround: false,
    width: 1,
    height: 2,
    color: "#f5c6a5"
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
    tileSize *= 0.9;
  }
  if (e.key === "p") {
    tileSize *= 1.1;
  }

  tileSize = Math.max(5, Math.min(tileSize, 60));

  camera.x = Math.max(0, Math.min(camera.x, SIM_WIDTH * tileSize - sim.width));
  camera.y = Math.max(0, Math.min(camera.y, SIM_HEIGHT * tileSize - sim.height));
});

function isSolid(x, y) {
  if (x < 0 || y < 0 || x >= SIM_WIDTH || y >= SIM_HEIGHT) {
    return true;
  }
  return grid[Math.floor(y)][Math.floor(x)].solid;
}

let lastTick = 0;
const TICK_RATE = 300;
function simulate() {
  const GRAVITY = 0.2;
  const TERM_VEL = 6;

  humans.forEach(h => {
    h.vy += GRAVITY;
    if (h.vy > TERM_VEL) {
      h.vy = TERM_VEL;
    }

    h.onGround = false;

    h.y += h.vy;

    for (let i = 0; i < h.width; i++) {
      if (isSolid(h.x + i, h.y + h.height)) {
        h.y = Math.floor(h.y + h.height) - h.height;
        h.vy = 0;
        h.onGround = true;
        break;
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

      ctx.fillRect(screenX, screenY, tileSize, tileSize);
    }
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
  });

  ctx.strokeStyle = "#00000020";
  ctx.strokeRect(screenX, screenY, tileSize, tileSize);
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
