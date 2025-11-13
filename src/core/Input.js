/**
 * Input - Handles keyboard and mouse input
 */
class Input {
    constructor(canvas) {
        this.canvas = canvas;

        // Keyboard state
        this.keysPressed = new Set();
        this.keysJustPressed = new Set();
        this.keysJustReleased = new Set();

        // Mouse state
        this.mousePosition = new Vector2(0, 0);
        this.mouseWorldPosition = new Vector2(0, 0);
        this.mouseButtons = new Set();
        this.mouseButtonsJustPressed = new Set();
        this.mouseButtonsJustReleased = new Set();

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            if (!this.keysPressed.has(e.code)) {
                this.keysJustPressed.add(e.code);
            }
            this.keysPressed.add(e.code);
        });

        window.addEventListener('keyup', (e) => {
            this.keysPressed.delete(e.code);
            this.keysJustReleased.add(e.code);
        });

        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.mouseButtons.has(e.button)) {
                this.mouseButtonsJustPressed.add(e.button);
            }
            this.mouseButtons.add(e.button);
            e.preventDefault();
        });

        this.canvas.addEventListener('mouseup', (e) => {
            this.mouseButtons.delete(e.button);
            this.mouseButtonsJustReleased.add(e.button);
            e.preventDefault();
        });

        // Prevent context menu on right-click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = touch.clientX - rect.left;
            this.mousePosition.y = touch.clientY - rect.top;
            this.mouseButtonsJustPressed.add(0);
            this.mouseButtons.add(0);
            e.preventDefault();
        });

        this.canvas.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = touch.clientX - rect.left;
            this.mousePosition.y = touch.clientY - rect.top;
            e.preventDefault();
        });

        this.canvas.addEventListener('touchend', (e) => {
            this.mouseButtons.delete(0);
            this.mouseButtonsJustReleased.add(0);
            e.preventDefault();
        });
    }

    // Update input state (call at end of frame)
    update() {
        this.keysJustPressed.clear();
        this.keysJustReleased.clear();
        this.mouseButtonsJustPressed.clear();
        this.mouseButtonsJustReleased.clear();
    }

    // Keyboard methods
    isKeyPressed(code) {
        return this.keysPressed.has(code);
    }

    isKeyJustPressed(code) {
        return this.keysJustPressed.has(code);
    }

    isKeyJustReleased(code) {
        return this.keysJustReleased.has(code);
    }

    // Mouse methods
    isMouseButtonPressed(button) {
        return this.mouseButtons.has(button);
    }

    isMouseButtonJustPressed(button) {
        return this.mouseButtonsJustPressed.has(button);
    }

    isMouseButtonJustReleased(button) {
        return this.mouseButtonsJustReleased.has(button);
    }

    getMousePosition() {
        return this.mousePosition.clone();
    }

    getMouseWorldPosition() {
        return this.mouseWorldPosition.clone();
    }

    setMouseWorldPosition(worldPos) {
        this.mouseWorldPosition = worldPos;
    }
}

// Key code constants for convenience
const Keys = {
    W: 'KeyW',
    A: 'KeyA',
    S: 'KeyS',
    D: 'KeyD',
    E: 'KeyE',
    Q: 'KeyQ',
    R: 'KeyR',
    SPACE: 'Space',
    SHIFT: 'ShiftLeft',
    CTRL: 'ControlLeft',
    ESC: 'Escape',
    TAB: 'Tab',
    DIGIT_1: 'Digit1',
    DIGIT_2: 'Digit2',
    DIGIT_3: 'Digit3',
    DIGIT_4: 'Digit4',
    DIGIT_5: 'Digit5',
    DIGIT_6: 'Digit6',
    DIGIT_7: 'Digit7',
    DIGIT_8: 'Digit8',
    DIGIT_9: 'Digit9',
    DIGIT_0: 'Digit0'
};

// Mouse button constants
const MouseButtons = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2
};
