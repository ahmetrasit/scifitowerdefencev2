/**
 * Player - Player character
 */
class Player extends Entity {
    constructor(position) {
        super(position);

        this.maxHealth = 100;
        this.health = 100;
        this.speed = 50.0;
        this.size = 7.5;  // 3x larger (was 2.5)

        this.velocity = new Vector2(0, 0);

        // Shooting (base stats)
        this.baseFireRate = 5.0;
        this.baseDamage = 10;
        this.baseRange = 90.0;
        this.baseProjectileSpeed = 200.0;

        // Current stats (can be modified by mounting)
        this.fireRate = this.baseFireRate;
        this.damage = this.baseDamage;
        this.range = this.baseRange;
        this.projectileSpeed = this.baseProjectileSpeed;
        this.lastFireTime = 0;

        // Mounting system
        this.isMounted = false;
        this.mountedBuilding = null;
        this.mountRange = 20.0; // Distance to mount
    }

    update(deltaTime, input) {
        // Update last fire time
        this.lastFireTime += deltaTime;

        // Check for mounting/dismounting
        this.updateMounting(input);

        // Movement (only if not mounted)
        if (!this.isMounted) {
            this.updateMovement(deltaTime, input);
        } else {
            // When mounted, stay at building position
            this.velocity.x = 0;
            this.velocity.y = 0;
            if (this.mountedBuilding) {
                this.position = this.mountedBuilding.position.clone();
            }
        }

        // Rotation (aim at mouse)
        this.updateRotation(input);

        // Shooting
        this.updateShooting(deltaTime, input);
    }

    updateMounting(input) {
        // Check for E key to mount/dismount
        if (input.isKeyJustPressed(Keys.E)) {
            if (this.isMounted) {
                this.dismount();
            } else {
                this.tryMount();
            }
        }
    }

    tryMount() {
        // Check if near Core building
        if (game.state.coreBuilding) {
            const distance = this.position.distanceTo(game.state.coreBuilding.position);
            if (distance <= this.mountRange + game.state.coreBuilding.size) {
                this.mount(game.state.coreBuilding);
            }
        }
    }

    mount(building) {
        this.isMounted = true;
        this.mountedBuilding = building;

        // Enhanced stats when mounted on Core - Cannon mode
        if (building.isCore) {
            this.fireRate = this.baseFireRate * 0.4;      // Slower fire rate (40% of normal)
            this.damage = this.baseDamage * 5.0;          // 5x damage
            this.range = this.baseRange * 2.5;            // 2.5x range
            this.projectileSpeed = this.baseProjectileSpeed * 0.7;  // Slower projectile speed
        }

        console.log(`Mounted ${building.constructor.name}! CANNON MODE: ${this.damage} damage, ${this.fireRate.toFixed(1)} fire rate, ${this.range} range`);
    }

    dismount() {
        console.log(`Dismounted from ${this.mountedBuilding.constructor.name}`);

        this.isMounted = false;
        this.mountedBuilding = null;

        // Restore base stats
        this.fireRate = this.baseFireRate;
        this.damage = this.baseDamage;
        this.range = this.baseRange;
        this.projectileSpeed = this.baseProjectileSpeed;
    }

    updateMovement(deltaTime, input) {
        const inputDir = new Vector2(0, 0);

        if (input.isKeyPressed(Keys.W)) inputDir.y -= 1;
        if (input.isKeyPressed(Keys.S)) inputDir.y += 1;
        if (input.isKeyPressed(Keys.A)) inputDir.x -= 1;
        if (input.isKeyPressed(Keys.D)) inputDir.x += 1;

        if (inputDir.lengthSquared() > 0) {
            this.velocity = inputDir.normalized().multiply(this.speed);
        } else {
            // Explicitly set to zero - no drift
            this.velocity.x = 0;
            this.velocity.y = 0;
        }

        // Only update position if velocity is non-zero
        if (this.velocity.lengthSquared() > 0.01) {
            this.position = this.position.add(this.velocity.multiply(deltaTime));
        }
    }

    updateRotation(input) {
        const mousePos = input.getMouseWorldPosition();
        const direction = mousePos.subtract(this.position);
        this.rotation = direction.angle();
    }

    updateShooting(deltaTime, input) {
        const cooldown = 1.0 / this.fireRate;

        if (input.isMouseButtonPressed(MouseButtons.LEFT) && this.lastFireTime >= cooldown) {
            this.fire();
            this.lastFireTime = 0;
        }
    }

    fire() {
        const direction = Vector2.fromAngle(this.rotation);
        const spawnPos = this.position.add(direction.multiply(this.size + 0.5));

        let projectile;

        // When mounted on Core, fire powerful cannon shots with splash damage
        if (this.isMounted && this.mountedBuilding && this.mountedBuilding.isCore) {
            projectile = new CannonShot(
                spawnPos,
                direction,
                this.projectileSpeed,
                this.damage,
                this.range,
                'player',
                20.0  // Splash radius
            );
        } else {
            // Normal bullets
            projectile = new Projectile(
                spawnPos,
                direction,
                this.projectileSpeed,
                this.damage,
                this.range,
                'player'
            );
        }

        game.state.projectiles.push(projectile);
    }

    takeDamage(amount) {
        this.health -= amount;

        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }

    die() {
        console.log('Player died!');
        game.state.gameActive = false;
    }

    render(renderer) {
        // Only render player if not mounted (when mounted, Core will show we're there)
        if (this.isMounted) {
            // Show we're mounted by drawing a pulsing indicator on the building
            if (this.mountedBuilding) {
                const pulseSize = 5.0 + Math.sin(Date.now() / 200) * 2.0;
                renderer.drawCircle(this.mountedBuilding.position, pulseSize, Color.YELLOW, false);
            }
            return;
        }

        // Draw player as a triangle pointing in rotation direction
        const size = this.size;
        const points = [
            this.position.add(Vector2.fromAngle(this.rotation, size * 1.5)),
            this.position.add(Vector2.fromAngle(this.rotation + Math.PI * 0.75, size)),
            this.position.add(Vector2.fromAngle(this.rotation - Math.PI * 0.75, size))
        ];

        // Draw bright cyan fill
        renderer.drawPolygon(points, Color.NEON_CYAN, true);

        // Draw darker cyan outline
        const outlineColor = new Color(0, 200, 200);
        renderer.drawPolygon(points, outlineColor, false);

        // Draw health bar if damaged
        if (this.health < this.maxHealth) {
            const healthPercent = this.health / this.maxHealth;
            renderer.drawHealthBar(this.position, 9.0, 1.0, healthPercent, 8.0);
        }

        // Draw weapon barrel in cyan
        const barrelLength = size * 1.2;
        const barrelEnd = this.position.add(Vector2.fromAngle(this.rotation, barrelLength));
        renderer.drawLine(this.position, barrelEnd, Color.NEON_CYAN, 6);

        // Show mount hint if near Core
        if (game.state.coreBuilding) {
            const distance = this.position.distanceTo(game.state.coreBuilding.position);
            if (distance <= this.mountRange + game.state.coreBuilding.size) {
                // Draw prompt above player
                renderer.drawText(
                    'Press E to Mount',
                    this.position.add(new Vector2(0, -size - 5)),
                    Color.YELLOW,
                    14
                );

                // Draw connection line to Core
                renderer.drawLine(this.position, game.state.coreBuilding.position, Color.YELLOW, 2);
            }
        }
    }

    // Helper to check if player can mount
    canMount() {
        if (this.isMounted) return false;
        if (!game.state.coreBuilding) return false;

        const distance = this.position.distanceTo(game.state.coreBuilding.position);
        return distance <= this.mountRange + game.state.coreBuilding.size;
    }
}
