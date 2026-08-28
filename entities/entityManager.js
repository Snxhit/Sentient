export class EntityManager {
  constructor(world) {
    this.entities = [];
    this.world = world;
  }

  spawn(entityInstance) {
    this.entities.push(entityInstance);
    return entityInstance;
  }

  simulate() {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];

      if (!e.isAlive) {
        this.entities.splice(i, 1);
        continue;
      }

      e.simulate(this.world);
    }
  }

  getEntitiesByType(type) {
    return this.entities.filter(e => e instanceof type);
  }

  _isEntityAt(e, tx, ty) {
    const startX = Math.floor(e.x);
    const endX = Math.floor(e.x + (e.width));
    const startY = Math.floor(e.y);
    const endY = Math.floor(e.y + (e.height));

    return tx >= startX && tx < endX && ty >= startY && ty < endY;
  }

  getEntitiesAtTile(tx, ty) {
    const found = this.entities.filter(e => this._isEntityAt(e, tx, ty));

    return {
      hasEntities: found.length > 0,
      list: found,
    };
  }

  getEntityTypeAtTile(tx, ty, type) {
    const found = this.entities.filter(e => e instanceof type && this._isEntityAt(e, tx, ty));

    return {
      hasEntities: found.length > 0,
      list: found,
    };
  }
}