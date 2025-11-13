/**
 * Color - Helper class for color management
 */
class Color {
    constructor(r, g, b, a = 1.0) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    // Convert to CSS rgba string
    toRGBA() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    // Convert to CSS hex string
    toHex() {
        const toHex = (n) => {
            const hex = Math.round(n).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`;
    }

    // Clone this color
    clone() {
        return new Color(this.r, this.g, this.b, this.a);
    }

    // Predefined colors
    static get BLACK() { return new Color(0, 0, 0); }
    static get WHITE() { return new Color(255, 255, 255); }
    static get RED() { return new Color(255, 0, 0); }
    static get GREEN() { return new Color(0, 255, 0); }
    static get BLUE() { return new Color(0, 0, 255); }
    static get YELLOW() { return new Color(255, 255, 0); }
    static get CYAN() { return new Color(0, 255, 255); }
    static get MAGENTA() { return new Color(255, 0, 255); }
    static get ORANGE() { return new Color(255, 165, 0); }
    static get PURPLE() { return new Color(128, 0, 128); }
    static get GRAY() { return new Color(128, 128, 128); }
    static get LIGHT_GRAY() { return new Color(192, 192, 192); }
    static get DARK_GRAY() { return new Color(64, 64, 64); }

    // Game-specific colors
    static get DARK_BLUE() { return new Color(22, 33, 62); }
    static get DEEP_PURPLE() { return new Color(26, 26, 46); }
    static get NEON_CYAN() { return new Color(0, 255, 255); }
    static get NEON_GREEN() { return new Color(0, 255, 127); }
    static get NEON_PINK() { return new Color(255, 20, 147); }

    // Transparent variants
    static get BLACK_TRANSPARENT() { return new Color(0, 0, 0, 0.7); }
    static get DARK_GRAY_TRANSPARENT() { return new Color(64, 64, 64, 0.8); }

    // Health bar colors
    static healthColor(percent) {
        if (percent > 0.6) return Color.GREEN;
        if (percent > 0.3) return Color.YELLOW;
        return Color.RED;
    }

    // Power efficiency colors
    static powerColor(efficiency) {
        if (efficiency >= 1.0) return Color.NEON_GREEN;
        if (efficiency >= 0.5) return Color.YELLOW;
        return Color.RED;
    }

    // Create color from hex string
    static fromHex(hex) {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return new Color(r, g, b);
    }
}
