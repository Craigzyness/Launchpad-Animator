import { AnimationPreset, InteractivePreset, Layer } from './App';
import { RAINBOW_CODES, GRID_NOTES, OFF_COLOR } from './constants';
import { createBlankLayer } from './utils/colorUtils';

// --- ANIMATION PRESET GENERATORS ---

const generateRainbowFrames = (colors: readonly number[], isVertical: boolean): Layer[] => {
    const frames: Layer[] = [];
    const cycleLength = colors.length;
    for (let i = 0; i < 8 + cycleLength; i++) {
        const frame = createBlankLayer();
        GRID_NOTES.forEach((row, y) => {
            row.forEach((note, x) => {
                const pos = isVertical ? y : x;
                const colorIndex = (pos + i) % cycleLength;
                frame[note] = colors[colorIndex];
            });
        });
        frames.push(frame);
    }
    return frames;
};

const generateDiagonalRainbowFrames = (colors: readonly number[]): Layer[] => {
    const frames: Layer[] = [];
    const cycleLength = colors.length;
    if (cycleLength === 0) return frames;

    const duration = 14 + cycleLength; // 8x + 8y - 2 for distance across grid, plus color cycle

    for (let i = 0; i < duration; i++) {
        const frame = createBlankLayer();
        GRID_NOTES.forEach((row, y) => {
            row.forEach((note, x) => {
                const pos = x + y;
                const colorIndex = (pos - i + duration) % cycleLength;
                frame[note] = colors[colorIndex];
            });
        });
        frames.push(frame);
    }
    return frames;
};

const generateColorCycleFrames = (colors: readonly number[]): Layer[] => {
    const frames: Layer[] = [];
    if (colors.length === 0) return frames;

    colors.forEach(color => {
        const frame = createBlankLayer();
        GRID_NOTES.flat().forEach(note => {
            frame[note] = color;
        });
        frames.push(frame);
    });

    return frames;
};

const generateCheckerboardFrames = (colors: readonly number[]): Layer[] => {
    const frames: Layer[] = [];
    const colorA = colors[0] || 5; // Default red
    const colorB = colors[1] || 3; // Default white
    for (let i = 0; i < 2; i++) {
        const frame = createBlankLayer();
        GRID_NOTES.forEach((row, y) => {
            row.forEach((note, x) => {
                if ((x + y + i) % 2 === 0) {
                    frame[note] = colorA;
                } else {
                    frame[note] = colorB;
                }
            });
        });
        frames.push(frame);
    }
    return frames;
};

const generateExpandingBoxFrames = (colors: readonly number[]): Layer[] => {
    const frames: Layer[] = [];
    const color = colors[0] || 13; // Default yellow
    for(let i=0; i < 4; i++) {
        const frame = createBlankLayer();
        for(let y=i; y < 8-i; y++) {
            for (let x=i; x < 8-i; x++) {
                if(y === i || y === 7-i || x === i || x === 7-i) {
                     const note = GRID_NOTES[y][x];
                     if(note) frame[note] = color;
                }
            }
        }
        frames.push(frame);
    }
     for(let i=3; i >= 0; i--) {
        const frame = createBlankLayer();
        for(let y=i; y < 8-i; y++) {
            for (let x=i; x < 8-i; x++) {
                if(y === i || y === 7-i || x === i || x === 7-i) {
                     const note = GRID_NOTES[y][x];
                     if(note) frame[note] = color;
                }
            }
        }
        frames.push(frame);
    }
    return frames;
}

const generateRainFrames = (colors: readonly number[]): Layer[] => {
    const frames: Layer[] = [];
    const numDrops = 10;
    const duration = 32;
    const drops = Array.from({ length: numDrops }, () => ({
        x: Math.floor(Math.random() * 8),
        y: Math.random() * -duration, // Start off-screen
        color: colors[Math.floor(Math.random() * colors.length)]
    }));

    for (let i = 0; i < duration; i++) {
        const frame = createBlankLayer();
        drops.forEach(drop => {
            drop.y++;
            if (drop.y >= 8) {
                drop.y = 0;
                drop.x = Math.floor(Math.random() * 8);
            }
            if (drop.y >= 0) {
                const note = GRID_NOTES[Math.floor(drop.y)][drop.x];
                if (note) frame[note] = drop.color;
            }
        });
        frames.push(frame);
    }
    return frames;
};

const generateSpiralFrames = (colors: readonly number[]): Layer[] => {
    const frames: Layer[] = [];
    const color = colors[0] || 29; // default cyan
    const path: {x: number, y: number}[] = [];
    let x = 0, y = 0, dx = 0, dy = -1;
    const gridSize = 8;
    // Center the start
    const startX = 3;
    const startY = 4;
    for(let i = 0; i < gridSize * gridSize; i++) {
        if ((-gridSize/2 < x && x <= gridSize/2) && (-gridSize/2 < y && y <= gridSize/2)) {
            if(GRID_NOTES[startY+y]?.[startX+x]) path.push({x: startX+x, y: startY+y});
        }
        if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1-y)) {
            [dx, dy] = [-dy, dx];
        }
        x += dx; y += dy;
    }
    
    const forwardFrames: Layer[] = [];
    for (let i = 0; i < path.length; i++) {
        const frame = createBlankLayer();
        for (let j = 0; j <= i; j++) {
            const note = GRID_NOTES[path[j].y][path[j].x];
            frame[note] = color;
        }
        forwardFrames.push(frame);
    }
    
    // Create reverse frames for spiraling out
    const reversedFrames = [...forwardFrames].reverse();
    return [...forwardFrames, ...reversedFrames];
};

const generateBouncingBallFrames = (colors: readonly number[]): Layer[] => {
    const frames: Layer[] = [];
    const color = colors[0] || 5; // default red
    let x = Math.floor(Math.random() * 6) + 1;
    let y = Math.floor(Math.random() * 6) + 1;
    let vx = 1;
    let vy = 1;
    const duration = 32;

    for (let i = 0; i < duration; i++) {
        const frame = createBlankLayer();
        
        if (x + vx > 7 || x + vx < 0) vx *= -1;
        if (y + vy > 7 || y + vy < 0) vy *= -1;
        
        x += vx;
        y += vy;

        frame[GRID_NOTES[y][x]] = color;
        frames.push(frame);
    }
    return frames;
};

const generateDiagonalWipeFrames = (colors: readonly number[]): Layer[] => {
    const frames: Layer[] = [];
    const color = colors[0] || 41; // default purple
    const duration = 14; // 7+7 for an 8x8 grid

    for (let d = 0; d <= duration; d++) {
        const frame = createBlankLayer();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (x + y === d) {
                    frame[GRID_NOTES[y][x]] = color;
                }
            }
        }
        frames.push(frame);
    }
    // Add reverse wipe
    for (let d = duration; d >= 0; d--) {
        const frame = createBlankLayer();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (x + y === d) {
                    frame[GRID_NOTES[y][x]] = color;
                }
            }
        }
        frames.push(frame);
    }
    return frames;
};

const generateSnakeFrames = (colors: readonly number[]): Layer[] => {
    const frames: Layer[] = [];
    const snakeColor = colors[0] || 17;
    const appleColor = colors[1] || 5;
    const gameOverColor = colors[2] || 7; // Dark Red
    const duration = 128;

    let snake: {x: number, y: number}[];
    let apple: {x: number, y: number};
    let dir: {x: number, y: number};
    let gameOverCounter: number;

    const resetGame = () => {
        snake = [{x: 4, y: 4}, {x: 3, y: 4}, {x: 2, y: 4}];
        apple = {x: 6, y: 4};
        dir = {x: 1, y: 0};
        gameOverCounter = 0;
    };

    const spawnApple = () => {
        do {
            apple = {x: Math.floor(Math.random()*8), y: Math.floor(Math.random()*8)};
        } while (snake.some(seg => seg.x === apple.x && seg.y === apple.y));
    };

    resetGame();

    for(let i=0; i<duration; i++) {
        const frame = createBlankLayer();

        if (gameOverCounter > 0) {
            // Flash game over screen
            if (gameOverCounter % 2 === 0) {
                GRID_NOTES.flat().forEach(note => frame[note] = gameOverColor);
            }
            gameOverCounter--;
            if (gameOverCounter === 0) resetGame();
            frames.push(frame);
            continue;
        }

        // AI: Simple greedy algorithm that tries to move towards the apple
        const head = snake[0];
        const dx = apple.x - head.x;
        const dy = apple.y - head.y;

        // Try to move along the axis with the greater distance, but don't reverse direction
        const canGoX = (Math.sign(dx) !== -dir.x || dir.x === 0);
        const canGoY = (Math.sign(dy) !== -dir.y || dir.y === 0);

        if (dx !== 0 && canGoX && (Math.abs(dx) > Math.abs(dy) || dy === 0 || !canGoY)) {
            dir = { x: Math.sign(dx), y: 0 };
        } else if (dy !== 0 && canGoY) {
            dir = { x: 0, y: Math.sign(dy) };
        }
        
        const nextHead = { x: head.x + dir.x, y: head.y + dir.y };

        // Collision detection
        const wallCollision = nextHead.x < 0 || nextHead.x > 7 || nextHead.y < 0 || nextHead.y > 7;
        const selfCollision = snake.slice(0, -1).some(seg => seg.x === nextHead.x && seg.y === nextHead.y);

        if (wallCollision || selfCollision) {
            gameOverCounter = 6; // Start game over sequence (3 flashes)
            frames.push(frame); // Push one last empty frame before the flash
            continue;
        }

        snake.unshift(nextHead);

        if(nextHead.x === apple.x && nextHead.y === apple.y) {
             spawnApple();
        } else {
            snake.pop();
        }

        snake.forEach(seg => frame[GRID_NOTES[seg.y][seg.x]] = snakeColor);
        frame[GRID_NOTES[apple.y][apple.x]] = appleColor;
        frames.push(frame);
    }
    return frames;
}

const generateSpaceInvadersFrames = (colors: readonly number[]): Layer[] => {
    const frames: Layer[] = [];
    const invaderColor = colors[0] || 3;
    const invader = [
        [0,1,0,0,0,1,0],
        [1,1,1,1,1,1,1],
        [1,0,1,1,1,0,1],
        [0,0,1,0,1,0,0],
    ];
    let xOffset = 0;
    let yOffset = 0;
    let dir = 1;
    const duration = 32;

    for (let i = 0; i < duration; i++) {
        const frame = createBlankLayer();
        invader.forEach((row, y) => {
            row.forEach((pixel, x) => {
                if (pixel === 1 && GRID_NOTES[y+yOffset]?.[x+xOffset]) {
                    frame[GRID_NOTES[y+yOffset][x+xOffset]] = invaderColor;
                }
            });
        });
        frames.push(frame);

        xOffset += dir;
        // FIX: Corrected movement logic to clamp the xOffset, preventing out-of-bounds calculations.
        if (xOffset > 1) {
            xOffset = 1;
            dir = -1;
            yOffset++;
        } else if (xOffset < 0) {
            xOffset = 0;
            dir = 1;
            yOffset++;
        }
        
        if(yOffset > 3) yOffset = 0;
    }
    return frames;
};

const generatePongFrames = (colors: readonly number[]): Layer[] => {
    const frames: Layer[] = [];
    const ballColor = colors[0] || 3;
    const paddleColor = colors[1] || 29;
    const scoreColorP1 = colors[2] || 5; // Red
    const scoreColorP2 = colors[3] || 37; // Blue

    let ball = {x: 3.5, y: 3.5, vx: 0.5, vy: 0.25};
    let p1_y = 3; // Paddle top y-coord
    let p2_y = 3;
    let p1_score = 0;
    let p2_score = 0;
    const paddleSize = 2;
    const duration = 128;

    const serve = () => {
        ball = {
            x: 3.5,
            y: 3.5,
            vx: (Math.random() > 0.5 ? 1 : -1) * 0.4,
            vy: (Math.random() - 0.5) * 0.4
        };
    };

    for(let i=0; i<duration; i++) {
        const frame = createBlankLayer();

        // Ball movement
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Top/bottom wall collision
        if (ball.y <= 0) { ball.y = 0; ball.vy *= -1; }
        if (ball.y >= 7) { ball.y = 7; ball.vy *= -1; }

        // Paddle AI (imperfect - moves every other frame)
        if (i % 2 === 0) {
            if (ball.vx < 0) { // Ball moving towards P1
                if (ball.y > p1_y + 0.5 && p1_y < 8 - paddleSize) p1_y++;
                if (ball.y < p1_y + 0.5 && p1_y > 0) p1_y--;
            } else { // Ball moving towards P2
                if (ball.y > p2_y + 0.5 && p2_y < 8 - paddleSize) p2_y++;
                if (ball.y < p2_y + 0.5 && p2_y > 0) p2_y--;
            }
        }

        // Paddle collision
        const ballRoundY = Math.round(ball.y);
        // P1
        if (ball.vx < 0 && ball.x <= 1) {
            if (ballRoundY >= p1_y && ballRoundY < p1_y + paddleSize) {
                ball.x = 1;
                ball.vx *= -1.05; // Speed up
                ball.vy += (ball.y - (p1_y + (paddleSize - 1) / 2)) * 0.2; // Add spin
            }
        }
        // P2
        if (ball.vx > 0 && ball.x >= 6) {
            if (ballRoundY >= p2_y && ballRoundY < p2_y + paddleSize) {
                ball.x = 6;
                ball.vx *= -1.05; // Speed up
                ball.vy += (ball.y - (p2_y + (paddleSize - 1) / 2)) * 0.2; // Add spin
            }
        }

        // Scoring
        if (ball.x < 0) { // P2 scores
            if (p2_score < 8) p2_score++;
            serve();
        }
        if (ball.x > 7) { // P1 scores
            if (p1_score < 8) p1_score++;
            serve();
        }
        
        // Clamp ball velocity
        ball.vx = Math.max(-1, Math.min(1, ball.vx));
        ball.vy = Math.max(-1, Math.min(1, ball.vy));

        // Draw paddles
        for(let p=0; p<paddleSize; p++) {
            if (GRID_NOTES[p1_y+p]) frame[GRID_NOTES[p1_y+p][0]] = paddleColor;
            if (GRID_NOTES[p2_y+p]) frame[GRID_NOTES[p2_y+p][7]] = paddleColor;
        }

        // Draw ball
        const ballX = Math.round(ball.x);
        if (GRID_NOTES[ballRoundY]?.[ballX]) {
          frame[GRID_NOTES[ballRoundY][ballX]] = ballColor;
        }

        // Draw scores
        for(let s=0; s<p1_score; s++) frame[GRID_NOTES[0][s]] = scoreColorP1;
        for(let s=0; s<p2_score; s++) frame[GRID_NOTES[0][7-s]] = scoreColorP2;
        
        frames.push(frame);
    }
    return frames;
}

const generatePacManFrames = (colors: readonly number[]): Layer[] => {
    const frames: Layer[] = [];
    const pacmanColor = colors[0] || 13;
    const pacman = [
        [0,1,1,1,0],
        [1,1,1,1,1],
        [1,1,1,0,0], // Mouth
        [1,1,1,1,1],
        [0,1,1,1,0],
    ];
    for (let xOffset = -5; xOffset < 8; xOffset++) {
        const frame = createBlankLayer();
        pacman.forEach((row, y) => {
            row.forEach((pixel, x) => {
                if (pixel && GRID_NOTES[y+1]?.[x+xOffset]) {
                    // Blink mouth
                    if(x > 2 && y === 2 && xOffset % 2 === 0) return;
                    frame[GRID_NOTES[y+1][x+xOffset]] = pacmanColor;
                }
            })
        });
        frames.push(frame);
    }
    return frames;
}

// --- PRESET DEFINITIONS ---

// FIX: Added 'as const' to each preset object to enforce literal types for 'type' and 'effect', preventing type widening issues caused by a circular dependency.
export const ANIMATION_PRESETS: readonly AnimationPreset[] = [
    // Basic Patterns
    { name: 'Checkerboard', category: 'Patterns', type: 'animation', colors: Object.freeze([5, 3]), generator: generateCheckerboardFrames } as const,
    { name: 'Rainbow Wave (H)', category: 'Patterns', type: 'animation', colors: RAINBOW_CODES, generator: (colors) => generateRainbowFrames(colors, false) } as const,
    { name: 'Rainbow Wave (V)', category: 'Patterns', type: 'animation', colors: RAINBOW_CODES, generator: (colors) => generateRainbowFrames(colors, true) } as const,
    { name: 'Rainbow Wave (D)', category: 'Patterns', type: 'animation', colors: RAINBOW_CODES, generator: generateDiagonalRainbowFrames } as const,
    { name: 'Color Cycle', category: 'Patterns', type: 'animation', colors: RAINBOW_CODES, generator: generateColorCycleFrames } as const,

    // Shapes & Transitions
    { name: 'Expanding Box', category: 'Shapes', type: 'animation', colors: Object.freeze([13]), generator: generateExpandingBoxFrames } as const,
    { name: 'Spiral', category: 'Shapes', type: 'animation', colors: Object.freeze([29]), generator: generateSpiralFrames } as const,
    { name: 'Diagonal Wipe', category: 'Transitions', type: 'animation', colors: Object.freeze([41]), generator: generateDiagonalWipeFrames } as const,
    
    // Generative & Fun
    { name: 'Rain', category: 'Nature', type: 'animation', colors: Object.freeze([37, 33, 29]), generator: generateRainFrames } as const,
    { name: 'Bouncing Ball', category: 'Fun', type: 'animation', colors: Object.freeze([5]), generator: generateBouncingBallFrames } as const,
    { name: 'Pulse', category: 'Fun', type: 'animation', colors: Object.freeze([37, 39]), generator: (colors) => {
            const frames: Layer[] = [];
            const colorA = colors[0] || 37;
            const colorB = colors[1] || 39;
            [colorA, colorB, colorA, OFF_COLOR].forEach(color => {
                const frame = createBlankLayer();
                GRID_NOTES.flat().forEach(note => frame[note] = color);
                frames.push(frame);
            })
            return frames;
        }
    } as const,
    
    // Games
    { name: 'Snake', category: 'Games', type: 'animation', colors: Object.freeze([17, 5, 7]), generator: generateSnakeFrames } as const,
    { name: 'Space Invaders', category: 'Games', type: 'animation', colors: Object.freeze([3]), generator: generateSpaceInvadersFrames } as const,
    { name: 'Pong', category: 'Games', type: 'animation', colors: Object.freeze([3, 29, 5, 37]), generator: generatePongFrames } as const,
    { name: 'Pac-Man', category: 'Games', type: 'animation', colors: Object.freeze([13]), generator: generatePacManFrames } as const,
].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

// FIX: Added 'as const' to each preset object to enforce literal types for 'type' and 'effect', preventing type widening issues caused by a circular dependency.
export const INTERACTIVE_PRESETS: readonly InteractivePreset[] = [
    // Artistic & Fun
    { name: 'Paint Splash', category: 'Artistic', type: 'interactive', effect: 'paintSplash', colors: Object.freeze([52, 57]), settings: { size: 4 } } as const,
    { name: 'Color Burst', category: 'Fun', type: 'interactive', effect: 'colorBurst', colors: Object.freeze([61, 9]), settings: { size: 5 } } as const,
    { name: 'Fireworks', category: 'Fun', type: 'interactive', effect: 'fireworks', colors: RAINBOW_CODES, settings: { size: 5 } } as const,
    { name: 'Random Lights', category: 'Fun', type: 'interactive', effect: 'randomLights', colors: RAINBOW_CODES, settings: { size: 10 } } as const,

    // Technical Effects
    { name: 'Invert', category: 'Effects', type: 'interactive', effect: 'invert', colors: Object.freeze([3]), settings: {} } as const,
    { name: 'Strobe', category: 'Effects', type: 'interactive', effect: 'strobe', colors: Object.freeze([3]), settings: { speed: 50 } } as const,
    { name: 'Glitch', category: 'Effects', type: 'interactive', effect: 'glitch', colors: RAINBOW_CODES, settings: { size: 3 } } as const, // Size is intensity

    // Reactive
    { name: 'Pulse', category: 'Reactive', type: 'interactive', effect: 'pulse', colors: Object.freeze([3]), settings: {} } as const,
    { name: 'Chaser', category: 'Reactive', type: 'interactive', effect: 'chaser', colors: Object.freeze([29]), settings: { size: 8, speed: 20 } } as const,
    { name: 'Crosshair', category: 'Reactive', type: 'interactive', effect: 'crosshair', colors: Object.freeze([3]), settings: {} } as const,
    { name: 'Ripple', category: 'Reactive', type: 'interactive', effect: 'ripple', colors: Object.freeze([37, 33, 29]), settings: { size: 4 } } as const,
    { name: 'Trail', category: 'Reactive', type: 'interactive', effect: 'trail', colors: Object.freeze([3, 2, 1]), settings: { size: 5, speed: 100 } } as const,
].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
