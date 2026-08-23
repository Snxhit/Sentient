export class Entity {
  constructor(x, y, config = {}) {
    this.x = x;
    this.y = y;
    this.vx = config.vx ?? 0;
    this.vy = config.vy ?? 0;
    this.moveDir = config.moveDir ?? 0;
    this.moveTime = config.moveTime ?? 0;
    this.onGround = config.onGround ?? false;
    this.width = config.width ?? 1;
    this.height = config.height ?? 1;
    this.color = config.color ?? "#ffffff";
    this.bcolor = config.bcolor ?? "#000000";
    this.isAlive = true;
  }
  
  simulate() {}
}