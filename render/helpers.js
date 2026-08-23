export function getHoveredTile(world, mouse) {
  const worldCoords = screenToWorld(mouse.x, mouse.y);

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

export function screenToWorld(world, camera, mx, my) {
  return {
    x: (mx + camera.x) / world.tileSize,
    y: (my + camera.y) / world.tileSize
  }
}

export function getHumanTile(tx, ty, entityManager) {
  return entityManager.getEntitiesByType(Human).find(h =>
    tx >= Math.floor(h.x) &&
    tx < Math.floor(h.x + h.width) &&
    ty >= Math.floor(h.y) &&
    ty < Math.floor(h.y + h.height)
  ) || null;
}