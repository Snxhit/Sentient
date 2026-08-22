export class World {
    constructor(width, height, heights) {
        this.width = width;
        this.height = height;
        this.heights = heights;
        this.grid = [];
    }

    generate() {
        for (let y = 0; y < this.height; y++) {
        const row = [];
        for (let x = 0; x < this.width; x++) {
            const isGround = this.heights[x] <= y;
            row.push({
            terrain: isGround ? "dirt" : "air",
            solid: isGround,
            resource: null
            })
        }
        this.grid.push(row);
        }
    }

    getTile(x, y) {
        if (!this.inBounds(x, y)) {
            return null;
        }
        return this.grid[y][x];
    }

    inBounds(x, y) {
        return (
            x >= 0 &&
            y >= 0 &&
            x < this.width &&
            y < this.height
        );
    }

    isSolid(x, y) {
        if (!this.inBounds(x, y)) {
            return true;
        }
        return this.grid[y][x].solid;
    }
}