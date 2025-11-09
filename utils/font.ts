import { PIXEL_FONT, GRID_NOTES, DEFAULT_FRAME_DURATION } from '../constants';
import { createBlankLayer } from './colorUtils';
import { Layer, Frame } from '../App';

// ... (keep existing generateMarqueeFrames function)
export const generateMarqueeFrames = (text: string, color: number): Layer[] => {
  // ... implementation
  if (!text) return [];

  const charSpacing = 1;
  const charHeight = 5;
  const startY = Math.floor((8 - charHeight) / 2); 

  const pixelMap: number[][] = [];
  text.toUpperCase().split('').forEach(char => {
    const fontChar = PIXEL_FONT[char] || PIXEL_FONT[' '];
    if (fontChar) {
      const charWidth = fontChar[0].length;
      for (let x = 0; x < charWidth; x++) {
        const col: number[] = [];
        for (let y = 0; y < charHeight; y++) {
          col.push(fontChar[y][x]);
        }
        pixelMap.push(col);
      }
      for (let i = 0; i < charSpacing; i++) {
        pixelMap.push(Array(charHeight).fill(0));
      }
    }
  });

  const frames: Layer[] = [];
  const totalWidth = pixelMap.length;

  for (let scrollX = -8; scrollX < totalWidth; scrollX++) {
    const frame = createBlankLayer();
    for (let gridX = 0; gridX < 8; gridX++) {
      const mapX = scrollX + gridX;
      if (mapX >= 0 && mapX < totalWidth) {
        for (let gridY = 0; gridY < charHeight; gridY++) {
          if (pixelMap[mapX][gridY] === 1) {
            const note = GRID_NOTES[startY + gridY][gridX];
            if (note) {
              frame[note] = color;
            }
          }
        }
      }
    }
    frames.push(frame);
  }

  return frames;
};


/**
 * Generates frames for a "typing" text effect.
 */
export const renderTypingTextToFrames = (text: string, color: number, charsPerSecond: number): Frame[] => {
    if (!text) return [];
    
    const frames: Frame[] = [];
    const charDuration = 1000 / charsPerSecond;
    const cursorColor = color;
    let currentFrame = createBlankLayer();

    const drawText = (txt: string, includeCursor: boolean): Layer => {
        const frame = createBlankLayer();
        let currentX = 0;
        let currentY = 1;
        
        txt.toUpperCase().split('').forEach(char => {
            const fontChar = PIXEL_FONT[char] || PIXEL_FONT[' '];
            const charWidth = fontChar[0].length + 1; // +1 for spacing

            if (currentX + charWidth > 8) {
                currentX = 0;
                currentY += 6; // New line
            }
            if(currentY > 7) return;

            for(let y=0; y<5; y++) {
                for(let x=0; x<fontChar[0].length; x++) {
                    if (fontChar[y][x] === 1) {
                        const note = GRID_NOTES[currentY + y]?.[currentX + x];
                        if(note) frame[note] = color;
                    }
                }
            }
            currentX += charWidth;
        });

        if (includeCursor) {
            if (currentX > 7) {
                currentX = 0;
                currentY += 6;
            }
             if(currentY <= 7) {
                for(let y=0; y<5; y++) {
                    const note = GRID_NOTES[currentY + y]?.[currentX];
                    if(note) frame[note] = cursorColor;
                }
             }
        }
        return frame;
    };

    for(let i=0; i < text.length; i++) {
        const typedText = text.substring(0, i + 1);
        // Frame with text and cursor
        frames.push({
            layer: drawText(typedText, true),
            duration: charDuration,
        });
        // Frame with just text (for cursor blink)
        frames.push({
            layer: drawText(typedText, false),
            duration: charDuration / 2,
        });
    }

    // Final frame with blinking cursor
    const finalText = text;
    for (let i = 0; i < 4; i++) {
        frames.push({
            layer: drawText(finalText, i % 2 === 0),
            duration: 400
        });
    }

    return frames;
};