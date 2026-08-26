export function findNearestFoodTile(world, originX, originY, smellRange) {
  let closest = null;
  let closestDistSq = Infinity;

  const minX = Math.max(0, Math.floor(originX - smellRange));
  const maxX = Math.min(world.width - 1, Math.floor(originX + smellRange));
  const minY = Math.max(0, Math.floor(originY - smellRange));
  const maxY = Math.min(world.height - 1, Math.floor(originY + smellRange));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (world.getTile(x, y).resource !== "food") {
        continue;
      }

      const dx = x - originX;
      const dy = y - originY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= smellRange * smellRange && distSq < closestDistSq) {
        closest = { x, y };
        closestDistSq = distSq;
      }
    }
  }

  return closest;
}