export function renderEntities(ctx, world, entities, camera) {
  entities.forEach(e => {
    const screenX = e.x * world.tileSize - camera.x;
    const screenY = e.y * world.tileSize - camera.y;

    ctx.fillStyle = e.color;
    ctx.fillRect(
      screenX,
      screenY,
      world.tileSize * e.width,
      world.tileSize * e.height
    );
    ctx.strokeStyle = e.bcolor;
    ctx.strokeRect(screenX, screenY, world.tileSize * e.width, world.tileSize * e.height);
  });
}