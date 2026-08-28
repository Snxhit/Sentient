import CONFIG from "../core/config.js";

export function getHoveredTile(world, camera, mouse) {
  const worldCoords = screenToWorld(camera, mouse.x, mouse.y);

  const tx = Math.floor(worldCoords.x);
  const ty = Math.floor(worldCoords.y);

  if (tx < 0 || ty < 0 || tx >= world.width || ty >= world.height) {
    return null;
  };

  return {
    x: tx,
    y: ty,
    tile: world.getTile(tx, ty)
  };
}

export function screenToWorld(camera, mx, my) {
  return {
    x: (mx + camera.x) / CONFIG.world.tileSize,
    y: (my + camera.y) / CONFIG.world.tileSize
  }
}