
import React from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastProps {
    toasts: ToastMessage[];
    onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div 
                    key={t.id} 
                    role="alert"
                    className={`pointer-events-auto px-4 py-3 rounded-md shadow-lg text-white text-sm font-medium animate-fade-in flex items-center gap-3 min-w-[300px] justify-between border ${
                    t.type === 'error' ? 'bg-red-900/90 border-red-700' : 
                    t.type === 'success' ? 'bg-green-900/90 border-green-700' : 
                    'bg-gray-800/90 border-gray-600'
                } backdrop-blur-sm`}
                >
                    <span>{t.message}</span>
                    <button 
                        onClick={() => onDismiss(t.id)} 
                        className="text-white/70 hover:text-white transition-colors"
                        aria-label="Close notification"
                    >
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
};

export const useToast = () => {
    const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

    const addToast = React.useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        
        // Auto dismiss
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = React.useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, addToast, removeToast };
};
