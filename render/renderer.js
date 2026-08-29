import { renderEntities } from "./entityRenderer.js";
import { renderTiles } from "./tileRenderer.js";
import { renderHover } from "./hoverRenderer.js";

export function render(ctx, world, entityManager, camera, mouse, activeBrush, tooltip, sim) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  renderTiles(ctx, world, camera);
  renderEntities(ctx, world, entityManager.entities, camera);
  renderHover(ctx, world, entityManager, camera, mouse, activeBrush, tooltip, sim);

  ctx.lineWidth = 1;
}