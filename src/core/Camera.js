/**
 * Camera - Handles viewport and world-to-screen transformations
 */
class Camera {
    constructor(width, height) {
        this.position = new Vector2(0, 0);
        this.zoom = 1.0;
        this.minZoom = 0.5;
        this.maxZoom = 2.0;
        this.width = width;
        this.height = height;
    }

    // Convert world position to screen position
    worldToScreen(worldPos) {
        const screenX = (worldPos.x - this.position.x) * this.zoom + this.width / 2;
        const screenY = (worldPos.y - this.position.y) * this.zoom + this.height / 2;
        return new Vector2(screenX, screenY);
    }

    // Convert screen position to world position
    screenToWorld(screenPos) {
        const worldX = (screenPos.x - this.width / 2) / this.zoom + this.position.x;
        const worldY = (screenPos.y - this.height / 2) / this.zoom + this.position.y;
        return new Vector2(worldX, worldY);
    }

    // Move camera to position
    moveTo(position) {
        this.position = position.clone();
    }

    // Move camera by offset
    moveBy(offset) {
        this.position = this.position.add(offset);
    }

    // Set zoom level
    setZoom(zoom) {
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    }

    // Adjust zoom by delta
    adjustZoom(delta) {
        this.setZoom(this.zoom + delta);
    }

    // Follow a target (smooth camera follow)
    follow(target, smoothness = 0.1) {
        const desired = target.clone();
        this.position = this.position.lerp(desired, smoothness);
    }

    // Check if a world position is visible
    isVisible(worldPos, margin = 0) {
        const screenPos = this.worldToScreen(worldPos);
        return screenPos.x >= -margin && screenPos.x <= this.width + margin &&
               screenPos.y >= -margin && screenPos.y <= this.height + margin;
    }

    // Get visible world bounds
    getVisibleBounds() {
        const topLeft = this.screenToWorld(new Vector2(0, 0));
        const bottomRight = this.screenToWorld(new Vector2(this.width, this.height));

        return {
            left: topLeft.x,
            top: topLeft.y,
            right: bottomRight.x,
            bottom: bottomRight.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y
        };
    }
}
