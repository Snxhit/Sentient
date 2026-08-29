<div align="center">
  <h1>Sentient</h1>
  <img src="https://res.cloudinary.com/dp7g5aflo/image/upload/v1788014477/SentientBanner_bhxsuv.png">

  ![Time Tracking](https://img.shields.io/badge/Sentient-19h%207min-critical?logo=javascript&style=plastic)
  ![GitHub Stars](https://img.shields.io/github/stars/Snxhit/Sentient?style=plastic)
  ![GitHub Forks](https://img.shields.io/github/forks/Snxhit/Sentient?style=plastic)
  ![GitHub Issues](https://img.shields.io/github/issues/Snxhit/Sentient?style=plastic)

</div>

---

## Index

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Usage](#usage)
- [What I Learned](#what-i-learned)
- [About Me](#about-me)

---

## Overview

**Sentient** is a browser-based, 2D world simulator where you shape a living landscape and watch life thrive.

**Project Highlights**:

- Procedurally generated, noise-based terrain with gravity, and flowing water.
- Autonomous entities with needs.
- A brush-based editor to paint terrain, place resources, and spawn creatures in real time.
- Reactive hover tooltip and time controls to watch the world tick.

---

## Features

- Procedurally generated terrain using noise for natural-looking ground.
- Real-time simulation tick: food falls, water flows downward, and entities do something each tick.
- Life-like entities with health and satiety (hunger) that drain over time.
- Entities wander randomly and seek out nearby food by smell, walking toward it and eat it.
- Entities randomly make small sounds.
- Brush-based world editing to play god.
- Hover tooltip showing tile and entity details.
- Colored brush border preview for the active tool.
- WASD camera panning with O/P zoom, clamped to world bounds.
- Pause, play, and 2x speed simulation controls (plus spacebar toggle).
- **All of this done in vanilla Javascript!** (Though, noise library was used)

---

## Architecture

```
- main.js: Orchestrator of all the modules
- core/
  - config.js: Contains configuration for world, physics, entities, etc.
  - screenManager.js: Handles responsiveness of the canvas.
- world/
  - world.js: The tile grid, terrain/solidity/resource storage and lookups.
  - terrain.js: Procedural noise-based terrain generation.
  - collision.js: Grid collision detection for entities.
  - food.js: Nearest-food-tile search used by entity AI.
- entities/
  - entity.js: Entity class (position, physics state, size, colors).
  - entityManager.js: Spawning, simulating, and querying entities.
  - human.js: Human entity details and sim logic.
  - cat.js: Cat entity details and sim logic.
- input/
  - keyboard.js: Key tracking (WASD, Space, OP).
  - mouseManager.js: Mouse coordinate tracking over the canvas.
  - cameraSystem.js: Camera actions.
- render/
  - renderer.js: Orchestrator for rendering submodules.
  - tileRenderer.js: Renders the terrain grid and resources.
  - entityRenderer.js: Renders entities and their speech.
  - hoverRenderer.js: Brush borders and the hover tooltip.
  - tooltip.js: Tooltip class to handle tooltip updates.
  - helpers.js: Miscellaneous helper functions that didn't belong anywhere else.
```

---

## Usage

1. **Open** `index.html` in a browser (or serve the directory locally)
2. **Navigate** the world with `WASD`, and zoom with `O` / `P`.

3. **Select a brush** from the panel at the bottom to edit the world:
   - **Pointer**: inspect tiles and entities via the tooltip.
   - **Dirt/Water**: paint solid terrain.
   - **Eraser**: remove terrain and resources.
   - **Food**: place edible food.
   - **Spawn Human/Spawn Cat**: click to spawn creatures.

4. **Click** on the canvas to apply the active brush.

5. **Control the simulation** with the play, pause, and 2x speed buttons (or `Space` to pause/resume).

### Self-Hosting

Since the entire sim is made with HTML, CSS and Javascript, it can be run simply with `python3 -m http.server` after forking the repository to your desired directory.

---

## What I Learned

Building this project taught me quite a lot:

### Technical Skills

- **Real-time 2D rendering** with the HTML5 canvas API.
- **Procedural generation** using Perlin noise for terrain.
- **Entity AI basics**: state, wandering, path-seeking, and eating behavior.
- **Game Engine**: Gained a little insight into how rendering in real game engines works.

### Problem Solving

- Restructuring a single-file project to a modular codebase across rendering, input, world, and entities.
- Implementing and debugging a primtive AI behaviour system for entities.

### Personal

- Working on a small, focused project until it felt "alive".
- Managing scope and knowing when a feature was good enough.

---

## About Me

**Snxhit**<br>
I'm passionate about building interactive games and bringing simple worlds to life.<br>
**Sentient** is a playground for experimenting with procedural worlds and emergent entity behavior.

- GitHub: [@Snxhit](https://github.com/Snxhit)
- LinkedIn: [Snxhit](https://www.linkedin.com/in/snxhit/)
- Email: [developer@snxhit.me](mailto:developer@snxhit.me)

---

<div align="center">

  **Made with ❤️**

  If you found this project interesting, consider giving it a star :D
  
  [Report a Bug](https://github.com/Snxhit/Sentient/issues) or [Suggest a new Feature](https://github.com/Snxhit/Sentient/issues)
</div>