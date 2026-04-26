const sim = document.getElementById("sim");
const ctx = sim.getContext("2d");

const container = document.getElementById("container");

function resizeCanvas() {
  sim.width = container.clientWidth;
  sim.height = container.clientHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const TILE_SIZE = 20;
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
    row.push({
      terrain: "grass",
      resource: null
    })
  }
  grid.push(row);
}

const humans = [
  {
    x: 10,
    y: 10,
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

  //todo: clamp camera
});

//todo: simulate human and stuff
let lastTick = 0;
const TICK_RATE = 300;
function simulate() {
  ;
}

function render(params) {
  ctx.clearRect(0, 0, sim.width, sim.height);

  for (let y = 0; y < SIM_HEIGHT; y++) {
    for (let x = 0; x < SIM_WIDTH; x++) {
      const screenX = x * TILE_SIZE - camera.x;
      const screenY = y * TILE_SIZE - camera.y;

      //todo: cull offscreen tiles

      const tile = grid[y][x];

      ctx.fillStyle =  "#2e7d32";
      ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

    }
  }

  humans.forEach(h => {
    const screenX = h.x * TILE_SIZE - camera.x;
    const screenY = h.y * TILE_SIZE - camera.y;

    ctx.fillStyle = h.color;
    ctx.fillRect(
      screenX,
      screenY,
      TILE_SIZE * h.width,
      TILE_SIZE * h.height
    );
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
