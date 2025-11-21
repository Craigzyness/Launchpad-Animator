
import { useState, useCallback } from 'react';

export interface UseHistoryResult<T> {
    history: T[];
    currentIndex: number;
    push: (state: T) => void;
    undo: () => T | null;
    redo: () => T | null;
    canUndo: boolean;
    canRedo: boolean;
    reset: (state: T) => void;
}

export function useHistory<T>(initialState: T, maxHistory: number = 50): UseHistoryResult<T> {
    const [history, setHistory] = useState<T[]>([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const push = useCallback((state: T) => {
        setHistory(prev => {
            const sliced = prev.slice(0, currentIndex + 1);
            const next = [...sliced, state];
            if (next.length > maxHistory) {
                next.shift();
            }
            return next;
        });
        setCurrentIndex(prev => {
             const nextIndex = prev + 1;
             // If we exceeded maxHistory, the array was shifted, so the new index is maxHistory - 1
             if (nextIndex >= maxHistory) return maxHistory - 1;
             return nextIndex;
        });
    }, [currentIndex, maxHistory]);

    const undo = useCallback(() => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
            // Return the state at the new index (using the current history array closure)
            return history[newIndex];
        }
        return null;
    }, [history, currentIndex]);

    const redo = useCallback(() => {
         if (currentIndex < history.length - 1) {
             const newIndex = currentIndex + 1;
             setCurrentIndex(newIndex);
             return history[newIndex];
         }
         return null;
    }, [history, currentIndex]);
    
    const reset = useCallback((state: T) => {
        setHistory([state]);
        setCurrentIndex(0);
    }, []);

    return {
        history,
        currentIndex,
        push,
        undo,
        redo,
        canUndo: currentIndex > 0,
        canRedo: currentIndex < history.length - 1,
        reset
    };
}
