
import React, { useState, useEffect, useRef } from 'react';

export interface ContextMenuItem {
  label: string;
  action: () => void;
  disabled?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  event: MouseEvent | React.MouseEvent;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ items, event, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    setPosition({ x: event.clientX, y: event.clientY });
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [event, onClose]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled) {
      item.action();
      onClose();
    }
  };
  
  const style: React.CSSProperties = {
    top: `${position.y}px`,
    left: `${position.x}px`,
  };

  return (
    <div
      ref={menuRef}
      style={style}
      className="fixed z-50 bg-gray-800 border border-gray-700 rounded-md shadow-lg p-1 min-w-[180px] animate-fade-in"
    >
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index}>
            <button
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className="w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors text-gray-200 hover:bg-indigo-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
