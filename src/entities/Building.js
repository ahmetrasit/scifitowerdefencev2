/**
 * Building - Base building class (placeholder)
 */
class Building extends Entity {
    constructor(position) {
        super(position);

        this.maxHealth = 100;
        this.health = 100;
        this.size = 1.5;
    }

    update(deltaTime) {
        // Buildings don't update by default
    }

    takeDamage(amount) {
        this.health -= amount;

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        game.state.removeEntity(this);
    }

    render(renderer) {
        // Draw building as a square
        renderer.drawRect(this.position, this.size * 2, this.size * 2, Color.BLUE, true);
        renderer.drawRect(this.position, this.size * 2, this.size * 2, Color.WHITE, false);

        // Draw health bar
        if (this.health < this.maxHealth) {
            const healthPercent = this.health / this.maxHealth;
            renderer.drawHealthBar(this.position, 2.0, 0.3, healthPercent, 1.8);
        }
    }
}
