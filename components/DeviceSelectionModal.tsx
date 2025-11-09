
import React from 'react';
import type { LaunchpadDevice } from '../services/midiService';

interface DeviceSelectionModalProps {
  devices: LaunchpadDevice[];
  onSelect: (deviceId: string) => void;
  onCancel: () => void;
}

export const DeviceSelectionModal: React.FC<DeviceSelectionModalProps> = ({ devices, onSelect, onCancel }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700">
        <h2 id="modal-title" className="text-xl font-bold text-white mb-4">
          Select a Launchpad
        </h2>
        <p className="text-gray-400 mb-6">Multiple Launchpad MK2 devices were found. Please choose which one you would like to connect to.</p>
        <div className="space-y-3 mb-6">
          {devices.map((device, index) => (
            <button
              key={device.id}
              onClick={() => onSelect(device.id)}
              className="w-full text-left px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-colors"
            >
              {`${device.name} (${index + 1})`}
            </button>
          ))}
        </div>
        <div className="text-right">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-md shadow-sm hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
