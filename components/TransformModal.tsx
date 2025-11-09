
import React from 'react';
import { Tooltip } from './Tooltip';
import { TransformType } from '../services/drawingService';

interface TransformModalProps {
  onTransform: (type: TransformType) => void;
  onClose: () => void;
}

const RotateCwIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l-5 2 15-7-7 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 15a6 6 0 100-12 6 6 0 000 12z" /></svg>;
const RotateCcwIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15l-2-5 6-6 5 2-7 15-2-6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 9a6 6 0 100 12 6 6 0 000-12z" /></svg>;
const Rotate180Icon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5" /><path strokeLinecap="round" strokeLinejoin="round" d="M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 9a9 9 0 0114.65-5.35L20 5" /><path strokeLinecap="round" strokeLinejoin="round" d="M20 15a9 9 0 01-14.65 5.35L4 19" /></svg>;
const FlipHIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-4m0-4V3M4 12h16M4 4l8 8 8-8" /></svg>;
const FlipVIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4m4 0h10M4 4v16M20 4l-8 8-8-8" /></svg>;


export const TransformModal: React.FC<TransformModalProps> = ({ onTransform, onClose }) => {
    const transforms: { type: TransformType, label: string, icon: React.ReactElement }[] = [
        { type: 'rotate90cw', label: 'Rotate 90° CW', icon: <RotateCwIcon /> },
        { type: 'rotate90ccw', label: 'Rotate 90° CCW', icon: <RotateCcwIcon /> },
        { type: 'rotate180', label: 'Rotate 180°', icon: <Rotate180Icon /> },
        { type: 'flipH', label: 'Flip Horizontal', icon: <FlipHIcon /> },
        { type: 'flipV', label: 'Flip Vertical', icon: <FlipVIcon /> },
    ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-6 text-center">Transform Current Frame</h2>
        <div className="grid grid-cols-3 gap-3">
            {transforms.map(({ type, label, icon }) => (
                <Tooltip content={label} key={type} position="bottom">
                    <button onClick={() => onTransform(type)} className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors text-gray-300 aspect-square">
                        {icon}
                        <span className="text-xs mt-2 text-center">{label}</span>
                    </button>
                </Tooltip>
            ))}
            {/* Empty div to push the last item to the center if there are 5 items */}
            <div></div> 
        </div>
         <div className="mt-8 text-center">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">Close</button>
        </div>
      </div>
    </div>
  );
};
