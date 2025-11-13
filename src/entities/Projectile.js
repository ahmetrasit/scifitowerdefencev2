/**
 * Projectile - Bullet/projectile
 */
class Projectile extends Entity {
    constructor(position, direction, speed, damage, maxRange, owner) {
        super(position);

        this.velocity = direction.normalized().multiply(speed);
        this.damage = damage;
        this.maxRange = maxRange;
        this.distanceTraveled = 0;
        this.owner = owner; // 'player' or 'enemy'

        this.rotation = direction.angle();
        this.size = 0.2;
    }

    update(deltaTime) {
        const movement = this.velocity.multiply(deltaTime);
        this.position = this.position.add(movement);
        this.distanceTraveled += movement.length();

        // Check collision
        this.checkCollisions();

        // Check range
        if (this.distanceTraveled >= this.maxRange) {
            this.destroy();
            game.state.removeEntity(this);
        }
    }

    checkCollisions() {
        if (this.owner === 'player') {
            // Check hit on enemies
            for (const enemy of game.state.enemies) {
                if (this.isCollidingWith(enemy)) {
                    enemy.takeDamage(this.damage);
                    this.destroy();
                    game.state.removeEntity(this);
                    return;
                }
            }
        }
    }

    isCollidingWith(entity) {
        const hitRadius = 0.5;
        const distance = entity.position.distanceTo(this.position);
        return distance < hitRadius + (entity.size || 0);
    }

    render(renderer) {
        // Draw projectile as a small circle
        renderer.drawCircle(this.position, this.size, Color.YELLOW, true);

        // Draw trail
        const trailStart = this.position.subtract(this.velocity.normalized().multiply(0.5));
        renderer.drawLine(trailStart, this.position, Color.ORANGE, 2);
    }
}
