function isSolid(world, x, y) {
  if (x < 0 || y < 0 || x >= world.width || y >= world.height) {
    return true;
  }
  return world.getTile(Math.floor(x), Math.floor(y)).solid;
}

export function collidesAt(world, x, y, width, height) {
  // ts for world boundaries, need fix this, doesnt take width into account
  if (x < 0) {
    return true;
  }
  const left = Math.floor(x);
  const right = Math.floor(x + width - 1e-6);
  const top = Math.floor(y);
  const bottom = Math.floor(y + height - 1e-6);

  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      if (isSolid(world, tx, ty)) {
        return true;
      }
    }
  }

  return false;
}
