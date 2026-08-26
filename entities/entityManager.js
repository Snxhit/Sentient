export class EntityManager {
  constructor() {
    this.entities = [];
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

      e.simulate(world);
    }
  }

  getEntitiesByType(type) {
    return this.entities.filter(e => e instanceof type);
  }
}