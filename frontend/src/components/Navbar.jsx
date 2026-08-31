import React from 'react';
import { Activity, ShieldCheck, Heart, Hospital, Plus, Radio, ShieldAlert } from 'lucide-react';

export function Navbar({ onOpenInventory, onOpenRegisterDonor, onOpenAdmin, activeDispatchCount }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-6 py-3.5 flex items-center justify-between glass-panel border-b border-slate-800/80">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20">
          <Activity className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-white tracking-tight">LifeStream</span>
            <span className="text-[10px] font-mono font-semibold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">V3.1 LIVE</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Autonomous Emergency Blood Dispatch Network</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {activeDispatchCount > 0 && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-400 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-spin" />
            <span>{activeDispatchCount} Active Mission{activeDispatchCount > 1 ? 's' : ''}</span>
          </div>
        )}

        <button
          onClick={onOpenInventory}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
        >
          <Hospital className="w-4 h-4 text-rose-400" />
          <span>Hospital Inventories</span>
        </button>

        <button
          onClick={onOpenRegisterDonor}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-rose-600/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Register Donor</span>
        </button>

        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-2 bg-slate-900/90 hover:bg-amber-950/40 text-amber-300 border border-amber-500/40 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Admin Portal</span>
        </button>
      </div>
    </header>
  );
}
