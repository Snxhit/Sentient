/*
Cell IDs ::-->
    0 -> Air
    1 -> Human
    2 -> Dirt
    3 -> Food
*/

// Note to self: rows are y axis, cols are x axis

const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio || 1;

// const cellSize = 15;
const cellSize = 20;
const gridSizeX = Math.floor(window.innerWidth / cellSize) - 2;
const gridSizeY = Math.floor(window.innerHeight / cellSize) - 2;


canvas.width = gridSizeX * cellSize * dpr;
canvas.height = gridSizeY * cellSize * dpr;
canvas.style.width = `${gridSizeX * cellSize}px`
canvas.style.height = `${gridSizeY * cellSize}px`

ctx.scale(dpr, dpr)

let humans = {}
let human = {
    x: 0,
    y: 0,
};

const humanBrush = document.getElementById("humanBrush");
const dirtBrush = document.getElementById("dirtBrush");
let activeBrush = "humanBrush";


const grid = Array.from({ length: gridSizeY }, () =>
    Array(gridSizeX).fill(0)
);


function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < gridSizeY; row++) {
        for (let col = 0; col < gridSizeX; col++) {
            ctx.lineWidth = 0.05;
            ctx.strokeStyle = '#ccc';
            ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
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
            if (grid[row][col] === 3) {
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
    if (activeBrush === "foodBrush") {
        grid[row][col] = 3;
    }
    drawGrid();
});


humanBrush.onclick = () => {
    activeBrush = "humanBrush";
};
dirtBrush.onclick = () => {
    activeBrush = "dirtBrush";
};
foodBrush.onclick = () => {
    activeBrush = "foodBrush";
}

setInterval(gravity, 200);
setInterval(humanMove, 2500);

function humanMove() {
    if (human.x && human.y) {
        if ((human.x != 0 && human.y >= gridSize - 2) || grid[human.y + 1][human.x] === 2) {
            grid[human.y][human.x] = 0
            grid[human.y + 1][human.x] = 0
            human.x = human.x + randInt(-4, 4);
            grid[human.y][human.x] = grid[human.y][human.x] === 0 ? 1 : 0;
            grid[human.y + 1][human.x] = grid[human.y + 1][human.x] === 0 ? 1 : 0;
            drawGrid();
        };
    };
};

function gravity() {
    if (human.x && human.y) {
        if (human.y < gridSizeY - 2 && grid[human.y + 1][human.x] != 2) {
            grid[human.y][human.x] = 0;
            grid[human.y + 1][human.x] = 0;
            human.y += 1;
            if (grid[human.y + 1][human.x] === 2) {
                return;
            }
            else {
                grid[human.y][human.x] = 1;
                grid[human.y + 1][human.x] = 1;
            }
            drawGrid();
        };
    };
};


function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


drawGrid();