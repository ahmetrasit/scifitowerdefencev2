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
        // Check if player is mounted
        const playerMounted = game.state.player && game.state.player.isMounted &&
                              game.state.player.mountedBuilding === this;

        // Draw core as a large hexagon
        const size = this.size;
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            points.push(this.position.add(Vector2.fromAngle(angle, size)));
        }

        // Draw bright cyan fill (brighter when manned)
        const fillColor = playerMounted ? new Color(0, 255, 255) : Color.NEON_CYAN;
        renderer.drawPolygon(points, fillColor, true);

        // Draw darker cyan outline
        const outlineColor = new Color(0, 200, 200);
        renderer.drawPolygon(points, outlineColor, false);

        // Draw pulsing core effect (more intense when manned)
        const glowSize = size * 0.6;
        const glowIntensity = playerMounted ? 0.5 : 0.3;
        renderer.drawGlow(this.position, glowSize, Color.NEON_CYAN, glowIntensity);

        // If player is mounted, show turret barrels
        if (playerMounted) {
            // Draw multiple turret barrels around the core
            const barrelCount = 8;
            for (let i = 0; i < barrelCount; i++) {
                const angle = (Math.PI * 2 / barrelCount) * i;
                const barrelStart = this.position.add(Vector2.fromAngle(angle, size * 0.7));
                const barrelEnd = this.position.add(Vector2.fromAngle(angle, size * 1.2));
                renderer.drawLine(barrelStart, barrelEnd, Color.YELLOW, 4);
            }

            // Draw main weapon pointing at mouse
            const barrelLength = size * 1.5;
            const barrelEnd = this.position.add(Vector2.fromAngle(game.state.player.rotation, barrelLength));
            renderer.drawLine(this.position, barrelEnd, Color.ORANGE, 8);

            // Draw "MANNED" indicator with controls
            renderer.drawText(
                'ARTILLERY MODE - E to Dismount',
                this.position.add(new Vector2(0, -size - 15)),
                Color.YELLOW,
                16
            );

            // Draw aiming controls
            renderer.drawText(
                'A/D or ← → to Aim | Click to Fire',
                this.position.add(new Vector2(0, -size - 30)),
                Color.ORANGE,
                14
            );
        }

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
