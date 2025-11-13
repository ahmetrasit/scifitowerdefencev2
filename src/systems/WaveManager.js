/**
 * WaveManager - Manages enemy wave spawning and progression
 */

// Enemy type constants
const EnemyType = {
    SWARMER: 'swarmer',
    TANK: 'tank',
    RUNNER: 'runner',
    SUPPORT: 'support',
    BOSS: 'boss'
};

class WaveManager {
    constructor(gameManager) {
        this.game = gameManager;

        this.currentWave = 0;
        this.waveActive = false;
        this.timeBetweenWaves = 30.0; // 30 seconds between waves
        this.waveTimer = 0;

        this.enemiesRemainingInWave = 0;
        this.spawnedEnemies = 0;

        // Spawn points around the map (will be randomized)
        this.spawnPoints = [
            new Vector2(80, 0),      // Right
            new Vector2(-80, 0),     // Left
            new Vector2(0, 80),      // Bottom
            new Vector2(0, -80),     // Top
            new Vector2(60, 60),     // Bottom-right
            new Vector2(-60, 60),    // Bottom-left
            new Vector2(60, -60),    // Top-right
            new Vector2(-60, -60)    // Top-left
        ];

        // Delayed spawn queue
        this.spawnQueue = [];

        console.log('WaveManager initialized');
    }

    update(deltaTime) {
        if (!this.game.state.gameActive) {
            return;
        }

        // Process spawn queue
        this.processSpawnQueue(deltaTime);

        if (!this.waveActive) {
            // Countdown to next wave
            this.waveTimer += deltaTime;

            if (this.waveTimer >= this.timeBetweenWaves) {
                this.startNextWave();
            }
        } else {
            // Check if wave is complete
            if (this.enemiesRemainingInWave <= 0 &&
                this.game.state.enemies.length === 0 &&
                this.spawnQueue.length === 0) {
                this.completeWave();
            }
        }
    }

    startNextWave() {
        this.currentWave++;
        this.waveActive = true;
        this.waveTimer = 0;
        this.spawnedEnemies = 0;

        this.game.state.currentWave = this.currentWave;

        console.log(`\n=== Starting Wave ${this.currentWave} ===`);

        // Calculate wave composition
        const performanceScore = this.calculatePerformanceScore();
        const composition = this.calculateWaveComposition(this.currentWave, performanceScore);

        console.log('Wave composition:', composition);

        // Spawn enemies with delays
        this.spawnWave(composition);

        console.log(`Total enemies to spawn: ${this.enemiesRemainingInWave}`);
    }

    calculatePerformanceScore() {
        // Based on player resources, building count, tech unlocks
        let score = 1.0;

        // More buildings = player is stronger
        score += this.game.state.buildings.length * 0.01;

        // Clamp to reasonable range
        return Math.max(0.5, Math.min(3.0, score));
    }

    calculateWaveComposition(wave, performance) {
        const difficulty = wave * performance;

        const composition = {
            swarmers: Math.floor(15 + difficulty * 2),
            tanks: Math.floor(Math.max(0, difficulty - 5) * 0.5),
            runners: Math.floor(Math.max(0, difficulty - 10) * 0.3),
            supports: Math.floor(Math.max(0, difficulty - 15) * 0.2),
            boss: (wave % 10 === 0) ? 1 : 0
        };

        return composition;
    }

    spawnWave(composition) {
        this.enemiesRemainingInWave = 0;
        this.spawnQueue = [];

        // Spawn swarmers
        for (let i = 0; i < composition.swarmers; i++) {
            this.queueSpawn(EnemyType.SWARMER, i * 0.5);
        }

        // Spawn tanks
        for (let i = 0; i < composition.tanks; i++) {
            this.queueSpawn(EnemyType.TANK, i * 2.0);
        }

        // Spawn runners
        for (let i = 0; i < composition.runners; i++) {
            this.queueSpawn(EnemyType.RUNNER, i * 1.5);
        }

        // Spawn supports
        for (let i = 0; i < composition.supports; i++) {
            this.queueSpawn(EnemyType.SUPPORT, i * 3.0);
        }

        // Spawn boss
        if (composition.boss > 0) {
            this.queueSpawn(EnemyType.BOSS, 10.0);
        }
    }

    queueSpawn(type, delay) {
        this.enemiesRemainingInWave++;
        this.spawnQueue.push({
            type: type,
            delay: delay,
            spawnTime: delay
        });
    }

    processSpawnQueue(deltaTime) {
        for (let i = this.spawnQueue.length - 1; i >= 0; i--) {
            const spawnData = this.spawnQueue[i];
            spawnData.delay -= deltaTime;

            if (spawnData.delay <= 0) {
                this.spawnEnemy(spawnData.type);
                this.spawnQueue.splice(i, 1);
            }
        }
    }

    spawnEnemy(type) {
        const spawnPoint = this.getRandomSpawnPoint();
        const enemy = new Enemy(type, spawnPoint);
        this.game.state.enemies.push(enemy);
        this.spawnedEnemies++;

        console.log(`Spawned ${type} enemy #${this.spawnedEnemies} at (${spawnPoint.x.toFixed(1)}, ${spawnPoint.y.toFixed(1)})`);
    }

    getRandomSpawnPoint() {
        const index = Math.floor(Math.random() * this.spawnPoints.length);
        const basePoint = this.spawnPoints[index];

        // Add some randomness
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;

        return new Vector2(basePoint.x + offsetX, basePoint.y + offsetY);
    }

    completeWave() {
        this.waveActive = false;
        this.waveTimer = 0;

        this.game.state.stats.wavesCompleted++;

        console.log(`\n=== Wave ${this.currentWave} Complete! ===`);
        console.log(`Enemies killed: ${this.spawnedEnemies}`);
        console.log(`Next wave in ${this.timeBetweenWaves} seconds\n`);

        // Reward resources
        this.giveWaveRewards();
    }

    giveWaveRewards() {
        const baseReward = 50;
        const waveMultiplier = this.currentWave;
        const totalReward = baseReward * waveMultiplier;

        this.game.resourceManager.addResource(
            ResourceType.SCRAP_METAL,
            totalReward
        );

        console.log(`Reward: ${totalReward} Scrap Metal`);
    }

    enemyKilled() {
        this.enemiesRemainingInWave--;
    }

    // Get time until next wave (for UI)
    getTimeUntilNextWave() {
        if (this.waveActive) {
            return 0;
        }
        return Math.max(0, this.timeBetweenWaves - this.waveTimer);
    }
}
