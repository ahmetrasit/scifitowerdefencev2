/**
 * Enemy - Enemy units with pathfinding and AI
 */

// Enemy state machine
const EnemyState = {
    MOVING: 'moving',
    ATTACKING: 'attacking'
};

// Enemy database with stats for each type
const EnemyDatabase = {
    [EnemyType.SWARMER]: {
        maxHealth: 30,
        speed: 25.0,
        damage: 5,
        size: 2.5,
        color: new Color(255, 50, 50),      // Red
        attackRange: 2.0,
        attackCooldown: 1.0
    },
    [EnemyType.TANK]: {
        maxHealth: 100,
        speed: 15.0,
        damage: 15,
        size: 5.0,
        color: new Color(100, 100, 100),    // Gray
        attackRange: 2.5,
        attackCooldown: 2.0
    },
    [EnemyType.RUNNER]: {
        maxHealth: 20,
        speed: 40.0,
        damage: 8,
        size: 2.0,
        color: new Color(255, 200, 50),     // Orange
        attackRange: 1.5,
        attackCooldown: 0.8
    },
    [EnemyType.SUPPORT]: {
        maxHealth: 40,
        speed: 20.0,
        damage: 3,
        size: 3.0,
        color: new Color(150, 50, 255),     // Purple
        attackRange: 2.0,
        attackCooldown: 1.5
    },
    [EnemyType.BOSS]: {
        maxHealth: 500,
        speed: 18.0,
        damage: 30,
        size: 10.0,
        color: new Color(255, 0, 255),      // Magenta
        attackRange: 4.0,
        attackCooldown: 1.5
    }
};

class Enemy extends Entity {
    constructor(type, position) {
        super(position);

        this.type = type || EnemyType.SWARMER;
        this.loadStats();

        this.health = this.maxHealth;
        this.velocity = new Vector2(0, 0);
        this.state = EnemyState.MOVING;

        // Target and pathfinding
        this.currentTarget = null;
        this.path = [];
        this.pathIndex = 0;
        this.pathRecalculateTimer = 0;
        this.pathRecalculateInterval = 2.0; // Recalculate path every 2 seconds

        // Combat
        this.lastAttackTime = 0;

        console.log(`${this.type} enemy created at (${position.x.toFixed(1)}, ${position.y.toFixed(1)})`);
    }

    loadStats() {
        const data = EnemyDatabase[this.type];
        if (!data) {
            console.error(`Unknown enemy type: ${this.type}`);
            return;
        }

        this.maxHealth = data.maxHealth;
        this.speed = data.speed;
        this.damage = data.damage;
        this.size = data.size;
        this.color = data.color;
        this.attackRange = data.attackRange;
        this.attackCooldown = data.attackCooldown;
    }

    update(deltaTime) {
        this.lastAttackTime += deltaTime;
        this.pathRecalculateTimer += deltaTime;

        switch (this.state) {
            case EnemyState.MOVING:
                this.updateMoving(deltaTime);
                break;
            case EnemyState.ATTACKING:
                this.updateAttacking(deltaTime);
                break;
        }
    }

    updateMoving(deltaTime) {
        // Select target if none
        if (this.currentTarget == null || this.currentTarget.health <= 0) {
            this.selectNewTarget();
        }

        // Calculate path if needed
        if (this.path.length === 0 || this.pathRecalculateTimer >= this.pathRecalculateInterval) {
            this.calculatePathToTarget();
            this.pathRecalculateTimer = 0;
        }

        // Follow path
        if (this.path.length > 0) {
            this.followPath(deltaTime);
        }

        // Check if in attack range
        if (this.currentTarget != null) {
            const distanceToTarget = this.position.distanceTo(this.currentTarget.position);

            if (distanceToTarget <= this.attackRange + this.currentTarget.size) {
                this.state = EnemyState.ATTACKING;
                this.velocity = new Vector2(0, 0);
            }
        }

        // Separate from other enemies
        this.separateFromOtherEnemies();
    }

    updateAttacking(deltaTime) {
        // Check if target still valid
        if (this.currentTarget == null || this.currentTarget.health <= 0) {
            this.state = EnemyState.MOVING;
            this.selectNewTarget();
            return;
        }

        // Check if still in range
        const distanceToTarget = this.position.distanceTo(this.currentTarget.position);
        if (distanceToTarget > this.attackRange + this.currentTarget.size) {
            this.state = EnemyState.MOVING;
            return;
        }

        // Face target
        const direction = this.currentTarget.position.subtract(this.position);
        this.rotation = direction.angle();

        // Attack
        if (this.lastAttackTime >= this.attackCooldown) {
            this.attack();
            this.lastAttackTime = 0;
        }
    }

    selectNewTarget() {
        // Priority: Core building first, then other buildings, then player
        if (game.state.coreBuilding && game.state.coreBuilding.health > 0) {
            this.currentTarget = game.state.coreBuilding;
            return;
        }

        // Find closest building
        let closestBuilding = null;
        let closestDistance = Infinity;

        for (const building of game.state.buildings) {
            if (building.health <= 0) continue;

            const distance = this.position.distanceTo(building.position);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestBuilding = building;
            }
        }

        if (closestBuilding) {
            this.currentTarget = closestBuilding;
            return;
        }

        // Fallback to player
        if (game.state.player) {
            this.currentTarget = game.state.player;
        }
    }

    calculatePathToTarget() {
        if (this.currentTarget == null) return;

        const startGrid = game.grid.worldToGrid(this.position);
        const endGrid = game.grid.worldToGrid(this.currentTarget.position);

        this.path = PathfindingSystem.findPath(startGrid, endGrid, game.grid);
        this.pathIndex = 0;

        // If no path found, move directly towards target
        if (this.path.length === 0) {
            this.path = [this.currentTarget.position];
        }
    }

    followPath(deltaTime) {
        if (this.pathIndex >= this.path.length) {
            this.path = [];
            return;
        }

        const targetPos = this.path[this.pathIndex];
        const direction = targetPos.subtract(this.position).normalized();

        this.velocity = direction.multiply(this.speed);
        this.position = this.position.add(this.velocity.multiply(deltaTime));

        // Check if reached waypoint
        const distanceToWaypoint = this.position.distanceTo(targetPos);
        if (distanceToWaypoint < 2.0) {
            this.pathIndex++;
        }

        // Update rotation
        this.rotation = direction.angle();
    }

    attack() {
        if (this.currentTarget != null && this.currentTarget.health > 0) {
            this.currentTarget.takeDamage(this.damage);
            console.log(`${this.type} attacked ${this.currentTarget.constructor.name} for ${this.damage} damage`);
        }
    }

    separateFromOtherEnemies() {
        // Push away from other enemies to prevent stacking
        for (const other of game.state.enemies) {
            if (other === this) continue;

            const distance = this.position.distanceTo(other.position);
            const minDistance = this.size + other.size;

            if (distance < minDistance && distance > 0.1) {
                // Push away from each other
                const pushDirection = this.position.subtract(other.position).normalized();
                const pushAmount = (minDistance - distance) * 0.5;
                this.position = this.position.add(pushDirection.multiply(pushAmount));
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount;

        game.state.stats.damageDealt += amount;

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        // Update stats
        game.state.stats.enemiesKilled++;

        if (this.type === EnemyType.BOSS) {
            game.state.stats.bossesKilled++;
        }

        // Notify wave manager
        if (game.waveManager) {
            game.waveManager.enemyKilled();
        }

        // Drop resources based on enemy type
        let resourceDrop = 1;
        if (this.type === EnemyType.TANK) resourceDrop = 3;
        else if (this.type === EnemyType.BOSS) resourceDrop = 20;
        else if (this.type === EnemyType.SUPPORT) resourceDrop = 2;

        game.resourceManager.addResource(ResourceType.SCRAP_METAL, resourceDrop);
        game.state.stats.resourcesGathered += resourceDrop;

        // Remove from game
        game.state.removeEntity(this);

        console.log(`${this.type} enemy died. Dropped ${resourceDrop} scrap metal`);
    }

    render(renderer) {
        // Draw glow effect for visibility
        renderer.drawGlow(this.position, this.size * 2, this.color, 0.3);

        // Draw enemy as a circle
        renderer.drawCircle(this.position, this.size, this.color, true);

        // Brighter outline
        const brightColor = new Color(
            Math.min(255, this.color.r + 50),
            Math.min(255, this.color.g + 50),
            Math.min(255, this.color.b + 50)
        );
        renderer.drawCircle(this.position, this.size, brightColor, false);

        // Draw health bar
        if (this.health < this.maxHealth) {
            const healthPercent = this.health / this.maxHealth;
            const barWidth = this.size * 1.5;
            renderer.drawHealthBar(this.position, barWidth, 0.6, healthPercent, this.size + 1);
        }

        // Draw direction indicator
        const dirEnd = this.position.add(Vector2.fromAngle(this.rotation, this.size * 1.2));
        renderer.drawLine(this.position, dirEnd, Color.YELLOW, 3);

        // Draw path (debug - only for first few enemies)
        if (game.showDebug && game.state.enemies.indexOf(this) < 3 && this.path.length > 0) {
            for (let i = this.pathIndex; i < Math.min(this.pathIndex + 5, this.path.length); i++) {
                renderer.drawCircle(this.path[i], 0.5, Color.YELLOW, true);
            }
        }
    }
}
