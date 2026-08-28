import CONFIG from "../core/config.js";
import { getHoveredTile } from "./helpers.js";

export function renderHover(ctx, world, entityManager, camera, mouse, activeBrush, tooltip, sim) {
  const hovered = getHoveredTile(world, camera, mouse);

  if (hovered) {
    const screenX = hovered.x * CONFIG.world.tileSize - camera.x;
    const screenY = hovered.y * CONFIG.world.tileSize - camera.y;

    ctx.lineWidth = 2;

    renderBrushBorders(ctx, world, activeBrush, screenX, screenY);
    renderTooltip(mouse, entityManager, activeBrush, hovered, tooltip, sim);

  } else {
    tooltip.style.display = "none";
  }
}

function renderBrushBorders(ctx, world, activeBrush, screenX, screenY) {
    let hFactor = 1;
    if (activeBrush == "pointer") {
        ctx.strokeStyle = "yellow";
    } else if (activeBrush == "food") {
        ctx.strokeStyle = "green";
    } else if (activeBrush == "dirt") {
        ctx.strokeStyle = "#573a30";
    } else if (activeBrush == "water") {
        ctx.strokeStyle = "#0e87cc";
    } else if (activeBrush == "eraser") {
        ctx.strokeStyle = "black";
    } else if (activeBrush == "human") {
        ctx.strokeStyle = "#f5c6a5";
        ctx.lineWidth = 2;
        hFactor = 2;
    }
    ctx.strokeRect(screenX, screenY, CONFIG.world.tileSize, CONFIG.world.tileSize * hFactor);
}

function renderTooltip(mouse, entityManager, activeBrush, hovered, tooltip, sim) {
    if (activeBrush == "pointer") {
      tooltip.style.display = "block";

      const rect = sim.getBoundingClientRect();

      tooltip.style.left = rect.left + mouse.x + 5 + "px";
      tooltip.style.top = rect.top + mouse.y + 5 + "px";

      const t = hovered.tile;
      const result = entityManager.getEntitiesAtTile(hovered.x, hovered.y);

      if (result.hasEntities) {
        const pEntity = result.list[0];
        const typeName = pEntity.constructor.name;
        tooltip.innerHTML = `${typeName} at (${hovered.x}, ${hovered.y}) rn.<br>Health: ${pEntity.health}<br>Satiety: ${pEntity.satiety}`;
      } else {
        tooltip.innerHTML = `We at (${hovered.x}, ${hovered.y}) rn.`;
      }
    } else {
      tooltip.style.display = "none";
    }
}