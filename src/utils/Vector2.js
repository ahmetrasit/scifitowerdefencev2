/**
 * Vector2 - 2D vector for positions, velocities, and directions
 */
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // Create a copy of this vector
    clone() {
        return new Vector2(this.x, this.y);
    }

    // Add another vector to this one
    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    // Subtract another vector from this one
    subtract(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    // Multiply by a scalar
    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    // Divide by a scalar
    divide(scalar) {
        if (scalar === 0) return new Vector2(0, 0);
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    // Get the length (magnitude) of this vector
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // Get the squared length (faster, no sqrt)
    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }

    // Get normalized version (length = 1)
    normalized() {
        const len = this.length();
        if (len === 0) return new Vector2(0, 0);
        return this.divide(len);
    }

    // Normalize this vector in place
    normalize() {
        const len = this.length();
        if (len > 0) {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }

    // Distance to another vector
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Squared distance (faster)
    distanceToSquared(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return dx * dx + dy * dy;
    }

    // Dot product
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    // Get angle in radians
    angle() {
        return Math.atan2(this.y, this.x);
    }

    // Rotate by angle (radians)
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    // Lerp (linear interpolation) between this and another vector
    lerp(other, t) {
        return new Vector2(
            this.x + (other.x - this.x) * t,
            this.y + (other.y - this.y) * t
        );
    }

    // Check if equal to another vector
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }

    // Static helper methods
    static zero() {
        return new Vector2(0, 0);
    }

    static one() {
        return new Vector2(1, 1);
    }

    static up() {
        return new Vector2(0, -1);
    }

    static down() {
        return new Vector2(0, 1);
    }

    static left() {
        return new Vector2(-1, 0);
    }

    static right() {
        return new Vector2(1, 0);
    }

    static fromAngle(angle, length = 1) {
        return new Vector2(
            Math.cos(angle) * length,
            Math.sin(angle) * length
        );
    }

    // String representation
    toString() {
        return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }
}

/**
 * Vector2Int - Integer vector for grid positions
 */
class Vector2Int {
    constructor(x = 0, y = 0) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
    }

    clone() {
        return new Vector2Int(this.x, this.y);
    }

    add(other) {
        return new Vector2Int(this.x + other.x, this.y + other.y);
    }

    subtract(other) {
        return new Vector2Int(this.x - other.x, this.y - other.y);
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }

    // Convert to regular Vector2
    toVector2() {
        return new Vector2(this.x, this.y);
    }

    // Manhattan distance
    manhattanDistance(other) {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }

    toString() {
        return `Vector2Int(${this.x}, ${this.y})`;
    }

    static zero() {
        return new Vector2Int(0, 0);
    }
}
