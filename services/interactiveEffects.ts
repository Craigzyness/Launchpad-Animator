
import { Layer } from '../App';
import { GRID_NOTES, OFF_COLOR } from '../constants';
import { interpolateColor, createBlankLayer } from '../utils/colorUtils';

type EffectGenerator = (
    startNote: number,
    colors: readonly number[],
    settings: { speed?: number; size?: number },
    currentFrame: Layer
) => Layer[];

const getCoordsFromNote = (note: number): { x: number; y: number } | null => {
    for (let y = 0; y < GRID_NOTES.length; y++) {
        const x = GRID_NOTES[y].indexOf(note);
        if (x !== -1) return { x, y };
    }
    return null;
};

const ripple: EffectGenerator = (startNote, colors, settings) => {
    const frames: Layer[] = [];
    const size = settings.size || 5;
    const startCoords = getCoordsFromNote(startNote);
    if (!startCoords) return [];
    
    // Create a wave of colors
    const colorWave = Array.from({length: size}, (_, i) => {
        const progress = i / (size - 1);
        // Interpolate through the whole color array
        const colorIndex = progress * (colors.length - 1);
        const fromIndex = Math.floor(colorIndex);
        const toIndex = Math.ceil(colorIndex);
        const innerProgress = colorIndex - fromIndex;
        return interpolateColor(colors[fromIndex], colors[toIndex] || colors[fromIndex], innerProgress);
    });


    for (let i = 0; i < size + 2; i++) { // Extend to fade out
        const frame = createBlankLayer();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const dist = Math.round(Math.sqrt(Math.pow(x - startCoords.x, 2) + Math.pow(y - startCoords.y, 2)));
                const colorIndex = i - dist;
                if (colorIndex >= 0 && colorIndex < colorWave.length) {
                    frame[GRID_NOTES[y][x]] = colorWave[colorIndex];
                }
            }
        }
        frames.push(frame);
    }
    return frames;
};

const trail: EffectGenerator = (startNote, colors, settings) => {
    // This is a simplified trail, a real implementation would track mouse movement
    const frames: Layer[] = [];
    const size = settings.size || 4;
    for(let i=0; i<size; i++) {
        const frame = createBlankLayer();
        const color = interpolateColor(colors[0], OFF_COLOR, i / size);
        frame[startNote] = color;
        frames.push(frame);
    }
    return frames;
};

const fireworks: EffectGenerator = (startNote, colors, settings) => {
    const frames: Layer[] = [];
    const size = settings.size || 5;
    const startCoords = getCoordsFromNote(startNote);
    if (!startCoords) return [];

    const particles = Array.from({ length: 8 + size }, () => ({
        angle: Math.random() * 2 * Math.PI,
        speed: Math.random() * 0.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
    }));

    for (let i = 1; i <= size; i++) {
        const frame = createBlankLayer();
        particles.forEach(p => {
            const x = Math.round(startCoords.x + Math.cos(p.angle) * i * p.speed);
            const y = Math.round(startCoords.y + Math.sin(p.angle) * i * p.speed);
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                frame[GRID_NOTES[y][x]] = p.color;
            }
        });
        frames.push(frame);
    }
    frames.push(createBlankLayer());
    return frames;
};

const paintSplash: EffectGenerator = (startNote, colors, settings) => {
    const frames: Layer[] = [];
    const size = settings.size || 4;
    const startCoords = getCoordsFromNote(startNote);
    if (!startCoords) return [];

    const frame = createBlankLayer();
    for (let i = 0; i < size * 5; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const dist = Math.random() * size;
        const x = Math.round(startCoords.x + Math.cos(angle) * dist);
        const y = Math.round(startCoords.y + Math.sin(angle) * dist);

        if (x >= 0 && x < 8 && y >= 0 && y < 8) {
            frame[GRID_NOTES[y][x]] = colors[Math.floor(Math.random() * colors.length)];
        }
    }
    frames.push(frame);
    frames.push(createBlankLayer());
    return frames;
}

const chaser: EffectGenerator = (startNote, colors, settings) => {
    const frames: Layer[] = [];
    const size = settings.size || 8;
    const startCoords = getCoordsFromNote(startNote);
    if (!startCoords) return [];

    for (let i = 0; i < size; i++) {
        const frame = createBlankLayer();
        const x1 = Math.max(0, startCoords.x - i);
        const x2 = Math.min(7, startCoords.x + i);
        const y1 = Math.max(0, startCoords.y - i);
        const y2 = Math.min(7, startCoords.y + i);
        
        for (let x = x1; x <= x2; x++) {
            frame[GRID_NOTES[y1][x]] = colors[0];
            frame[GRID_NOTES[y2][x]] = colors[0];
        }
        for (let y = y1; y <= y2; y++) {
            frame[GRID_NOTES[y][x1]] = colors[0];
            frame[GRID_NOTES[y][x2]] = colors[0];
        }
        frames.push(frame);
    }
    frames.push(createBlankLayer());
    return frames;
}

const strobe: EffectGenerator = (startNote, colors, settings) => {
    const onFrame: Layer = {};
    GRID_NOTES.flat().forEach(note => onFrame[note] = colors[0] || 3);
    const offFrame = createBlankLayer();
    return [onFrame, offFrame, onFrame, offFrame];
};

const pulse: EffectGenerator = (startNote, colors, settings) => {
    const onFrame: Layer = {};
    const mainColor = colors[0] || 3;
    GRID_NOTES.flat().forEach(note => onFrame[note] = mainColor);
    
    const fadeColor = interpolateColor(mainColor, OFF_COLOR, 0.5);
    const fadeFrame: Layer = {};
    GRID_NOTES.flat().forEach(note => fadeFrame[note] = fadeColor);
    
    const offFrame = createBlankLayer();
    return [onFrame, fadeFrame, offFrame];
};


const randomLights: EffectGenerator = (startNote, colors, settings) => {
    const frame = createBlankLayer();
    const numLights = settings.size || 10;
    const notes = GRID_NOTES.flat();
    for (let i = 0; i < numLights; i++) {
        const randomNote = notes[Math.floor(Math.random() * notes.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        frame[randomNote] = randomColor;
    }
    return [frame, createBlankLayer()];
};

const crosshair: EffectGenerator = (startNote, colors, settings) => {
    const frame = createBlankLayer();
    const color = colors[0] || 3;
    const startCoords = getCoordsFromNote(startNote);
    if (!startCoords) return [];

    for (let i = 0; i < 8; i++) {
        // column
        frame[GRID_NOTES[i][startCoords.x]] = color;
        // row
        frame[GRID_NOTES[startCoords.y][i]] = color;
    }

    return [frame, createBlankLayer()];
};

const colorBurst: EffectGenerator = (startNote, colors, settings) => {
    const frames: Layer[] = [];
    const size = settings.size || 5;
    const startCoords = getCoordsFromNote(startNote);
    if (!startCoords) return [];

    for (let i = 0; i < size; i++) {
        const frame = createBlankLayer();
        const progress = i / size;
        const color = interpolateColor(colors[0], colors[1] || OFF_COLOR, progress);

        const x1 = Math.max(0, startCoords.x - i);
        const x2 = Math.min(7, startCoords.x + i);
        const y1 = Math.max(0, startCoords.y - i);
        const y2 = Math.min(7, startCoords.y + i);

        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                frame[GRID_NOTES[y][x]] = color;
            }
        }
        frames.push(frame);
    }
    frames.push(createBlankLayer());
    return frames;
};

const invert: EffectGenerator = (startNote, colors, settings, currentFrame) => {
    const invertedFrame = createBlankLayer();
    const color = colors[0] || 3;
    GRID_NOTES.flat().forEach(note => {
        if ((currentFrame[note] || OFF_COLOR) === OFF_COLOR) {
            invertedFrame[note] = color;
        } else {
            invertedFrame[note] = OFF_COLOR;
        }
    });

    // Flash the inverted state twice, then restore
    return [invertedFrame, currentFrame, invertedFrame];
};

const glitch: EffectGenerator = (startNote, colors, settings, currentFrame) => {
    const intensity = settings.size || 3; // Use size as intensity
    const frame1 = createBlankLayer();
    const frame2 = createBlankLayer();

    for(let y=0; y<8; y++) {
        const shift = Math.floor((Math.random() - 0.5) * intensity);
        for(let x=0; x<8; x++) {
            const sourceNote = GRID_NOTES[y][x];
            const destX = (x + shift + 8) % 8;
            const destNote = GRID_NOTES[y][destX];
            
            if (currentFrame[sourceNote]) {
                frame1[destNote] = colors[Math.floor(Math.random() * colors.length)];
                frame2[destNote] = currentFrame[sourceNote];
            }
        }
    }
    return [frame1, frame2, createBlankLayer()];
};


export const generateInteractiveEffectFrames = (
    effect: string,
    startNote: number,
    colors: readonly number[],
    settings: { speed?: number; size?: number },
    currentFrame: Layer
): Layer[] => {
    switch(effect) {
        case 'ripple': return ripple(startNote, colors, settings, currentFrame);
        case 'trail': return trail(startNote, colors, settings, currentFrame);
        case 'fireworks': return fireworks(startNote, colors, settings, currentFrame);
        case 'paintSplash': return paintSplash(startNote, colors, settings, currentFrame);
        case 'chaser': return chaser(startNote, colors, settings, currentFrame);
        case 'randomLights': return randomLights(startNote, colors, settings, currentFrame);
        case 'strobe': return strobe(startNote, colors, settings, currentFrame);
        case 'crosshair': return crosshair(startNote, colors, settings, currentFrame);
        case 'colorBurst': return colorBurst(startNote, colors, settings, currentFrame);
        case 'invert': return invert(startNote, colors, settings, currentFrame);
        case 'glitch': return glitch(startNote, colors, settings, currentFrame);
        case 'pulse': return pulse(startNote, colors, settings, currentFrame);
        default: return [];
    }
};
