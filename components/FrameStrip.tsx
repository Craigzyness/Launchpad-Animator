
import React, { useRef } from 'react';
import { FramePreview } from './FramePreview';
import { Frame } from '../App';

interface FrameStripProps {
  frames: Frame[];
  currentFrameIndex: number;
  onSelectFrame: (index: number) => void;
  colorMap: Record<number, string>;
  disabled: boolean;
  onMoveFrame: (fromIndex: number, toIndex: number) => void;
  onDurationChange: (index: number, duration: number) => void;
  onRightClick: (index: number, event: React.MouseEvent) => void;
}

export const FrameStrip: React.FC<FrameStripProps> = ({ frames, currentFrameIndex, onSelectFrame, colorMap, disabled, onMoveFrame, onDurationChange, onRightClick }) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };
  
  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      onMoveFrame(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    onRightClick(index, e);
  };

  return (
    <div className="p-2 bg-gray-900/50 rounded-lg border border-gray-700">
        <div className="flex items-start gap-3 overflow-x-auto pb-2 -mb-2">
            {frames.map((frame, index) => (
                <div
                    key={index}
                    draggable={!disabled}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onContextMenu={(e) => handleContextMenu(e, index)}
                    className="flex-shrink-0"
                >
                    <FramePreview
                        frame={frame}
                        colorMap={colorMap}
                        isActive={index === currentFrameIndex}
                        onClick={() => onSelectFrame(index)}
                        index={index}
                        onDurationChange={(duration) => onDurationChange(index, duration)}
                    />
                </div>
            ))}
        </div>
    </div>
  );
};
