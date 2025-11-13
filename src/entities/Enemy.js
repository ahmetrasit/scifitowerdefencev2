/**
 * Enemy - Basic enemy (placeholder for now)
 */
class Enemy extends Entity {
    constructor(position) {
        super(position);

        this.maxHealth = 30;
        this.health = 30;
        this.speed = 20.0;
        this.size = 0.8;
        this.damage = 5;

        this.velocity = new Vector2(0, 0);
    }

    update(deltaTime) {
        // Simple movement towards player for now
        if (game.state.player) {
            const direction = game.state.player.position.subtract(this.position).normalized();
            this.velocity = direction.multiply(this.speed);
            this.position = this.position.add(this.velocity.multiply(deltaTime));
            this.rotation = direction.angle();

            // Simple collision with player (accounting for both sizes)
            const distanceToPlayer = this.position.distanceTo(game.state.player.position);
            const collisionDistance = this.size + game.state.player.size;
            if (distanceToPlayer < collisionDistance) {
                game.state.player.takeDamage(this.damage * deltaTime);
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
        // Draw enemy as a circle
        renderer.drawCircle(this.position, this.size, Color.RED, true);
        renderer.drawCircle(this.position, this.size, Color.WHITE, false);

        // Draw health bar
        if (this.health < this.maxHealth) {
            const healthPercent = this.health / this.maxHealth;
            renderer.drawHealthBar(this.position, 1.5, 0.2, healthPercent, 1.2);
        }

        // Draw direction indicator
        const dirEnd = this.position.add(Vector2.fromAngle(this.rotation, this.size * 1.5));
        renderer.drawLine(this.position, dirEnd, Color.YELLOW, 2);
    }
}
