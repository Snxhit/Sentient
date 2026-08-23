import { Entity } from "./entity.js";
import { collidesAt } from "../world/collision.js";
import CONFIG from "../core/config.js";

export class Human extends Entity {
  constructor(x, y, config = {}) {
    super(x, y, {
      width: 1,
      height: 2,
      color: "#f5c6a5",
      bcolor: "#c49e82",
      ...config
    });

    this.health = config.health ?? 10;
    this.satiety = config.satiety ?? 100;
  }

  simulate(world) {
    if (this.satiety > 0) {
      this.satiety -= 4;
    } else if (this.satiety <= 0) {
      this.satiety = 0;
      if (this.health > 0) {
        this.health -= 1;
      } else {
        this.isAlive = false;
        this.health = 0;
      }
    }

    this.vy += CONFIG.physics.gravity;
    if (this.vy > CONFIG.physics.terminalVelocity) {
      this.vy = CONFIG.physics.terminalVelocity;
    }

    this.onGround = false;

    let remainingY = this.vy;

    while (Math.abs(remainingY) > 0) {
      const step = Math.sign(remainingY) * Math.min(Math.abs(remainingY), CONFIG.physics.maxStep);
      const nextY = this.y + step;

      if (collidesAt(world, this.x, nextY, this.width, this.height)) {
        if (step > 0) {
          const hitTileY = Math.floor(nextY + this.height - 1e-6);
          this.y = hitTileY - this.height;
          this.onGround = true;
        }
        this.vy = 0;
        break;
      }

      this.y = nextY;
      remainingY -= step;
    }

    if (this.onGround) {
      const foodTarget = findNearestFoodTile(this.x, this.y, CONFIG.entities.foodSmellRange);

      if (foodTarget) {
        const dx = foodTarget.x - this.x;
        if (Math.abs(dx) < 0.01) {
          this.moveDir = 0;
        } else {
          this.moveDir = dx > 0 ? 1 : -1;
        }

        const newX = this.x + this.moveDir;
        if (!collidesAt(world, newX, this.y, this.width, this.height)) {
          this.x += this.moveDir;
        } else if (!collidesAt(world, newX, this.y - 1, this.width, this.height)) {
          this.y -= 1;
          this.x += this.moveDir;
        }

        if (newX == foodTarget.x) {
          world.getTile(foodTarget.x, foodTarget.y).resource = null;
          this.satiety += 10;
        }
      } else {
        if (this.moveTime <= 0) {
          let r = Math.random();
          if (r < 0.33) {
            this.moveDir = -1;
          } else if (r < 0.66) {
            this.moveDir = 1;
          } else {
            this.moveDir = 0;
          }

          this.moveTime = Math.floor(Math.random() * 10) + 5;
        }

        let newX = this.x + this.moveDir;
        if (!collidesAt(world, newX, this.y, this.width, this.height)) {
          this.x += this.moveDir;
        } else if (!collidesAt(world, newX, this.y - 1, this.width, this.height)) {
          this.y -= 1;
          this.x += this.moveDir;
        }

        this.moveTime -= 1;
      }
    }
  }
}