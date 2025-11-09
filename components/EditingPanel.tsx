
import React, { useState } from 'react';
import { Tool, Symmetry, AnimationPreset, InteractivePreset } from '../App';
import { Tooltip } from './Tooltip';
import { InteractiveEffectControls } from './InteractiveEffectControls';
import { ContextMenu, ContextMenuItem } from './ContextMenu';

// --- SVG Icons ---
const iconClass = "h-5 w-5";
const PencilIcon = (): React.ReactElement => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const EraserIcon = (): React.ReactElement => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m-1.125 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const PaintBucketIcon = (): React.ReactElement => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.47 2.118v-.092c0-.537.436-.97.97-.97h.092l3.483-.058a2.25 2.25 0 001.824-1.824l.058-3.483a.97.97 0 00-.97-.97h-.092l-2.118 2.47a3 3 0 00-1.128 5.78z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.994-9.992 9.004 9.004 0 00-8.994-8.994A9.004 9.004 0 003 12c0 4.192 2.868 7.728 6.726 8.654z" /></svg>;
const EyeDropperIcon = (): React.ReactElement => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.456-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.456-2.456L17.25 14.25l.398 1.178a3.375 3.375 0 002.456 2.456l1.178.398-1.178.398a3.375 3.375 0 00-2.456 2.456z" /></svg>;
const LineIcon = (): React.ReactElement => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75l16.5 16.5" /></svg>;
const GradientIcon = (): React.ReactElement => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>;
const RectIcon = (): React.ReactElement => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H4z" /></svg>;
const RectOutlineIcon = (): React.ReactElement => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" /></svg>;
const CircleIcon = (): React.ReactElement => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const FilmIcon = (): React.ReactElement => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>;
const SparklesIcon = (): React.ReactElement => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 12l-2.293 2.293a1 1 0 01-1.414 0L4 12m16 8l-2.293-2.293a1 1 0 00-1.414 0L14 17l2.293 2.293a1 1 0 001.414 0L20 17z" /></svg>;
const TextIcon = (): React.ReactElement => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10m16-10v10M6 7h2m4 0h2m4 0h2M6 17h2m4 0h2m4 0h2" /></svg>;
const TypeIcon = (): React.ReactElement => <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 3h15" /></svg>;
const CopyIcon = (): React.ReactElement => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" /><path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H5z" /></svg>;
const PasteIcon = (): React.ReactElement => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" /><path d="M3 5a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm3 0v10h6V5H6z" /></svg>;
const ClearIcon = (): React.ReactElement => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;

const tools: { name: Tool, icon: React.ReactElement, tooltip: string, key: string }[] = [
    { name: 'draw', icon: <PencilIcon />, tooltip: 'Draw (P)', key: 'P' },
    { name: 'erase', icon: <EraserIcon />, tooltip: 'Erase (E)', key: 'E' },
    { name: 'fill', icon: <PaintBucketIcon />, tooltip: 'Fill (G)', key: 'G' },
    { name: 'eyedropper', icon: <EyeDropperIcon />, tooltip: 'Eyedropper (I)', key: 'I' },
    { name: 'line', icon: <LineIcon />, tooltip: 'Line (L)', key: 'L' },
    { name: 'gradient', icon: <GradientIcon />, tooltip: 'Gradient', key: ''},
    { name: 'rect', icon: <RectIcon />, tooltip: 'Rectangle', key: '' },
    { name: 'rect_outline', icon: <RectOutlineIcon />, tooltip: 'Rectangle Outline', key: '' },
    { name: 'circle', icon: <CircleIcon />, tooltip: 'Circle', key: '' },
];

const symmetryModes: { name: Symmetry, label: string }[] = [
    { name: 'none', label: 'Off' }, { name: 'vertical', label: 'V' }, { name: 'horizontal', label: 'H' },
];

interface EditingPanelProps {
    selectedColor: number;
    onColorSelect: (color: number) => void;
    onAddCustomColor: (hex: string) => void;
    onRemoveColor: (code: number) => void;
    palette: { name: string; code: number }[];
    colorMap: Record<number, string>;
    activeTool: Tool;
    onToolChange: (tool: Tool) => void;
    onTextTool: () => void;
    onTypingTool: () => void;
    symmetry: Symmetry;
    onSymmetryChange: (symmetry: Symmetry) => void;
    onAnimationsClick: () => void;
    onEffectsClick: () => void;
    activePreset: AnimationPreset | null;
    onActivePresetColorsChange: (colors: number[]) => void;
    editableEffect: InteractivePreset | null;
    onEditableEffectChange: (effect: InteractivePreset | null) => void;
    onCopyFrameContent: () => void;
    onPasteFrameContent: () => void;
    onClearFrame: () => void;
}

interface ContextMenuState {
  event: React.MouseEvent | null;
  items: ContextMenuItem[];
}

export const EditingPanel: React.FC<EditingPanelProps> = (props) => {
    const { activePreset, editableEffect } = props;
    const colorInputRef = React.useRef<HTMLInputElement>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

    const handleCustomColorClick = () => {
        colorInputRef.current?.click();
    };

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.onAddCustomColor(e.target.value);
    };

    const handleColorRightClick = (e: React.MouseEvent, code: number, name: string) => {
      e.preventDefault();
      if (name !== 'Custom') return; // Only allow removing custom colors

      setContextMenu({
        event: e,
        items: [
          { label: 'Remove Color', action: () => props.onRemoveColor(code) }
        ],
      });
    };

    return (
        <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700 flex flex-col gap-4 h-full">
            <div className="grid grid-cols-2 gap-2">
                 <button onClick={props.onAnimationsClick} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-gray-300">
                    <FilmIcon /> <span className="text-sm">Animations</span>
                </button>
                 <button onClick={props.onEffectsClick} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-gray-300">
                    <SparklesIcon /> <span className="text-sm">Effects</span>
                </button>
            </div>

            <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Color Palette</h3>
                <div className="flex flex-wrap gap-2">
                    {props.palette.map(({ name, code }) => (
                        <div key={code} className="relative group" onContextMenu={(e) => handleColorRightClick(e, code, name)}>
                            <Tooltip content={name}>
                                <button onClick={() => props.onColorSelect(code)}
                                    className={`w-7 h-7 rounded-full transition-all ${props.selectedColor === code ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : 'ring-1 ring-white/20'}`}
                                    style={{ backgroundColor: props.colorMap[code] }}
                                />
                            </Tooltip>
                            {name === 'Custom' && (
                                <Tooltip content="Remove color">
                                    <button
                                    onClick={() => props.onRemoveColor(code)}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                    &times;
                                    </button>
                                </Tooltip>
                            )}
                        </div>
                    ))}
                        <Tooltip content="Add custom color">
                        <button onClick={handleCustomColorClick} className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-600 ring-1 ring-white/20">
                            +
                            <input type="color" ref={colorInputRef} onChange={handleCustomColorChange} className="absolute w-0 h-0 opacity-0"/>
                        </button>
                    </Tooltip>
                </div>
            </div>
            
            <div className="space-y-4">
                 <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">Tools</h3>
                    <div className="grid grid-cols-5 gap-2">
                       {tools.map(({ name, icon, tooltip }) => (
                            <Tooltip content={tooltip} key={name}>
                                <button
                                    onClick={() => props.onToolChange(name)}
                                    className={`p-2 rounded-md transition-colors aspect-square flex items-center justify-center ${props.activeTool === name ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                                >{icon}</button>
                            </Tooltip>
                        ))}
                    </div>
                </div>

                <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">Actions</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <Tooltip content="Clear Frame">
                            <button onClick={props.onClearFrame} className="p-2 rounded-md transition-colors aspect-square flex items-center justify-center bg-gray-700 hover:bg-gray-600"><ClearIcon /></button>
                        </Tooltip>
                        <Tooltip content="Copy Frame (Ctrl+C)">
                            <button onClick={props.onCopyFrameContent} className="p-2 rounded-md transition-colors aspect-square flex items-center justify-center bg-gray-700 hover:bg-gray-600"><CopyIcon /></button>
                        </Tooltip>
                        <Tooltip content="Paste Frame (Ctrl+V)">
                            <button onClick={props.onPasteFrameContent} className="p-2 rounded-md transition-colors aspect-square flex items-center justify-center bg-gray-700 hover:bg-gray-600"><PasteIcon /></button>
                        </Tooltip>
                    </div>
                </div>

                <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">Symmetry</h3>
                    <div className="flex bg-gray-700 rounded-md p-1">
                        {symmetryModes.map(({ name, label }) => (
                            <button key={name} onClick={() => props.onSymmetryChange(name)}
                                className={`flex-1 text-xs font-semibold py-1 rounded-md transition-colors ${props.symmetry === name ? 'bg-indigo-600 text-white' : 'hover:bg-gray-600 text-gray-300'}`}
                            >{label}</button>
                        ))}
                    </div>
                </div>
                 <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">Text Generators</h3>
                     <div className="grid grid-cols-2 gap-2">
                        <Tooltip content="Scrolling Marquee Text">
                            <button onClick={props.onTextTool} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center flex-col gap-1 text-gray-300 h-full">
                            <TextIcon /> <span className="text-xs">Marquee</span>
                            </button>
                        </Tooltip>
                        <Tooltip content="Typing Text Effect">
                            <button onClick={props.onTypingTool} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center flex-col gap-1 text-gray-300 h-full">
                            <TypeIcon /> <span className="text-xs">Typing</span>
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {(activePreset || editableEffect) && (
                 <div className="space-y-4">
                    {activePreset && (
                        <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700 animate-fade-in">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-medium text-gray-300">
                                    Active Animation: <span className="text-white font-semibold">{activePreset.name}</span>
                                </h3>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {activePreset.colors.map((code, index) => (
                                    <Tooltip content="Replace with selected color" key={index}>
                                        <button
                                            onClick={() => {
                                                const newColors = [...activePreset.colors];
                                                newColors[index] = props.selectedColor;
                                                props.onActivePresetColorsChange(newColors);
                                            }}
                                            className="w-7 h-7 rounded-full transition-all ring-1 ring-white/20 hover:ring-2 hover:ring-white"
                                            style={{ backgroundColor: props.colorMap[code] || '#000' }}
                                            aria-label={`Replace color ${index}`}
                                        />
                                    </Tooltip>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        const shuffled = [...activePreset.colors].sort(() => 0.5 - Math.random());
                                        props.onActivePresetColorsChange(shuffled);
                                    }}
                                    className="flex-1 text-xs font-semibold px-2 py-1.5 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                                >
                                    Shuffle Colors
                                </button>
                                <button 
                                    onClick={() => {
                                        const cycled = [...activePreset.colors];
                                        if (cycled.length > 1) {
                                            cycled.push(cycled.shift()!);
                                            props.onActivePresetColorsChange(cycled);
                                        }
                                    }}
                                    className="flex-1 text-xs font-semibold px-2 py-1.5 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                                >
                                    Cycle Colors
                                </button>
                            </div>
                        </div>
                    )}
                    {editableEffect && (
                        <InteractiveEffectControls 
                            armedEffect={editableEffect} 
                            onSettingChange={(key, value) => {
                                const newEffect = {...editableEffect, settings: {...editableEffect.settings, [key]: value}};
                                props.onEditableEffectChange(newEffect);
                            }}
                        />
                    )}
                </div>
            )}
            {contextMenu && contextMenu.event && (
              <ContextMenu
                event={contextMenu.event}
                items={contextMenu.items}
                onClose={() => setContextMenu(null)}
              />
            )}
        </div>
    );
};
