
import { LAUNCHPAD_COLOR_MAP_HEX, GRID_NOTES, OFF_COLOR } from '../constants';

// FIX: Add createBlankLayer utility function to be shared across the app.
export const createBlankLayer = (): Record<number, number> => {
  const layer: Record<number, number> = {};
  GRID_NOTES.flat().forEach(note => {
    layer[note] = OFF_COLOR;
  });
  return layer;
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Calculates the squared Euclidean distance between two RGB colors.
// Squared distance is used to avoid expensive square root operations, as we only need to compare distances.
const colorDistanceSquared = (rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number => {
  const dR = rgb1.r - rgb2.r;
  const dG = rgb1.g - rgb2.g;
  const dB = rgb1.b - rgb2.b;
  return dR * dR + dG * dG + dB * dB;
};

export const findClosestColorCode = (targetHex: string): number => {
  const targetRgb = hexToRgb(targetHex);
  if (!targetRgb) {
    return 0; // Return OFF_COLOR if hex is invalid
  }

  let closestCode = 0;
  let minDistance = Infinity;

  for (const codeStr in LAUNCHPAD_COLOR_MAP_HEX) {
    const code = parseInt(codeStr, 10);
    // Skip black/off color in comparison unless the target is very dark
    if (code === 0) continue;

    const paletteHex = LAUNCHPAD_COLOR_MAP_HEX[code];
    const paletteRgb = hexToRgb(paletteHex);

    if (paletteRgb) {
      const distance = colorDistanceSquared(targetRgb, paletteRgb);
      if (distance < minDistance) {
        minDistance = distance;
        closestCode = code;
      }
    }
  }

  return closestCode;
};

// FIX: Added missing interpolateColor function and helpers to resolve module import error.
const componentToHex = (c: number): string => {
  const hex = Math.round(c).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

export const interpolateColor = (fromCode: number, toCode: number, progress: number): number => {
  if (progress <= 0) return fromCode;
  if (progress >= 1) return toCode;
  if (fromCode === toCode) return fromCode;

  const fromHex = LAUNCHPAD_COLOR_MAP_HEX[fromCode];
  const toHex = LAUNCHPAD_COLOR_MAP_HEX[toCode];

  if (!fromHex || !toHex) return toCode;

  const fromRgb = hexToRgb(fromHex);
  const toRgb = hexToRgb(toHex);

  if (!fromRgb || !toRgb) return toCode;

  const r = fromRgb.r + (toRgb.r - fromRgb.r) * progress;
  const g = fromRgb.g + (toRgb.g - fromRgb.g) * progress;
  const b = fromRgb.b + (toRgb.b - fromRgb.b) * progress;

  const interpolatedHex = rgbToHex(r, g, b);
  return findClosestColorCode(interpolatedHex);
};