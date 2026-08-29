export class Tooltip {
    constructor(element) {
        this.element = element;
        this.visible = false;
    }

    show() {
        if (!this.visible) {
            this.element.style.display = "block";
            this.visible = true;
        }
    }

    hide() {
        if (this.visible) {
            this.element.style.display = "none";
            this.visible = false;
        }
    }

    updateFrame(x, y, rect) {
        this.element.style.left = `${rect.left + x + 15}px`;
        this.element.style.top = `${rect.top + y + 15}px`;
    }

    updateContent(rows) {
        this.element.innerHTML = rows.join("<br>");
    }

    setTileInfo(x, y, tile) {
        const rows = [
            `Tile Coords: (${x}, ${y})`,
            `Terrain: ${tile.terrain}`,
            `Solid: ${tile.solid ? "Yes" : "No"}`
        ];

        if (tile.resource) {
            rows.push(`Resource: ${tile.resource}`);
        }

        this.updateContent(rows);
    }

    setEntityInfo(x, y, entity) {
        const typeName = entity.constructor.name;
        const rows = [
            `${typeName}`,
            `Coords: (${x}, ${y})`,
            `Health: ${entity.health}`,
            `Satiety: ${entity.satiety}`
        ];

        this.updateContent(rows);
    }
}