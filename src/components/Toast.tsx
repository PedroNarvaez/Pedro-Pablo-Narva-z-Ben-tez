import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md text-xs font-medium transition-all transform duration-200 animate-in slide-in-from-bottom-3 ${
            t.type === 'success'
              ? 'bg-[#131826]/95 border-[#2d9e6e]/40 text-[#e8e5df]'
              : t.type === 'error'
              ? 'bg-[#131826]/95 border-[#dc4a38]/40 text-[#e8e5df]'
              : 'bg-[#131826]/95 border-[#c47046]/40 text-[#e8e5df]'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {t.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#2d9e6e] shrink-0" />
            ) : t.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#dc4a38] shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-[#c47046] shrink-0" />
            )}
            <span className="truncate">{t.text}</span>
          </div>

          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="text-[#8b93a7] hover:text-[#e8e5df] p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
