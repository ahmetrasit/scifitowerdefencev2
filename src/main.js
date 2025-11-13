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

    // Add some test enemies for demonstration
    addTestEnemies();

    console.log('Game initialized. Starting game loop...');

    // Start game loop
    game.run();

    console.log('Game is running! Controls: WASD = Move, Mouse = Aim & Shoot');
});

// Helper function to spawn test enemies
function addTestEnemies() {
    // Spawn a circle of enemies around the player
    const enemyCount = 8;
    const spawnRadius = 30;

    for (let i = 0; i < enemyCount; i++) {
        const angle = (i / enemyCount) * Math.PI * 2;
        const x = Math.cos(angle) * spawnRadius;
        const y = Math.sin(angle) * spawnRadius;

        const enemy = new Enemy(new Vector2(x, y));
        game.state.enemies.push(enemy);
    }

    console.log(`Spawned ${enemyCount} test enemies`);
}

// Expose helper functions for debugging
window.spawnEnemy = (x = 0, y = 0) => {
    const enemy = new Enemy(new Vector2(x, y));
    game.state.enemies.push(enemy);
    console.log(`Spawned enemy at (${x}, ${y})`);
};

window.spawnEnemies = (count = 5) => {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 20;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        const enemy = new Enemy(new Vector2(x, y));
        game.state.enemies.push(enemy);
    }
    console.log(`Spawned ${count} enemies`);
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
console.log('  spawnEnemy(x, y) - Spawn enemy at position');
console.log('  spawnEnemies(count) - Spawn multiple enemies');
console.log('  clearEnemies() - Remove all enemies');
console.log('  addResources(amount) - Add resources');
