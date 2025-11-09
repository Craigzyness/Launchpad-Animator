import React from 'react';

interface GifExportModalProps {
  progress: number;
}

export const GifExportModal: React.FC<GifExportModalProps> = ({ progress }) => {
  const percent = Math.round(progress * 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-700">
        <h2 id="modal-title" className="text-lg font-bold text-white mb-4">
          Exporting GIF...
        </h2>
        <div className="w-full bg-gray-700 rounded-full h-4">
          <div
            className="bg-indigo-600 h-4 rounded-full transition-all duration-150"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
        <p className="text-center text-gray-300 mt-3 font-mono">{percent}%</p>
      </div>
    </div>
  );
};
