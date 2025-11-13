/**
 * Entity - Base class for all game objects
 */
class Entity {
    constructor(position) {
        this.position = position.clone();
        this.rotation = 0;
        this.isDestroyed = false;
    }

    update(deltaTime) {
        // Override in subclasses
    }

    render(renderer) {
        // Override in subclasses
    }

    destroy() {
        this.isDestroyed = true;
    }
}
