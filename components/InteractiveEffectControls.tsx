
import React from 'react';
import type { InteractivePreset } from '../App';
import { Tooltip } from './Tooltip';

interface InteractiveEffectControlsProps {
    armedEffect: InteractivePreset | null;
    onSettingChange: (setting: 'speed' | 'size', value: number) => void;
}

const sizeEffects: Partial<Record<InteractivePreset['effect'], {label: string, min: number, max: number}>> = {
    ripple: { label: 'Size', min: 2, max: 10 },
    trail: { label: 'Length', min: 2, max: 10 },
    fireworks: { label: 'Particles', min: 5, max: 20 },
    paintSplash: { label: 'Radius', min: 2, max: 8 },
    chaser: { label: 'Radius', min: 2, max: 8 },
    randomLights: { label: 'Count', min: 5, max: 40 },
    colorBurst: { label: 'Radius', min: 2, max: 8 },
    glitch: { label: 'Intensity', min: 1, max: 7 },
};


export const InteractiveEffectControls: React.FC<InteractiveEffectControlsProps> = ({ armedEffect, onSettingChange }) => {
    if (!armedEffect) {
        return (
            <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700 text-center">
                <p className="text-sm text-gray-400">No interactive effect armed.</p>
                <p className="text-xs text-gray-500 mt-1">Select an effect from the library to configure it.</p>
            </div>
        );
    }
    
    const sizeConfig = sizeEffects[armedEffect.effect];

    return (
        <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700 space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-300">
                    Effect: <span className="text-white font-semibold">{armedEffect.name}</span>
                </h3>
            </div>
            
            {sizeConfig && armedEffect.settings?.size !== undefined && (
                <div className="flex items-center gap-3 pt-2">
                    <label htmlFor="effect-size" className="text-sm font-medium text-gray-400 w-16 capitalize">{sizeConfig.label}</label>
                    <Tooltip content={`Adjusts the ${sizeConfig.label.toLowerCase()} of the effect.`}>
                        <input
                            id="effect-size"
                            type="range"
                            min={sizeConfig.min}
                            max={sizeConfig.max}
                            value={armedEffect.settings?.size || 5}
                            onChange={(e) => onSettingChange('size', Number(e.target.value))}
                            className="w-full"
                        />
                    </Tooltip>
                    <span className="font-mono text-sm w-6 text-center text-gray-400">
                        {armedEffect.settings?.size || 5}
                    </span>
                </div>
            )}
            
            {!sizeConfig && (
                <p className="text-xs text-gray-500 text-center pt-2">This effect has no configurable settings.</p>
            )}
        </div>
    );
};
