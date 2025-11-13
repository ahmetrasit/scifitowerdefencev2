/**
 * GameManager - Main game controller
 */
class GameManager {
    constructor(canvas) {
        this.canvas = canvas;

        // Initialize core systems
        this.camera = new Camera(canvas.width, canvas.height);
        this.renderer = new Renderer(canvas, this.camera);
        this.input = new Input(canvas);

        // Game systems
        this.resourceManager = new ResourceManager();
        this.state = new GameState();
        this.grid = new Grid(200, 200, 20.0);  // 10x larger tiles (was 2.0)

        // Managers (will be initialized later)
        this.waveManager = null;
        this.powerManager = null;
        this.buildingPlacementSystem = null;

        // Timing
        this.lastFrameTime = performance.now();
        this.deltaTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;

        // Debug
        this.showDebug = true;
        this.showGrid = false;

        console.log('GameManager initialized');
    }

    initialize() {
        console.log('Initializing game...');

        // Create player at origin
        this.state.player = new Player(new Vector2(0, 0));

        // Initialize managers (placeholder until we implement them)
        // this.waveManager = new WaveManager();
        // this.powerManager = new PowerManager();
        // this.buildingPlacementSystem = new BuildingPlacementSystem();

        console.log('Game initialized successfully');
    }

    update(currentTime) {
        // Calculate delta time
        this.deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;

        // Cap delta time to prevent huge jumps
        this.deltaTime = Math.min(this.deltaTime, 0.1);

        // Update FPS counter
        this.frameCount++;
        this.fpsUpdateTime += this.deltaTime;
        if (this.fpsUpdateTime >= 1.0) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = 0;
        }

        // Check for pause
        if (this.input.isKeyJustPressed(Keys.ESC)) {
            this.state.isPaused = !this.state.isPaused;
        }

        // Toggle debug
        if (this.input.isKeyJustPressed(Keys.TAB)) {
            this.showDebug = !this.showDebug;
        }

        // Toggle grid
        if (this.input.isKeyJustPressed('KeyG')) {
            this.showGrid = !this.showGrid;
        }

        if (this.state.isPaused) {
            return;
        }

        // Update mouse world position for input
        const mouseScreenPos = this.input.getMousePosition();
        const mouseWorldPos = this.camera.screenToWorld(mouseScreenPos);
        this.input.setMouseWorldPosition(mouseWorldPos);

        // Update player
        if (this.state.player) {
            this.state.player.update(this.deltaTime, this.input);
        }

        // Update camera to follow player (tighter follow for less drift feeling)
        if (this.state.player) {
            this.camera.follow(this.state.player.position, 0.2);
        }

        // Update all enemies
        for (let i = this.state.enemies.length - 1; i >= 0; i--) {
            const enemy = this.state.enemies[i];
            enemy.update(this.deltaTime);
        }

        // Update all projectiles
        for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.state.projectiles[i];
            projectile.update(this.deltaTime);
        }

        // Update all buildings
        for (const building of this.state.buildings) {
            building.update(this.deltaTime);
        }

        // Update managers
        if (this.waveManager) {
            this.waveManager.update(this.deltaTime);
        }

        if (this.powerManager) {
            this.powerManager.update(this.deltaTime);
        }

        // Update stats
        this.state.stats.playtime += this.deltaTime;

        // Clear "just pressed" states at end of frame
        this.input.update();
    }

    render() {
        // Clear screen
        this.renderer.clear();

        // Begin drawing with camera
        this.renderer.begin();
        this.renderer.applyCamera();

        // Draw grid (if enabled)
        if (this.showGrid) {
            this.renderer.drawGrid(this.grid.tileSize);
        }

        // Draw all buildings
        for (const building of this.state.buildings) {
            building.render(this.renderer);
        }

        // Draw all enemies
        for (const enemy of this.state.enemies) {
            enemy.render(this.renderer);
        }

        // Draw all projectiles
        for (const projectile of this.state.projectiles) {
            projectile.render(this.renderer);
        }

        // Draw player
        if (this.state.player) {
            this.state.player.render(this.renderer);
        }

        this.renderer.end();

        // Draw UI
        this.renderUI();

        // Draw debug info
        if (this.showDebug) {
            this.renderDebug();
        }
    }

    renderUI() {
        // Render UI elements
        const padding = 10;
        let y = padding;

        // Health bar
        if (this.state.player) {
            const healthPercent = this.state.player.health / this.state.player.maxHealth;
            const barWidth = 200;
            const barHeight = 20;

            this.renderer.drawRectUI(new Vector2(padding, y), barWidth, barHeight, Color.DARK_GRAY, true);
            this.renderer.drawRectUI(new Vector2(padding, y), barWidth * healthPercent, barHeight, Color.healthColor(healthPercent), true);
            this.renderer.drawRectUI(new Vector2(padding, y), barWidth, barHeight, Color.WHITE, false);

            this.renderer.drawTextUI(
                `HP: ${this.state.player.health}/${this.state.player.maxHealth}`,
                new Vector2(padding + 5, y + 3),
                Color.WHITE,
                14
            );

            y += barHeight + padding;
        }

        // Wave info
        this.renderer.drawTextUI(
            `Wave: ${this.state.currentWave}`,
            new Vector2(padding, y),
            Color.WHITE,
            16
        );
        y += 20;

        // Enemy count
        this.renderer.drawTextUI(
            `Enemies: ${this.state.enemies.length}`,
            new Vector2(padding, y),
            Color.WHITE,
            14
        );
        y += 20;

        // Resources (key resources only)
        y += 10;
        this.renderer.drawTextUI(
            'Resources:',
            new Vector2(padding, y),
            Color.CYAN,
            14
        );
        y += 18;

        const keyResources = [
            ResourceType.SCRAP_METAL,
            ResourceType.METALLIC_PLATE,
            ResourceType.STEEL_PLATE,
            ResourceType.PROCESSING_UNIT
        ];

        for (const resourceType of keyResources) {
            const amount = this.resourceManager.getResourceAmount(resourceType);
            const name = this.resourceManager.getResourceShortName(resourceType);

            this.renderer.drawTextUI(
                `${name}: ${amount}`,
                new Vector2(padding, y),
                Color.WHITE,
                12
            );
            y += 16;
        }
    }

    renderDebug() {
        const padding = 10;
        const rightX = this.canvas.width - 200;
        let y = padding;

        this.renderer.drawTextUI(
            'DEBUG INFO',
            new Vector2(rightX, y),
            Color.YELLOW,
            14
        );
        y += 20;

        this.renderer.drawTextUI(
            `FPS: ${this.fps}`,
            new Vector2(rightX, y),
            Color.WHITE,
            12
        );
        y += 16;

        this.renderer.drawTextUI(
            `Delta: ${(this.deltaTime * 1000).toFixed(2)}ms`,
            new Vector2(rightX, y),
            Color.WHITE,
            12
        );
        y += 16;

        this.renderer.drawTextUI(
            `Cam: ${this.camera.position.x.toFixed(1)}, ${this.camera.position.y.toFixed(1)}`,
            new Vector2(rightX, y),
            Color.WHITE,
            12
        );
        y += 16;

        this.renderer.drawTextUI(
            `Zoom: ${this.camera.zoom.toFixed(2)}`,
            new Vector2(rightX, y),
            Color.WHITE,
            12
        );
        y += 16;

        if (this.state.player) {
            this.renderer.drawTextUI(
                `Player: ${this.state.player.position.x.toFixed(1)}, ${this.state.player.position.y.toFixed(1)}`,
                new Vector2(rightX, y),
                Color.WHITE,
                12
            );
            y += 16;
        }

        const mouseWorld = this.input.getMouseWorldPosition();
        this.renderer.drawTextUI(
            `Mouse: ${mouseWorld.x.toFixed(1)}, ${mouseWorld.y.toFixed(1)}`,
            new Vector2(rightX, y),
            Color.WHITE,
            12
        );
        y += 16;

        y += 10;
        this.renderer.drawTextUI(
            `Enemies: ${this.state.enemies.length}`,
            new Vector2(rightX, y),
            Color.WHITE,
            12
        );
        y += 16;

        this.renderer.drawTextUI(
            `Projectiles: ${this.state.projectiles.length}`,
            new Vector2(rightX, y),
            Color.WHITE,
            12
        );
        y += 16;

        this.renderer.drawTextUI(
            `Buildings: ${this.state.buildings.length}`,
            new Vector2(rightX, y),
            Color.WHITE,
            12
        );
        y += 16;

        // Controls
        y += 10;
        this.renderer.drawTextUI(
            'Controls:',
            new Vector2(rightX, y),
            Color.CYAN,
            12
        );
        y += 16;

        this.renderer.drawTextUI(
            'WASD: Move',
            new Vector2(rightX, y),
            Color.WHITE,
            10
        );
        y += 14;

        this.renderer.drawTextUI(
            'Mouse: Aim & Shoot',
            new Vector2(rightX, y),
            Color.WHITE,
            10
        );
        y += 14;

        this.renderer.drawTextUI(
            'TAB: Toggle Debug',
            new Vector2(rightX, y),
            Color.WHITE,
            10
        );
        y += 14;

        this.renderer.drawTextUI(
            'G: Toggle Grid',
            new Vector2(rightX, y),
            Color.WHITE,
            10
        );
        y += 14;

        this.renderer.drawTextUI(
            'ESC: Pause',
            new Vector2(rightX, y),
            Color.WHITE,
            10
        );
    }

    // Main game loop
    run() {
        const gameLoop = (currentTime) => {
            this.update(currentTime);
            this.render();
            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);
    }
}
