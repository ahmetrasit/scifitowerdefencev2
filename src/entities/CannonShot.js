/**
 * CannonShot - Heavy cannon projectile with splash damage
 * Fired from mounted Core turret
 */
class CannonShot extends Projectile {
    constructor(position, direction, speed, damage, maxRange, owner, splashRadius = 15.0) {
        super(position, direction, speed, damage, maxRange, owner);

        this.splashRadius = splashRadius;
        this.splashDamage = damage * 0.5; // Splash does 50% of direct hit damage
        this.size = 2.0; // Larger than regular bullets
        this.isCannon = true;
    }

    checkCollisions() {
        if (this.isDestroyed) return;

        if (this.owner === 'player') {
            let hitEnemy = false;

            // Check direct hit on enemies
            for (let i = 0; i < game.state.enemies.length; i++) {
                const enemy = game.state.enemies[i];

                // Skip if enemy is already destroyed
                if (!enemy || enemy.isDestroyed) continue;

                if (this.isCollidingWith(enemy)) {
                    // Direct hit
                    enemy.takeDamage(this.damage);
                    hitEnemy = true;

                    // Apply splash damage to nearby enemies
                    this.applySplashDamage(this.position);

                    this.destroy();
                    return;
                }
            }

            // If we didn't hit an enemy directly, still check for proximity splash
            // (this allows cannon shots to miss but still do splash if close)
        }
    }

    applySplashDamage(epicenter) {
        // Apply splash damage to all enemies within splash radius
        for (let i = 0; i < game.state.enemies.length; i++) {
            const enemy = game.state.enemies[i];

            // Skip if enemy is already destroyed
            if (!enemy || enemy.isDestroyed) continue;

            const distance = enemy.position.distanceTo(epicenter);

            if (distance <= this.splashRadius) {
                // Calculate falloff - full damage at center, 0 at edge
                const falloff = 1.0 - (distance / this.splashRadius);
                const splashDmg = Math.floor(this.splashDamage * falloff);

                if (splashDmg > 0) {
                    enemy.takeDamage(splashDmg);
                }
            }
        }
    }

    render(renderer) {
        if (!this.position) return;

        // Draw cannon shot as a large orange circle with glow
        renderer.drawGlow(this.position, this.size * 3, Color.ORANGE, 0.4);
        renderer.drawCircle(this.position, this.size, Color.ORANGE, true);

        // Draw bright yellow core
        renderer.drawCircle(this.position, this.size * 0.5, Color.YELLOW, true);

        // Draw trail (thicker for cannon)
        if (this.velocity && this.velocity.lengthSquared() > 0) {
            const trailDir = this.velocity.normalized();
            const trailStart = this.position.subtract(trailDir.multiply(4.0));
            renderer.drawLine(trailStart, this.position, Color.ORANGE, 8);
        }
    }

    destroy() {
        // Create explosion effect before destroying
        this.createExplosion();
        super.destroy();
    }

    createExplosion() {
        // Visual explosion effect - spawn multiple particles
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const offset = Vector2.fromAngle(angle, this.splashRadius * 0.5);
            const particlePos = this.position.add(offset);

            // Draw explosion particles (these will be visible for one frame)
            // In a full implementation, these would be actual particle entities
        }

        // Draw explosion circle to show splash radius (visual feedback)
        if (game && game.renderer) {
            // This will only show for one frame, which is fine for visual feedback
            const explosionColor = new Color(255, 150, 0, 0.3);
            game.renderer.drawCircle(this.position, this.splashRadius, explosionColor, true);
            game.renderer.drawCircle(this.position, this.splashRadius, Color.ORANGE, false);
        }
    }
}
