import React, { useState } from 'react';
import { Tooltip } from './Tooltip';

interface MarqueeTextModalProps {
  onClose: () => void;
  onGenerate: (text: string, color: number, speed: number) => void;
  selectedColor: number;
  palette: { name: string; code: number }[];
  colorMap: Record<number, string>;
}

export const MarqueeTextModal: React.FC<MarqueeTextModalProps> = ({ onClose, onGenerate, selectedColor, palette, colorMap }) => {
  const [text, setText] = useState('HELLO WORLD');
  const [color, setColor] = useState(selectedColor);
  const [speed, setSpeed] = useState(8);

  const handleGenerate = () => {
    if (text.trim()) {
      onGenerate(text, color, speed);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-700">
        <h2 id="modal-title" className="text-xl font-bold text-white mb-4">
          Marquee Text Generator
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="text-input" className="block text-sm font-medium text-gray-300 mb-1">Text</label>
            <input
              id="text-input"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {palette.map(({ name, code }) => (
                <Tooltip content={name} key={code}>
                  <button
                    onClick={() => setColor(code)}
                    className={`w-8 h-8 rounded-full transition-all ${color === code ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}
                    style={{ backgroundColor: colorMap[code] }}
                  />
                </Tooltip>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="speed-slider" className="text-sm font-medium text-gray-300">Speed (FPS)</label>
            <input id="speed-slider" type="range" min="1" max="24" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full" />
            <span className="font-mono">{speed}</span>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">Cancel</button>
          <button onClick={handleGenerate} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500">Generate Frames</button>
        </div>
      </div>
    </div>
  );
};
