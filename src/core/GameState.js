/**
 * GameState - Holds all game state data
 */
class GameState {
    constructor() {
        this.gameActive = true;
        this.currentWave = 0;
        this.isPaused = false;

        // Player reference
        this.player = null;

        // Core building reference
        this.coreBuilding = null;

        // Entity collections
        this.enemies = [];
        this.buildings = [];
        this.projectiles = [];
        this.collectors = [];
        this.miners = [];
        this.resourcePickups = [];
        this.effects = [];

        // Statistics
        this.stats = {
            enemiesKilled: 0,
            wavesCompleted: 0,
            buildingsBuilt: 0,
            researchCompleted: 0,
            bossesKilled: 0,
            resourcesGathered: 0,
            damageDealt: 0,
            playtime: 0
        };
    }

    // Add entity to appropriate collection
    addEntity(entity) {
        if (entity instanceof Player) {
            this.player = entity;
        } else if (entity instanceof Enemy) {
            this.enemies.push(entity);
        } else if (entity instanceof Building) {
            this.buildings.push(entity);
        } else if (entity instanceof Projectile) {
            this.projectiles.push(entity);
        }
    }

    // Remove entity from collection
    removeEntity(entity) {
        if (entity instanceof Enemy) {
            const index = this.enemies.indexOf(entity);
            if (index >= 0) this.enemies.splice(index, 1);
        } else if (entity instanceof Building) {
            const index = this.buildings.indexOf(entity);
            if (index >= 0) this.buildings.splice(index, 1);
        } else if (entity instanceof Projectile) {
            const index = this.projectiles.indexOf(entity);
            if (index >= 0) this.projectiles.splice(index, 1);
        }
    }

    // Clear all entities
    clearEntities() {
        this.enemies = [];
        this.buildings = [];
        this.projectiles = [];
        this.collectors = [];
        this.miners = [];
        this.resourcePickups = [];
        this.effects = [];
    }

    // Get all entities
    getAllEntities() {
        const entities = [];

        if (this.player) entities.push(this.player);

        entities.push(...this.enemies);
        entities.push(...this.buildings);
        entities.push(...this.projectiles);
        entities.push(...this.collectors);
        entities.push(...this.miners);

        return entities;
    }
}
