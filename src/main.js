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
    const enemyCount = 12;

    // Define spawn zones around the map
    const spawnZones = [
        { x: 40, y: 0, spread: 15 },      // Right
        { x: -40, y: 0, spread: 15 },     // Left
        { x: 0, y: 40, spread: 15 },      // Bottom
        { x: 0, y: -40, spread: 15 },     // Top
        { x: 30, y: 30, spread: 10 },     // Bottom-right
        { x: -30, y: 30, spread: 10 },    // Bottom-left
        { x: 30, y: -30, spread: 10 },    // Top-right
        { x: -30, y: -30, spread: 10 }    // Top-left
    ];

    for (let i = 0; i < enemyCount; i++) {
        // Pick a random spawn zone
        const zone = spawnZones[i % spawnZones.length];

        // Add some randomness within the zone
        const offsetX = (Math.random() - 0.5) * zone.spread;
        const offsetY = (Math.random() - 0.5) * zone.spread;

        const x = zone.x + offsetX;
        const y = zone.y + offsetY;

        const enemy = new Enemy(new Vector2(x, y));
        game.state.enemies.push(enemy);
        console.log(`Spawned enemy ${i+1} at (${x.toFixed(1)}, ${y.toFixed(1)})`);
    }

    console.log(`Spawned ${enemyCount} test enemies total. Current enemy count: ${game.state.enemies.length}`);
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
