import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export function ToastNotification({ toast, onDismiss }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed top-20 right-6 z-50 animate-bounce-short">
      <div
        className={`px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center gap-3 text-xs font-semibold ${
          isSuccess
            ? 'bg-emerald-950/85 border-emerald-500/50 text-emerald-200'
            : isError
            ? 'bg-rose-950/85 border-rose-500/50 text-rose-200'
            : 'bg-slate-900/90 border-slate-700/80 text-slate-200'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : isError ? (
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
        ) : (
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        )}

        <span>{toast.message}</span>

        <button
          onClick={onDismiss}
          className="p-1 hover:text-white text-slate-400 transition-colors ml-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
