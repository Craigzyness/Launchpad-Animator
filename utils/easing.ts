
import { interpolateColor, createBlankLayer } from './colorUtils';
import { EasingFunction as EasingType, Layer } from '../App';

type EasingFunction = (t: number) => number;

export const linear: EasingFunction = (t) => t;
export const easeInQuad: EasingFunction = (t) => t * t;
export const easeOutQuad: EasingFunction = (t) => t * (2 - t);
export const easeInOutQuad: EasingFunction = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

const easingFunctions: Record<EasingType, EasingFunction> = {
    linear,
    easeInQuad,
    easeOutQuad,
    easeInOutQuad,
};


/**
 * Generates transition frames between two frames using an easing function.
 * @param frameA The starting frame's color data.
 * @param frameB The ending frame's color data.
 * @param numFrames The number of transition frames to generate.
 * @param easingFn The easing function to use for interpolation.
 * @returns An array of transition frames.
 */
export const createTransitionFrames = (
  frameA: Layer,
  frameB: Layer,
  numFrames: number,
  easingType: EasingType = 'easeInOutQuad'
): Layer[] => {
  if (numFrames <= 0) return [];
  
  const easingFn = easingFunctions[easingType];
  const frames: Layer[] = [];
  const allNotes = Array.from(new Set([...Object.keys(frameA), ...Object.keys(frameB)])).map(Number);

  for (let i = 1; i <= numFrames; i++) {
    const progress = easingFn(i / (numFrames + 1));
    const transitionFrame = createBlankLayer();

    allNotes.forEach(note => {
      const colorA = frameA[note] || 0;
      const colorB = frameB[note] || 0;
      transitionFrame[note] = interpolateColor(colorA, colorB, progress);
    });

    frames.push(transitionFrame);
  }

  return frames;
};
