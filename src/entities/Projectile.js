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
        this.size = 0.6;  // Larger to match scaled entities
    }

    update(deltaTime) {
        if (this.isDestroyed) return;

        const movement = this.velocity.multiply(deltaTime);
        this.position = this.position.add(movement);
        this.distanceTraveled += movement.length();

        // Check collision
        this.checkCollisions();

        // Check range
        if (!this.isDestroyed && this.distanceTraveled >= this.maxRange) {
            this.destroy();
        }
    }

    checkCollisions() {
        if (this.isDestroyed) return;

        if (this.owner === 'player') {
            // Check hit on enemies - use simple for loop for safety
            for (let i = 0; i < game.state.enemies.length; i++) {
                const enemy = game.state.enemies[i];

                // Skip if enemy is already destroyed
                if (!enemy || enemy.isDestroyed) continue;

                if (this.isCollidingWith(enemy)) {
                    enemy.takeDamage(this.damage);
                    this.destroy();
                    return;
                }
            }
        }
    }

    isCollidingWith(entity) {
        const distance = entity.position.distanceTo(this.position);
        const combinedRadius = this.size + (entity.size || 0);
        return distance < combinedRadius;
    }

    render(renderer) {
        if (!this.position) return;

        // Draw projectile as a small circle
        renderer.drawCircle(this.position, this.size, Color.YELLOW, true);

        // Draw trail (with safety check)
        if (this.velocity && this.velocity.lengthSquared() > 0) {
            const trailDir = this.velocity.normalized();
            const trailStart = this.position.subtract(trailDir.multiply(1.5));
            renderer.drawLine(trailStart, this.position, Color.ORANGE, 4);
        }
    }
}
