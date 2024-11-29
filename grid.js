// Configuration
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 41;
const cellSize = 15;

// Set canvas size based on grid
canvas.width = gridSize * cellSize;
canvas.height = gridSize * cellSize;

let humans = {}
let human = {
    x: 0,
    y: 0,
};

const humanBrush = document.getElementById("humanBrush");
const dirtBrush = document.getElementById("dirtBrush");
let activeBrush = "humanBrush";


const grid = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(0)
);

// Draw Grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            ctx.lineWidth = 0.2;
            ctx.strokeStyle = '#ccc';
            ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);

            // Optional: Fill cell based on state (for example, 1 = active)

            /*if (row === human.y && col === human.x) {
                ctx.fillStyle = "#ffdbac"
                ctx.fillRect(
                    human.x * cellSize,
                    human.y * cellSize,
                    cellSize,
                    cellSize
                );
                ctx.fillRect(
                    human.x * cellSize,
                    (human.y + 1) * cellSize,
                    cellSize,
                    cellSize
                );
            }*/
            if (grid[row][col] === 1) {
                ctx.fillStyle = "#ffdbac";
                ctx.fillRect(
                    col * cellSize,
                    row * cellSize,
                    cellSize,
                    cellSize
                );
            }
            if (grid[row][col] === 2) {
                ctx.fillStyle = "#664625";
                ctx.fillRect(
                    col * cellSize,
                    row * cellSize,
                    cellSize,
                    cellSize
                );
            }
        }
    }
}

// Handle Click Events
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (activeBrush === "humanBrush") {
        grid[human.y][human.x] = 0;
        grid[human.y + 1][human.x] = 0;
        grid[row][col] = grid[row][col] === 0 ? 1 : 0;
        grid[row + 1][col] = grid[row + 1][col] === 0 ? 1 : 0;
        human.x = col;
        human.y = row;
    }
    if (activeBrush === "dirtBrush") {
        grid[row][col] = 2;
    }

    drawGrid();
});


humanBrush.onclick = () => {
    activeBrush = "humanBrush";
};
dirtBrush.onclick = () => {
    activeBrush = "dirtBrush";
};

setInterval(gravity, 200);
setInterval(humanMove, 2500);

function humanMove() {
    if (human.x != 0 && human.y >= gridSize - 2) {
        grid[human.y][human.x] = 0
        grid[human.y + 1][human.x] = 0
        human.x = human.x + randInt(-4, 4);
        grid[human.y][human.x] = grid[human.y][human.x] === 0 ? 1 : 0;
        grid[human.y + 1][human.x] = grid[human.y + 1][human.x] === 0 ? 1 : 0;
        drawGrid();
    };
};

function gravity() {
    if (human.y < gridSize - 2) {
        grid[human.y][human.x] = 0;
        grid[human.y + 1][human.x] = 0;
        human.y += 1;
        grid[human.y][human.x] = 1;
        grid[human.y + 1][human.x] = 1;
        drawGrid();
    };
};


function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


drawGrid();
