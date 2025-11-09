
import { Frame, Tool, Symmetry, Layer } from '../App';
import { GRID_NOTES, OFF_COLOR } from '../constants';

const getCoordsFromNote = (note: number): { x: number, y: number } | null => {
    for (let y = 0; y < GRID_NOTES.length; y++) {
        const x = GRID_NOTES[y].indexOf(note);
        if (x !== -1) return { x, y };
    }
    return null;
};

const getNoteFromCoords = (x: number, y: number): number | null => {
    if (y >= 0 && y < 8 && x >= 0 && x < 8) return GRID_NOTES[y][x];
    return null;
}

const drawPixel = (layer: Layer, note: number, color: number, symmetry: Symmetry) => {
    layer[note] = color;
    const coords = getCoordsFromNote(note);
    if (!coords) return;

    if (symmetry === 'vertical') {
        const mirroredNote = getNoteFromCoords(7 - coords.x, coords.y);
        if (mirroredNote) layer[mirroredNote] = color;
    } else if (symmetry === 'horizontal') {
        const mirroredNote = getNoteFromCoords(coords.x, 7 - coords.y);
        if (mirroredNote) layer[mirroredNote] = color;
    }
};

const drawLine = (layer: Layer, startNote: number, endNote: number, color: number, symmetry: Symmetry) => {
    const start = getCoordsFromNote(startNote);
    const end = getCoordsFromNote(endNote);
    if (!start || !end) return;

    let x1 = start.x, y1 = start.y, x2 = end.x, y2 = end.y;
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = (x1 < x2) ? 1 : -1;
    const sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        const note = getNoteFromCoords(x1, y1);
        if (note) drawPixel(layer, note, color, symmetry);

        if ((x1 === x2) && (y1 === y2)) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x1 += sx; }
        if (e2 < dx) { err += dx; y1 += sy; }
    }
};

const drawGradientLine = (layer: Layer, startNote: number, endNote: number, palette: { name: string; code: number }[], symmetry: Symmetry) => {
    const start = getCoordsFromNote(startNote);
    const end = getCoordsFromNote(endNote);
    if (!start || !end || palette.length === 0) return;

    const points: {x: number, y: number}[] = [];
    let x1 = start.x, y1 = start.y, x2 = end.x, y2 = end.y;
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = (x1 < x2) ? 1 : -1;
    const sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        points.push({ x: x1, y: y1 });
        if ((x1 === x2) && (y1 === y2)) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x1 += sx; }
        if (e2 < dx) { err += dx; y1 += sy; }
    }

    points.forEach((p, i) => {
        const progress = points.length <= 1 ? 0 : i / (points.length - 1);
        const colorIndex = Math.floor(progress * (palette.length - 1));
        const color = palette[colorIndex].code;
        const note = getNoteFromCoords(p.x, p.y);
        if (note) drawPixel(layer, note, color, symmetry);
    });
};


const drawRect = (layer: Layer, startNote: number, endNote: number, color: number, symmetry: Symmetry, outline: boolean) => {
    const start = getCoordsFromNote(startNote);
    const end = getCoordsFromNote(endNote);
    if (!start || !end) return;

    const x1 = Math.min(start.x, end.x);
    const x2 = Math.max(start.x, end.x);
    const y1 = Math.min(start.y, end.y);
    const y2 = Math.max(start.y, end.y);

    for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
            if (outline && (y > y1 && y < y2 && x > x1 && x < x2)) continue;
            const note = getNoteFromCoords(x, y);
            if (note) drawPixel(layer, note, color, symmetry);
        }
    }
};

const drawCircle = (layer: Layer, startNote: number, endNote: number, color: number, symmetry: Symmetry) => {
    const start = getCoordsFromNote(startNote);
    const end = getCoordsFromNote(endNote);
    if (!start || !end) return;
    
    const radius = Math.round(Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)));
    let x = radius, y = 0;
    let err = 0;

    while (x >= y) {
        const points = [
            {x: start.x + x, y: start.y + y}, {x: start.x + y, y: start.y + x},
            {x: start.x - y, y: start.y + x}, {x: start.x - x, y: start.y + y},
            {x: start.x - x, y: start.y - y}, {x: start.x - y, y: start.y - x},
            {x: start.x + y, y: start.y - x}, {x: start.x + x, y: start.y - y},
        ];
        points.forEach(p => {
            const note = getNoteFromCoords(p.x, p.y);
            if (note) drawPixel(layer, note, color, symmetry);
        });

        if (err <= 0) { y += 1; err += 2*y + 1; }
        if (err > 0) { x -= 1; err -= 2*x + 1; }
    }
};

const floodFill = (layer: Layer, note: number, color: number, symmetry: Symmetry) => {
    const startCoords = getCoordsFromNote(note);
    if (!startCoords) return;
    const targetColor = layer[note] || OFF_COLOR;
    if (targetColor === color) return;

    const queue = [startCoords];
    const visited = new Set([note]);

    while(queue.length > 0) {
        const {x, y} = queue.shift()!;
        const currentNote = getNoteFromCoords(x, y)!;
        drawPixel(layer, currentNote, color, symmetry);
        
        [{dx:0,dy:1},{dx:0,dy:-1},{dx:1,dy:0},{dx:-1,dy:0}].forEach(({dx, dy}) => {
            const nextX = x + dx;
            const nextY = y + dy;
            const nextNote = getNoteFromCoords(nextX, nextY);
            if(nextNote && !visited.has(nextNote) && (layer[nextNote] || OFF_COLOR) === targetColor) {
                visited.add(nextNote);
                queue.push({x: nextX, y: nextY});
            }
        });
    }
};

interface ToolActionParams {
    tool: Tool;
    note: number;
    layer: Layer;
    color: number;
    symmetry: Symmetry;
    startNote?: number | null;
    palette: { name: string; code: number }[];
}

export const performToolAction = (params: ToolActionParams): Layer | null => {
    const { tool, note, layer, color, symmetry, startNote, palette } = params;
    
    const activeLayer = { ...layer };

    switch (tool) {
        case 'draw':
        case 'erase':
            drawPixel(activeLayer, note, tool === 'erase' ? OFF_COLOR : color, symmetry);
            break;
        case 'fill':
            floodFill(activeLayer, note, color, symmetry);
            break;
        case 'line':
            if (startNote) drawLine(activeLayer, startNote, note, color, symmetry);
            break;
        case 'gradient':
            if (startNote) drawGradientLine(activeLayer, startNote, note, palette, symmetry);
            break;
        case 'rect':
            if (startNote) drawRect(activeLayer, startNote, note, color, symmetry, false);
            break;
        case 'rect_outline':
            if (startNote) drawRect(activeLayer, startNote, note, color, symmetry, true);
            break;
        case 'circle':
             if (startNote) drawCircle(activeLayer, startNote, note, color, symmetry);
            break;
        case 'colorCycle':
            const currentColor = activeLayer[note] || OFF_COLOR;
            // A real implementation needs the palette
            if (currentColor !== OFF_COLOR) activeLayer[note] = (currentColor + 1) % 127 || 1;
            else drawPixel(activeLayer, note, color, symmetry);
            break;
        case 'eyedropper':
        case 'select':
            return null; 
        default:
            return null;
    }

    return activeLayer;
};

export const isShapeTool = (tool: Tool): boolean => ['line', 'rect', 'rect_outline', 'circle', 'gradient'].includes(tool);
export const isContinuousTool = (tool: Tool): boolean => ['draw', 'erase'].includes(tool);

// --- Animation Modifiers ---
export type TransformType = 'rotate90cw' | 'rotate180' | 'rotate90ccw' | 'flipH' | 'flipV';

export const transformFrame = (layer: Layer, transformType: TransformType): Layer => {
    let transformFn: (x: number, y: number) => { nx: number, ny: number };

    switch (transformType) {
        case 'rotate90cw':
            transformFn = (x, y) => ({ nx: 7 - y, ny: x });
            break;
        case 'rotate180':
            transformFn = (x, y) => ({ nx: 7 - x, ny: 7 - y });
            break;
        case 'rotate90ccw':
            transformFn = (x, y) => ({ nx: y, ny: 7 - x });
            break;
        case 'flipH':
            transformFn = (x, y) => ({ nx: 7 - x, ny: y });
            break;
        case 'flipV':
            transformFn = (x, y) => ({ nx: x, ny: 7 - y });
            break;
    }

    const newLayer: Layer = {};
    GRID_NOTES.flat().forEach(note => newLayer[note] = OFF_COLOR);

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const sourceNote = getNoteFromCoords(x, y)!;
            if (layer[sourceNote] !== undefined && layer[sourceNote] !== OFF_COLOR) {
                const { nx, ny } = transformFn(x, y);
                const destNote = getNoteFromCoords(nx, ny);
                if (destNote) {
                    newLayer[destNote] = layer[sourceNote];
                }
            }
        }
    }
    return newLayer;
};


export const invertFrameModifier = (frame: Frame, selectedColor: number): Frame => {
    const newLayer = { ...frame.layer };
    
    GRID_NOTES.flat().forEach(note => {
        newLayer[note] = frame.layer[note] === OFF_COLOR ? selectedColor : OFF_COLOR;
    });
    return { ...frame, layer: newLayer };
};
