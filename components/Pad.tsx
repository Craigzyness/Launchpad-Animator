
import React from 'react';

interface PadProps {
  note: number;
  colorCode: number;
  onMouseDown: (note: number, e: React.MouseEvent) => void;
  onMouseOver: (note: number) => void;
  colorMap: Record<number, string>;
  isMidiActive: boolean;
}

export const Pad: React.FC<PadProps> = ({ note, colorCode, onMouseDown, onMouseOver, colorMap, isMidiActive }) => {
  const colorHex = colorMap[colorCode] || '#111827';
  const glowClass = colorCode !== 0 ? 'shadow-[0_0_15px_2px_var(--pad-color)]' : '';
  const midiActiveClass = isMidiActive ? 'ring-2 ring-white' : '';
  const padColorStyle = {
    '--pad-color': colorHex,
    backgroundColor: colorHex,
  } as React.CSSProperties;

  return (
    <button
      onMouseDown={(e) => onMouseDown(note, e)}
      onMouseOver={() => onMouseOver(note)}
      className={`relative aspect-square w-full rounded-md transition-all duration-150 ease-in-out focus:outline-none ${glowClass} ${midiActiveClass} shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]`}
      style={padColorStyle}
      aria-label={`Pad ${note}`}
    >
      {isMidiActive && <div className="absolute inset-0 rounded-md bg-white/50 animate-ping"></div>}
    </button>
  );
};
