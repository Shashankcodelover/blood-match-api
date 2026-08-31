import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export function ToastNotification({ toast, onDismiss }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed top-20 right-6 z-50 animate-bounce-short">
      <div
        className={`px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md border flex items-center gap-3 text-xs font-semibold ${
          isSuccess
            ? 'bg-white border-emerald-300 text-emerald-800 shadow-emerald-500/10'
            : isError
            ? 'bg-white border-rose-300 text-rose-800 shadow-rose-500/10'
            : 'bg-white border-slate-200 text-slate-800 shadow-slate-500/10'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : isError ? (
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
        ) : (
          <Info className="w-4 h-4 text-sky-600 shrink-0" />
        )}

        <span>{toast.message}</span>

        <button
          onClick={onDismiss}
          className="p-1 hover:text-slate-900 text-slate-400 transition-colors ml-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
