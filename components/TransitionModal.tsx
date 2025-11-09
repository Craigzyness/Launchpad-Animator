
import React, { useState } from 'react';
import { EasingFunction } from '../App';

interface TransitionModalProps {
  onClose: () => void;
  onGenerate: (numFrames: number, easing: EasingFunction) => void;
}

const easingOptions: { id: EasingFunction, name: string }[] = [
    { id: 'easeInOutQuad', name: 'Ease In & Out' },
    { id: 'linear', name: 'Linear' },
    { id: 'easeInQuad', name: 'Ease In' },
    { id: 'easeOutQuad', name: 'Ease Out' },
];

export const TransitionModal: React.FC<TransitionModalProps> = ({ onClose, onGenerate }) => {
  const [numFrames, setNumFrames] = useState(5);
  const [easing, setEasing] = useState<EasingFunction>('easeInOutQuad');

  const handleGenerate = () => {
    if (numFrames > 0) {
      onGenerate(numFrames, easing);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-700">
        <h2 id="modal-title" className="text-xl font-bold text-white mb-6">
          Create Transition
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label htmlFor="frames-slider" className="text-sm font-medium text-gray-300 whitespace-nowrap">Frames to add:</label>
            <input id="frames-slider" type="range" min="1" max="20" value={numFrames} onChange={(e) => setNumFrames(Number(e.target.value))} className="w-full" />
            <span className="font-mono w-8 text-center">{numFrames}</span>
          </div>
          <div>
            <label htmlFor="easing-select" className="block text-sm font-medium text-gray-300 mb-1">Easing Function</label>
            <select
              id="easing-select"
              value={easing}
              onChange={(e) => setEasing(e.target.value as EasingFunction)}
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {easingOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">Cancel</button>
          <button onClick={handleGenerate} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500">Generate</button>
        </div>
      </div>
    </div>
  );
};
