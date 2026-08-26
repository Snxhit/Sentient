import CONFIG from "../core/config.js";

export function renderEntities(ctx, world, entities, camera) {
  entities.forEach(e => {
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