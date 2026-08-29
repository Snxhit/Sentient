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
    ctx.lineWidth = 1;
    ctx.strokeRect(screenX, screenY, CONFIG.world.tileSize * e.width, CONFIG.world.tileSize * e.height);

    if (e.talk) {
      const talkX = screenX + (CONFIG.world.tileSize * e.width) / 2;
      const talkY = screenY - 10;
      ctx.font = '20px "Do Hyeon"';
      ctx.textAlign = "center";
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.strokeStyle = "black";
      ctx.strokeText(e.talk, talkX, talkY);
      ctx.fillStyle = "white";
      ctx.fillText(e.talk, talkX, talkY);
      ctx.lineWidth = 1;
    }
  });
}