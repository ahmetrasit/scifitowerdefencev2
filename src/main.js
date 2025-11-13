/**
 * Main entry point for the game
 */

// Global game instance
let game = null;

// Initialize the game when page loads
window.addEventListener('load', () => {
    console.log('Initializing Sci-Fi Tower Defense...');

    // Get canvas
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    // Create game manager
    game = new GameManager(canvas);

    // Initialize game
    game.initialize();

    // Hide loading screen
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.classList.add('hidden');
    }

    console.log('Game initialized. Starting game loop...');
    console.log('First wave will start in 30 seconds...');

    // Start game loop
    game.run();

    console.log('Game is running! Controls: WASD = Move, Mouse = Aim & Shoot');
});

// Debug helper functions for testing
window.spawnEnemy = (type = 'swarmer', x = 0, y = 0) => {
    const enemy = new Enemy(type, new Vector2(x, y));
    game.state.enemies.push(enemy);
    console.log(`Spawned ${type} enemy at (${x}, ${y})`);
};

window.spawnEnemies = (count = 5, type = 'swarmer') => {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 30;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        const enemy = new Enemy(type, new Vector2(x, y));
        game.state.enemies.push(enemy);
    }
    console.log(`Spawned ${count} ${type} enemies`);
};

window.startWave = () => {
    if (game.waveManager) {
        game.waveManager.startNextWave();
    }
};

window.clearEnemies = () => {
    game.state.enemies = [];
    console.log('Cleared all enemies');
};

window.addResources = (amount = 100) => {
    game.resourceManager.addResource(ResourceType.SCRAP_METAL, amount);
    game.resourceManager.addResource(ResourceType.METALLIC_PLATE, amount);
    console.log(`Added ${amount} of each resource`);
};

console.log('Game loaded. Debug commands available:');
console.log('  spawnEnemy(type, x, y) - Spawn enemy at position (types: swarmer, tank, runner, support, boss)');
console.log('  spawnEnemies(count, type) - Spawn multiple enemies');
console.log('  startWave() - Start next wave immediately');
console.log('  clearEnemies() - Remove all enemies');
console.log('  addResources(amount) - Add resources');
