
import React from 'react';
import { Pad } from './Pad';
import { GRID_NOTES, OFF_COLOR } from '../constants';
import './LaunchpadGrid.css';

interface LaunchpadGridProps {
  padColors: Record<number, number>;
  onPadMouseDown: (note: number, e: React.MouseEvent) => void;
  onPadMouseOver: (note: number) => void;
  colorMap: Record<number, string>;
  onionSkinFrame: Record<number, number> | null;
  lastMidiNote: number | null;
  isEffectArmed: boolean;
}

export const LaunchpadGrid: React.FC<LaunchpadGridProps> = ({ padColors, onPadMouseDown, onPadMouseOver, colorMap, onionSkinFrame, lastMidiNote, isEffectArmed }) => {
  // Prevent default drag behavior to improve drawing experience
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const armedClass = isEffectArmed ? 'effect-armed-glow' : '';

  return (
    <div 
      id="launchpad-grid"
      className={`relative grid grid-cols-8 gap-2 p-2 bg-black rounded-lg aspect-square w-full max-w-lg shadow-inner select-none transition-shadow duration-300 ${armedClass}`}
      onDragStart={handleDragStart}
    >
      {GRID_NOTES.flat().map((note) => (
        <Pad
          key={note}
          note={note}
          colorCode={padColors[note] || 0}
          onMouseDown={onPadMouseDown}
          onMouseOver={onPadMouseOver}
          colorMap={colorMap}
          isMidiActive={note === lastMidiNote}
        />
      ))}
      {onionSkinFrame && (
        <div className="absolute inset-0 grid grid-cols-8 gap-2 p-2 pointer-events-none">
            {GRID_NOTES.flat().map(note => {
                const colorCode = onionSkinFrame[note] || OFF_COLOR;
                if (colorCode === OFF_COLOR) return null;
                const colorHex = colorMap[colorCode];
                return (
                    <div
                        key={`onion-${note}`}
                        className="w-full h-full rounded-md opacity-25"
                        style={{ backgroundColor: colorHex }}
                    />
                )
            })}
        </div>
      )}
    </div>
  );
};
