/**
 * Renderer - Handles all drawing operations
 */
class Renderer {
    constructor(canvas, camera) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.camera = camera;
    }

    // Clear the canvas
    clear(color = Color.DEEP_PURPLE) {
        this.ctx.fillStyle = color.toRGBA();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Begin drawing (save context state)
    begin() {
        this.ctx.save();
    }

    // End drawing (restore context state)
    end() {
        this.ctx.restore();
    }

    // Apply camera transformation
    applyCamera() {
        const halfWidth = this.canvas.width / 2;
        const halfHeight = this.canvas.height / 2;

        // Translate to center, apply zoom, then camera position
        this.ctx.translate(halfWidth, halfHeight);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.position.x, -this.camera.position.y);
    }

    // Draw a circle
    drawCircle(worldPos, radius, color, fill = true) {
        this.ctx.beginPath();
        this.ctx.arc(worldPos.x, worldPos.y, radius, 0, Math.PI * 2);

        if (fill) {
            this.ctx.fillStyle = color.toRGBA();
            this.ctx.fill();
        } else {
            this.ctx.strokeStyle = color.toRGBA();
            this.ctx.lineWidth = 2 / this.camera.zoom;
            this.ctx.stroke();
        }
    }

    // Draw a rectangle
    drawRect(worldPos, width, height, color, fill = true) {
        const x = worldPos.x - width / 2;
        const y = worldPos.y - height / 2;

        if (fill) {
            this.ctx.fillStyle = color.toRGBA();
            this.ctx.fillRect(x, y, width, height);
        } else {
            this.ctx.strokeStyle = color.toRGBA();
            this.ctx.lineWidth = 2 / this.camera.zoom;
            this.ctx.strokeRect(x, y, width, height);
        }
    }

    // Draw a line
    drawLine(start, end, color, lineWidth = 2) {
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.strokeStyle = color.toRGBA();
        this.ctx.lineWidth = lineWidth / this.camera.zoom;
        this.ctx.stroke();
    }

    // Draw text in world space
    drawText(text, worldPos, color, fontSize = 12, align = 'center') {
        this.ctx.save();
        this.ctx.font = `${fontSize / this.camera.zoom}px 'Courier New', monospace`;
        this.ctx.fillStyle = color.toRGBA();
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, worldPos.x, worldPos.y);
        this.ctx.restore();
    }

    // Draw text in screen space (UI)
    drawTextUI(text, screenPos, color, fontSize = 16, align = 'left') {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation
        this.ctx.font = `${fontSize}px 'Courier New', monospace`;
        this.ctx.fillStyle = color.toRGBA();
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(text, screenPos.x, screenPos.y);
        this.ctx.restore();
    }

    // Draw a rectangle in screen space (UI)
    drawRectUI(screenPos, width, height, color, fill = true) {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (fill) {
            this.ctx.fillStyle = color.toRGBA();
            this.ctx.fillRect(screenPos.x, screenPos.y, width, height);
        } else {
            this.ctx.strokeStyle = color.toRGBA();
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(screenPos.x, screenPos.y, width, height);
        }

        this.ctx.restore();
    }

    // Draw a rotated rectangle
    drawRotatedRect(worldPos, width, height, rotation, color, fill = true) {
        this.ctx.save();
        this.ctx.translate(worldPos.x, worldPos.y);
        this.ctx.rotate(rotation);

        const x = -width / 2;
        const y = -height / 2;

        if (fill) {
            this.ctx.fillStyle = color.toRGBA();
            this.ctx.fillRect(x, y, width, height);
        } else {
            this.ctx.strokeStyle = color.toRGBA();
            this.ctx.lineWidth = 2 / this.camera.zoom;
            this.ctx.strokeRect(x, y, width, height);
        }

        this.ctx.restore();
    }

    // Draw a polygon
    drawPolygon(points, color, fill = true) {
        if (points.length < 3) return;

        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }

        this.ctx.closePath();

        if (fill) {
            this.ctx.fillStyle = color.toRGBA();
            this.ctx.fill();
        } else {
            this.ctx.strokeStyle = color.toRGBA();
            this.ctx.lineWidth = 2 / this.camera.zoom;
            this.ctx.stroke();
        }
    }

    // Draw a health bar
    drawHealthBar(worldPos, width, height, healthPercent, offset = 1.5) {
        const barPos = worldPos.add(new Vector2(0, -offset));
        const x = barPos.x - width / 2;
        const y = barPos.y - height / 2;

        // Background
        this.ctx.fillStyle = Color.DARK_GRAY.toRGBA();
        this.ctx.fillRect(x, y, width, height);

        // Health fill
        const healthColor = Color.healthColor(healthPercent);
        this.ctx.fillStyle = healthColor.toRGBA();
        this.ctx.fillRect(x, y, width * healthPercent, height);

        // Border
        this.ctx.strokeStyle = Color.BLACK.toRGBA();
        this.ctx.lineWidth = 1 / this.camera.zoom;
        this.ctx.strokeRect(x, y, width, height);
    }

    // Draw a glow effect
    drawGlow(worldPos, radius, color, intensity = 0.5) {
        const gradient = this.ctx.createRadialGradient(
            worldPos.x, worldPos.y, 0,
            worldPos.x, worldPos.y, radius
        );

        const glowColor = color.clone();
        glowColor.a = intensity;
        gradient.addColorStop(0, glowColor.toRGBA());

        glowColor.a = 0;
        gradient.addColorStop(1, glowColor.toRGBA());

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(worldPos.x, worldPos.y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // Draw grid (for debugging)
    drawGrid(gridSize, color = Color.DARK_GRAY) {
        const bounds = this.camera.getVisibleBounds();
        const startX = Math.floor(bounds.left / gridSize) * gridSize;
        const startY = Math.floor(bounds.top / gridSize) * gridSize;
        const endX = Math.ceil(bounds.right / gridSize) * gridSize;
        const endY = Math.ceil(bounds.bottom / gridSize) * gridSize;

        this.ctx.strokeStyle = color.toRGBA();
        this.ctx.lineWidth = 1 / this.camera.zoom;

        // Vertical lines
        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, bounds.top);
            this.ctx.lineTo(x, bounds.bottom);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(bounds.left, y);
            this.ctx.lineTo(bounds.right, y);
            this.ctx.stroke();
        }

        // Draw origin
        this.drawCircle(Vector2.zero(), 5 / this.camera.zoom, Color.RED);
    }
}
