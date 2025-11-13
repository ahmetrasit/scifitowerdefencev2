/**
 * Enemy - Basic enemy (placeholder for now)
 */
class Enemy extends Entity {
    constructor(position) {
        super(position);

        this.maxHealth = 30;
        this.health = 30;
        this.speed = 20.0;
        this.size = 3.75;  // 2.5x larger (was 1.5)
        this.damage = 5;

        this.velocity = new Vector2(0, 0);

        console.log(`Enemy created at (${position.x.toFixed(1)}, ${position.y.toFixed(1)})`);
    }

    update(deltaTime) {
        // Simple movement towards player for now
        if (game.state.player) {
            const direction = game.state.player.position.subtract(this.position).normalized();
            this.velocity = direction.multiply(this.speed);
            this.position = this.position.add(this.velocity.multiply(deltaTime));
            this.rotation = direction.angle();

            // Check collision with other enemies (prevent piling up)
            this.separateFromOtherEnemies();

            // Simple collision with player (accounting for both sizes)
            const distanceToPlayer = this.position.distanceTo(game.state.player.position);
            const collisionDistance = this.size + game.state.player.size;
            if (distanceToPlayer < collisionDistance) {
                game.state.player.takeDamage(this.damage * deltaTime);
            }
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

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        game.state.stats.enemiesKilled++;
        game.state.removeEntity(this);

        // Drop resources
        game.resourceManager.addResource(ResourceType.SCRAP_METAL, Math.floor(Math.random() * 3) + 1);
    }

    render(renderer) {
        // Draw glow effect for visibility
        renderer.drawGlow(this.position, this.size * 2, Color.RED, 0.3);

        // Draw enemy as a circle
        renderer.drawCircle(this.position, this.size, Color.RED, true);

        // Brighter outline for better visibility
        const brightRed = new Color(255, 100, 100);
        renderer.drawCircle(this.position, this.size, brightRed, false);

        // Draw health bar
        if (this.health < this.maxHealth) {
            const healthPercent = this.health / this.maxHealth;
            renderer.drawHealthBar(this.position, 5.0, 0.6, healthPercent, 4.5);
        }

        // Draw direction indicator (pointing at player)
        const dirEnd = this.position.add(Vector2.fromAngle(this.rotation, this.size * 1.5));
        renderer.drawLine(this.position, dirEnd, Color.YELLOW, 4);
    }
}
