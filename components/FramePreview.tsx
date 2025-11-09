import React from 'react';
import { GRID_NOTES } from '../constants';
import { Frame } from '../App';

interface FramePreviewProps {
  frame: Frame;
  colorMap: Record<number, string>;
  isActive: boolean;
  onClick: () => void;
  index: number;
  onDurationChange: (duration: number) => void;
}

export const FramePreview: React.FC<FramePreviewProps> = React.memo(({ frame, colorMap, isActive, onClick, index, onDurationChange }) => {
  const mergedFrame = frame.layer;
  const activeClass = isActive ? 'ring-2 ring-indigo-500' : 'ring-1 ring-gray-700';
  
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) {
        onDurationChange(val);
      }
  };

  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={onClick}>
       <span className={`text-xs ${isActive ? 'text-white font-semibold' : 'text-gray-400'}`}>
        {index + 1}
      </span>
      <div
        className={`relative grid grid-cols-8 gap-px p-1 bg-black rounded-md aspect-square w-20 shadow-inner ${activeClass}`}
        aria-label={`Frame ${index + 1}`}
      >
        {GRID_NOTES.flat().map((note) => {
          const colorCode = mergedFrame[note] || 0;
          const colorHex = colorMap[colorCode] || '#000000';
          return (
            <div
              key={note}
              className="w-full h-full rounded-sm"
              style={{ backgroundColor: colorHex }}
            />
          );
        })}
      </div>
      <input 
        type="number"
        value={frame.duration}
        onChange={handleDurationChange}
        onClick={(e) => e.stopPropagation()} // Prevent frame selection when clicking input
        className="w-16 text-xs text-center bg-gray-700 rounded-sm border-none font-mono text-indigo-400 focus:ring-1 focus:ring-indigo-500"
        title="Frame Duration (ms)"
      />
    </div>
  );
});