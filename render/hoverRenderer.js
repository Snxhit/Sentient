import CONFIG from "../core/config.js";
import { getHoveredTile } from "./helpers.js";

export function renderHover(ctx, world, entityManager, camera, mouse, activeBrush, tooltip, sim) {
  if (!tooltip.isInSim) {
    tooltip.hide();
    return;
  }
  const hovered = getHoveredTile(world, camera, mouse);

  if (hovered) {
    const screenX = hovered.x * CONFIG.world.tileSize - camera.x;
    const screenY = hovered.y * CONFIG.world.tileSize - camera.y;

    ctx.lineWidth = 2;

    renderBrushBorders(ctx, world, tooltip, activeBrush, screenX, screenY);
    renderTooltip(mouse, entityManager, activeBrush, hovered, tooltip, sim);

  } else {
    tooltip.hide();
  }
}

function renderBrushBorders(ctx, world, tooltip, activeBrush, screenX, screenY) {
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
      tooltip.show();

      const rect = sim.getBoundingClientRect();

      tooltip.updateFrame(mouse.x, mouse.y, rect);

      const t = hovered.tile;
      const result = entityManager.getEntitiesAtTile(hovered.x, hovered.y);

      if (result.hasEntities) {
        const pEntity = result.list[0];
        const typeName = pEntity.constructor.name;
        tooltip.setEntityInfo(hovered.x, hovered.y, pEntity);
      } else {
        tooltip.setTileInfo(hovered.x, hovered.y, t);
      }
    } else {
      tooltip.hide();
    }
}