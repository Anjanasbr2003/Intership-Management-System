import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const listeners = new Set();
let toastId = 0;

export const toast = {
  success: (msg, duration = 3500) => emitToast('success', msg, duration),
  error: (msg, duration = 4500) => emitToast('error', msg, duration),
  info: (msg, duration = 3500) => emitToast('info', msg, duration),
};

function emitToast(type, message, duration) {
  const item = { id: ++toastId, type, message, duration };
  listeners.forEach((fn) => fn(item));
}

export function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNewToast = (item) => {
      setToasts((prev) => [...prev, item]);
      if (item.duration > 0) {
        setTimeout(() => {
          removeToast(item.id);
        }, item.duration);
      }
    };

    listeners.add(handleNewToast);
    return () => listeners.delete(handleNewToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full sm:w-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="glass-floating pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-slate-900 dark:text-white text-xs sm:text-sm animate-toast"
          style={{ minWidth: '280px' }}
        >
          <div className="flex items-center gap-2.5">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-blue-500 shrink-0" />}
            <span className="font-medium text-xs sm:text-sm tracking-tight text-slate-800 dark:text-neutral-100">{t.message}</span>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="btn-liquid text-slate-400 dark:text-neutral-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

