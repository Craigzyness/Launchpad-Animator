import React from 'react';
import { Tooltip } from './Tooltip';
import { MIN_FPS, MAX_FPS } from '../constants';

interface AnimationControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  fps: number;
  onFpsChange: (fps: number) => void;
  onAddFrame: () => void;
  onDeleteFrame: () => void;
  onDuplicateFrame: () => void;
  onClearFrame: () => void;
  onClearAnimation: () => void;
  onClearAll: () => void;
  frameCount: number;
  currentFrameIndex: number;
  onionSkinEnabled: boolean;
  onToggleOnionSkin: () => void;
  onTransformClick: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onRedo: () => void;
  canRedo: boolean;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  isPlaying,
  onTogglePlay,
  fps,
  onFpsChange,
  onAddFrame,
  onDeleteFrame,
  onDuplicateFrame,
  onClearFrame,
  onClearAnimation,
  onClearAll,
  frameCount,
  currentFrameIndex,
  onionSkinEnabled,
  onToggleOnionSkin,
  onTransformClick,
  onUndo,
  canUndo,
  onRedo,
  canRedo
}) => {
  return (
    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Tooltip content="Undo (Ctrl+Z)">
            <button onClick={onUndo} disabled={!canUndo} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </button>
        </Tooltip>
        <Tooltip content="Redo (Ctrl+Y)">
            <button onClick={onRedo} disabled={!canRedo} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a5 5 0 00-5 5v2a1 1 0 11-2 0v-2a7 7 0 017-7h5.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
        </Tooltip>
        <div className="w-px h-6 bg-gray-600 mx-2"></div>
        <Tooltip content={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
          <button onClick={onTogglePlay} className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors">
            {isPlaying ? 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> :
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            }
          </button>
        </Tooltip>
        <div className="flex items-center gap-2">
          <label htmlFor="fps-slider" className="text-sm font-medium text-gray-300">Global FPS</label>
          <input id="fps-slider" type="range" min={MIN_FPS} max={MAX_FPS} value={fps} onChange={(e) => onFpsChange(Number(e.target.value))} className="w-32" />
          <span className="font-mono text-sm w-6 text-center text-gray-400">{fps}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
         <Tooltip content="Add Frame">
          <button onClick={onAddFrame} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          </button>
        </Tooltip>
        <Tooltip content="Duplicate Frame">
          <button onClick={onDuplicateFrame} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" /><path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H5z" /></svg>
          </button>
        </Tooltip>
        <Tooltip content="Delete Frame">
          <button onClick={onDeleteFrame} disabled={frameCount <= 1} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          </button>
        </Tooltip>
        <div className="w-px h-6 bg-gray-600 mx-2"></div>
        <Tooltip content="Transform Current Frame">
            <button onClick={onTransformClick} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 4a1 1 0 00-1 1v1.586l-1.707-1.707a1 1 0 00-1.414 1.414L7.586 8H6a1 1 0 00-1 1 1 1 0 001 1h1.586l-1.707 1.707a1 1 0 001.414 1.414L9 12.414V14a1 1 0 002 0v-1.586l1.707 1.707a1 1 0 001.414-1.414L12.414 11H14a1 1 0 001-1 1 1 0 00-1-1h-1.586l1.707-1.707a1 1 0 00-1.414-1.414L11 5.586V4a1 1 0 00-1-1z" /></svg>
            </button>
        </Tooltip>
         <Tooltip content="Clear Current Frame">
          <button onClick={onClearFrame} className="p-2 bg-red-600 rounded-md hover:bg-red-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </Tooltip>
        <Tooltip content="Clear All Frames">
          <button onClick={onClearAnimation} className="p-2 bg-red-700 rounded-md hover:bg-red-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 2.293a1 1 0 011.414 1.414l-13 13A1 1 0 014 18H3a1 1 0 01-1-1v-1a1 1 0 01.293-.707l13-13zM15 4.414l-2.586-2.586a1 1 0 00-1.414 0L2 10.828V13h2.172L15 4.414z"/>
            </svg>
          </button>
        </Tooltip>
        <Tooltip content="Clear All (Reset Project)">
          <button onClick={onClearAll} className="p-2 bg-red-800 rounded-md hover:bg-red-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          </button>
        </Tooltip>
        <Tooltip content={onionSkinEnabled ? "Disable Onion Skin" : "Enable Onion Skin"}>
            <button onClick={onToggleOnionSkin} className={`p-2 rounded-md transition-colors ${onionSkinEnabled ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 4a1 1 0 000 2 1 1 0 01-1 1 1 1 0 100 2 1 1 0 011 1 1 1 0 100 2 1 1 0 01-1 1 1 1 0 100 2 1 1 0 011 1v1a1 1 0 102 0v-1a1 1 0 011-1 1 1 0 100-2 1 1 0 01-1-1 1 1 0 100-2 1 1 0 011-1 1 1 0 100-2 1 1 0 01-1-1V4a1 1 0 10-2 0v1a1 1 0 01-1 1z" clipRule="evenodd" /></svg>
            </button>
        </Tooltip>
      </div>
    </div>
  );
};