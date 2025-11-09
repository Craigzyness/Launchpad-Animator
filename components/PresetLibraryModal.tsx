import React, { useState, useMemo } from 'react';
// FIX: The preset types are defined in App.tsx, not patterns.ts
import type { AnimationPreset, InteractivePreset } from '../App';

type Preset = AnimationPreset | InteractivePreset;

interface PresetLibraryModalProps {
  title: string;
  presets: readonly Preset[];
  onClose: () => void;
  onSelect: (preset: Preset) => void;
}

export const PresetLibraryModal: React.FC<PresetLibraryModalProps> = ({ title, presets, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPresets = useMemo(() => {
    return presets.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [presets, searchTerm]);
  
  const groupedPresets = useMemo(() => {
      const groups: Record<string, Preset[]> = {};
      filteredPresets.forEach(p => {
          if (!groups[p.category]) {
              groups[p.category] = [];
          }
          groups[p.category].push(p);
      });
      return groups;
  }, [filteredPresets]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <input
            type="text"
            placeholder="Search presets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white mt-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div className="p-4 overflow-y-auto">
            {/* FIX: Changed from Object.entries to Object.keys to avoid type inference issue */}
            {Object.keys(groupedPresets).map((category) => {
                const presetsInCategory = groupedPresets[category];
                return (
                <div key={category} className="mb-6">
                    <h3 className="text-lg font-semibold text-indigo-400 mb-3">{category}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {presetsInCategory.map(preset => (
                            <button
                                key={preset.name}
                                onClick={() => onSelect(preset)}
                                className="px-3 py-2 text-sm font-semibold text-white bg-gray-700 rounded-md shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-colors text-center"
                            >
                                {preset.name}
                            </button>
                        ))}
                    </div>
                </div>
            )})}
            {filteredPresets.length === 0 && (
                <p className="text-gray-400 text-center">No presets found.</p>
            )}
        </div>
        <div className="p-4 border-t border-gray-700 text-right">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">Close</button>
        </div>
      </div>
    </div>
  );
};
