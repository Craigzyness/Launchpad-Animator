import React from 'react';
import { Tooltip } from './Tooltip';

interface PatternEditorProps {
  title: string;
  presetName: string;
  colors: readonly number[];
  onColorChange: (index: number, newColorCode: number) => void;
  onAddColor: () => void;
  onRemoveColor: (index: number) => void;
  selectedColor: number;
  colorMap: Record<number, string>;
}

export const PatternEditor: React.FC<PatternEditorProps> = ({
  title,
  presetName,
  colors,
  onColorChange,
  onAddColor,
  onRemoveColor,
  selectedColor,
  colorMap
}) => {
  return (
    <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">
        {title}: <span className="text-white font-semibold">{presetName}</span>
      </h3>
      <div className="flex flex-wrap items-center gap-2">
        {colors.map((code, index) => (
          <div key={index} className="relative group">
            <Tooltip content="Replace with selected color">
              <button
                onClick={() => onColorChange(index, selectedColor)}
                className="w-7 h-7 rounded-full transition-all ring-1 ring-white/20 hover:ring-2 hover:ring-white"
                style={{ backgroundColor: colorMap[code] || '#000' }}
              />
            </Tooltip>
            {colors.length > 1 && (
              <Tooltip content="Remove color">
                <button
                  onClick={() => onRemoveColor(index)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </Tooltip>
            )}
          </div>
        ))}
        <Tooltip content="Add selected color">
          <button
            onClick={onAddColor}
            className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-600 ring-1 ring-white/20"
          >
            +
          </button>
        </Tooltip>
      </div>
    </div>
  );
};
