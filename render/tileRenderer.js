import CONFIG from "../core/config.js";

export function renderTiles(ctx, world, camera) {
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
}