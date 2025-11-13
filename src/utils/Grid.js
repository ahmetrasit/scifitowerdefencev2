/**
 * Grid - Tile-based grid system for pathfinding and building placement
 */
class Grid {
    constructor(width, height, tileSize = 2.0) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;

        // Create 2D array of tiles
        this.tiles = [];
        for (let y = 0; y < height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < width; x++) {
                this.tiles[y][x] = {
                    walkable: true,
                    building: null,
                    cost: 1
                };
            }
        }
    }

    // Convert world position to grid position
    worldToGrid(worldPos) {
        // Center the grid at world origin
        const offsetX = this.width * this.tileSize / 2;
        const offsetY = this.height * this.tileSize / 2;

        const gridX = Math.floor((worldPos.x + offsetX) / this.tileSize);
        const gridY = Math.floor((worldPos.y + offsetY) / this.tileSize);

        return new Vector2Int(gridX, gridY);
    }

    // Convert grid position to world position (center of tile)
    gridToWorld(gridPos) {
        const offsetX = this.width * this.tileSize / 2;
        const offsetY = this.height * this.tileSize / 2;

        const worldX = gridPos.x * this.tileSize - offsetX + this.tileSize / 2;
        const worldY = gridPos.y * this.tileSize - offsetY + this.tileSize / 2;

        return new Vector2(worldX, worldY);
    }

    // Check if grid position is valid
    isValid(gridPos) {
        return gridPos.x >= 0 && gridPos.x < this.width &&
               gridPos.y >= 0 && gridPos.y < this.height;
    }

    // Check if tile is walkable
    isWalkable(gridPos) {
        if (!this.isValid(gridPos)) return false;
        return this.tiles[gridPos.y][gridPos.x].walkable;
    }

    // Set tile walkability
    setWalkable(gridPos, walkable) {
        if (!this.isValid(gridPos)) return;
        this.tiles[gridPos.y][gridPos.x].walkable = walkable;
    }

    // Get tile at position
    getTile(gridPos) {
        if (!this.isValid(gridPos)) return null;
        return this.tiles[gridPos.y][gridPos.x];
    }

    // Set building at tile
    setBuilding(gridPos, building) {
        if (!this.isValid(gridPos)) return;
        this.tiles[gridPos.y][gridPos.x].building = building;
        this.tiles[gridPos.y][gridPos.x].walkable = false;
    }

    // Remove building from tile
    removeBuilding(gridPos) {
        if (!this.isValid(gridPos)) return;
        this.tiles[gridPos.y][gridPos.x].building = null;
        this.tiles[gridPos.y][gridPos.x].walkable = true;
    }

    // Get neighboring tiles (4-directional)
    getNeighbors(gridPos) {
        const neighbors = [];
        const directions = [
            new Vector2Int(0, -1),  // Up
            new Vector2Int(1, 0),   // Right
            new Vector2Int(0, 1),   // Down
            new Vector2Int(-1, 0)   // Left
        ];

        for (const dir of directions) {
            const neighbor = gridPos.add(dir);
            if (this.isValid(neighbor)) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    // Get neighboring tiles (8-directional)
    getNeighbors8(gridPos) {
        const neighbors = [];

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;

                const neighbor = new Vector2Int(gridPos.x + dx, gridPos.y + dy);
                if (this.isValid(neighbor)) {
                    neighbors.push(neighbor);
                }
            }
        }

        return neighbors;
    }

    // Get cost of moving to a tile
    getCost(gridPos) {
        if (!this.isValid(gridPos)) return Infinity;
        const tile = this.tiles[gridPos.y][gridPos.x];
        return tile.walkable ? tile.cost : Infinity;
    }
}
