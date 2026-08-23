import { getHoveredTile, getHumanTile } from "./helpers.js";

export function renderHover(ctx, world, entityManager, camera, mouse, activeBrush, tooltip, sim) {
  const hovered = getHoveredTile(world, mouse);

  if (hovered) {
    const screenX = hovered.x * world.tileSize - camera.x;
    const screenY = hovered.y * world.tileSize - camera.y;

    ctx.lineWidth = 2;

    renderBrushBorders(ctx, world, activeBrush, screenX, screenY);
    renderTooltip(mouse, entityManager, activeBrush, hovered, tooltip, sim);

  } else {
    tooltip.style.display = "none";
  }
}

function renderBrushBorders(ctx, world, activeBrush, screenX, screenY) {
    if (activeBrush == "pointer") {
        ctx.strokeStyle = "yellow";
        ctx.strokeRect(screenX, screenY, world.tileSize, world.tileSize);
    } else if (activeBrush == "food") {
        ctx.strokeStyle = "green";
        ctx.strokeRect(screenX, screenY, world.tileSize, world.tileSize);
    } else if (activeBrush == "dirt") {
        ctx.strokeStyle = "#573a30";
        ctx.strokeRect(screenX, screenY, world.tileSize, world.tileSize);
    } else if (activeBrush == "eraser") {
        ctx.strokeStyle = "black";
        ctx.strokeRect(screenX, screenY, world.tileSize, world.tileSize);
    } else if (activeBrush == "human") {
        ctx.strokeStyle = "#f5c6a5";
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, world.tileSize, world.tileSize * 2);
    }
}

function renderTooltip(mouse, entityManager, activeBrush, hovered, tooltip, sim) {
    if (activeBrush == "pointer") {
      tooltip.style.display = "block";

      const rect = sim.getBoundingClientRect();

      tooltip.style.left = rect.left + mouse.x + 5 + "px";
      tooltip.style.top = rect.top + mouse.y + 5 + "px";

      const t = hovered.tile;
      const h = getHumanTile(hovered.x, hovered.y, entityManager);

      if (h) {
        tooltip.innerHTML = `Human at (${hovered.x}, ${hovered.y}) rn.<br>Health: ${h.health}<br>Satiety: ${h.satiety}`;
      } else {
        tooltip.innerHTML = `We at (${hovered.x}, ${hovered.y}) rn.`;
      }
    } else {
      tooltip.style.display = "none";
    }
}