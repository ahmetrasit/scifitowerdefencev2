/**
 * Core - Main base building that enemies target
 * If the core is destroyed, the game is over
 */
class Core extends Building {
    constructor(position) {
        super(position);

        this.maxHealth = 1000;
        this.health = 1000;
        this.size = 15.0;  // Large building
        this.isCore = true;  // Flag for targeting priority
    }

    takeDamage(amount) {
        this.health -= amount;

        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }

    die() {
        console.log('Core destroyed! Game Over!');
        game.state.gameActive = false;
        // Remove from buildings array
        const index = game.state.buildings.indexOf(this);
        if (index >= 0) {
            game.state.buildings.splice(index, 1);
        }
    }

    render(renderer) {
        // Draw core as a large hexagon
        const size = this.size;
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            points.push(this.position.add(Vector2.fromAngle(angle, size)));
        }

        // Draw bright cyan fill
        renderer.drawPolygon(points, Color.NEON_CYAN, true);

        // Draw darker cyan outline
        const outlineColor = new Color(0, 200, 200);
        renderer.drawPolygon(points, outlineColor, false);

        // Draw pulsing core effect
        const glowSize = size * 0.6;
        renderer.drawGlow(this.position, glowSize, Color.NEON_CYAN, 0.3);

        // Draw health bar
        const healthPercent = this.health / this.maxHealth;
        renderer.drawHealthBar(this.position, size * 1.5, 2.0, healthPercent, size + 3);

        // Draw health text
        renderer.drawText(
            `${this.health}/${this.maxHealth}`,
            this.position.add(new Vector2(0, size + 8)),
            Color.WHITE,
            12
        );
    }
}
