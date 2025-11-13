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

        // Shooting
        this.fireRate = 5.0; // Shots per second
        this.lastFireTime = 0;
        this.projectileSpeed = 200.0;
        this.damage = 10;
        this.range = 90.0;  // 3x larger (was 30.0)
    }

    update(deltaTime, input) {
        // Update last fire time
        this.lastFireTime += deltaTime;

        // Movement
        this.updateMovement(deltaTime, input);

        // Rotation (aim at mouse)
        this.updateRotation(input);

        // Shooting
        this.updateShooting(deltaTime, input);
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

        const projectile = new Projectile(
            spawnPos,
            direction,
            this.projectileSpeed,
            this.damage,
            this.range,
            'player'
        );

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
    }
}
