/**
 * PathfindingSystem - A* pathfinding implementation for enemies and collectors
 */
class PathfindingSystem {
    /**
     * Find a path from start to end using A* algorithm
     * @param {Vector2Int} start - Starting grid position
     * @param {Vector2Int} end - Target grid position
     * @param {Grid} grid - Grid reference
     * @returns {Array<Vector2>} Array of world positions representing the path
     */
    static findPath(start, end, grid) {
        // Validate inputs
        if (!grid.isInBounds(start) || !grid.isInBounds(end)) {
            return [];
        }

        if (!grid.isWalkable(end)) {
            // Try to find nearest walkable tile to end
            end = this.findNearestWalkable(end, grid);
            if (end == null) {
                return [];
            }
        }

        // Already at target
        if (start.x === end.x && start.y === end.y) {
            return [grid.gridToWorld(end)];
        }

        // A* algorithm
        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();

        // Helper to get unique key for grid position
        const getKey = (pos) => `${pos.x},${pos.y}`;

        const startKey = getKey(start);
        const endKey = getKey(end);

        openSet.push(start);
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(start, end));

        while (openSet.length > 0) {
            // Get node with lowest fScore
            let current = openSet[0];
            let currentKey = getKey(current);
            let lowestIndex = 0;

            for (let i = 1; i < openSet.length; i++) {
                const key = getKey(openSet[i]);
                if (fScore.get(key) < fScore.get(currentKey)) {
                    current = openSet[i];
                    currentKey = key;
                    lowestIndex = i;
                }
            }

            // Reached goal
            if (currentKey === endKey) {
                return this.reconstructPath(cameFrom, current, grid);
            }

            // Move current from open to closed
            openSet.splice(lowestIndex, 1);
            closedSet.add(currentKey);

            // Check all neighbors
            const neighbors = grid.getNeighbors(current);
            for (const neighbor of neighbors) {
                const neighborKey = getKey(neighbor);

                // Skip if already evaluated
                if (closedSet.has(neighborKey)) {
                    continue;
                }

                // Skip unwalkable tiles
                if (!grid.isWalkable(neighbor)) {
                    continue;
                }

                const tentativeGScore = gScore.get(currentKey) + 1;

                // Add to open set if not there
                if (!openSet.some(pos => getKey(pos) === neighborKey)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
                    // Not a better path
                    continue;
                }

                // This is the best path so far
                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, end));
            }
        }

        // No path found
        return [];
    }

    /**
     * Heuristic function (Manhattan distance)
     */
    static heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    /**
     * Reconstruct path from A* results
     */
    static reconstructPath(cameFrom, current, grid) {
        const path = [];
        const getKey = (pos) => `${pos.x},${pos.y}`;

        let currentKey = getKey(current);
        path.unshift(grid.gridToWorld(current));

        while (cameFrom.has(currentKey)) {
            current = cameFrom.get(currentKey);
            currentKey = getKey(current);
            path.unshift(grid.gridToWorld(current));
        }

        return path;
    }

    /**
     * Find nearest walkable tile to a given position
     */
    static findNearestWalkable(center, grid) {
        // Check in expanding circles
        for (let radius = 1; radius <= 10; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    // Only check tiles at current radius
                    if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) {
                        continue;
                    }

                    const pos = new Vector2Int(center.x + dx, center.y + dy);
                    if (grid.isInBounds(pos) && grid.isWalkable(pos)) {
                        return pos;
                    }
                }
            }
        }

        return null;
    }
}
