
import React, { useRef } from 'react';
import { Tooltip } from './Tooltip';

interface SaveLoadControlsProps {
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSave: () => void;
  onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportGif: () => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
}

const ConnectIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const DisconnectIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M12 10.75A4.5 4.5 0 1012 2a4.5 4.5 0 000 8.75z" /></svg>;
const ExportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const SaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.5 2.5a.5.5 0 01.5.5v2.5H10a.5.5 0 010 1H8v2.5a.5.5 0 01-1 0V6H4.5a.5.5 0 010-1H7V2.5a.5.5 0 01.5-.5z" /><path d="M4.5 5V2.5A2.5 2.5 0 017 0h6a2.5 2.5 0 012.5 2.5v11A2.5 2.5 0 0113 16H7a2.5 2.5 0 01-2.5-2.5V5z" /></svg>;
const LoadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm2 2a1 1 0 00-1 1v6a1 1 0 001 1h8a1 1 0 001-1V7a1 1 0 00-1-1H6z" clipRule="evenodd" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export const SaveLoadControls: React.FC<SaveLoadControlsProps> = ({ isConnected, isConnecting, onConnect, onDisconnect, onSave, onLoad, onExportGif, projectName, onProjectNameChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleLoadClick = () => fileInputRef.current?.click();

  return (
    <div className="p-2 bg-gray-900/50 rounded-lg border border-gray-700 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white tracking-wider font-mono hidden md:block">Launchpad Animator</h1>
         <input 
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            className="w-full md:w-64 bg-gray-700/50 border border-gray-600 rounded-md py-1 px-2 text-white placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm"
            placeholder="Project Name"
        />
      </div>
      <div className="flex items-center gap-2">
        <Tooltip content="Save Project">
            <button onClick={onSave} className="p-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors">
                <SaveIcon />
            </button>
        </Tooltip>
        <Tooltip content="Load Project">
            <button onClick={handleLoadClick} className="p-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors">
                <LoadIcon />
                <input type="file" accept=".json" ref={fileInputRef} onChange={onLoad} className="hidden" />
            </button>
        </Tooltip>
        <Tooltip content="Export as GIF">
          <button onClick={onExportGif} className="p-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors">
            <ExportIcon />
          </button>
        </Tooltip>
        <div className="w-px h-6 bg-gray-600 mx-2"></div>
        {isConnected ? (
          <Tooltip content="Disconnect from Launchpad">
            <button onClick={onDisconnect} className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors flex items-center gap-2">
                <DisconnectIcon /> <span className="hidden sm:inline text-sm">Disconnect</span>
            </button>
          </Tooltip>
        ) : (
          <Tooltip content="Connect to Launchpad">
            <button onClick={onConnect} disabled={isConnecting} className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors flex items-center gap-2 disabled:bg-indigo-400 disabled:cursor-wait">
                {isConnecting ? <SpinnerIcon /> : <ConnectIcon />}
                <span className="hidden sm:inline text-sm">{isConnecting ? 'Connecting...' : 'Connect'}</span>
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
