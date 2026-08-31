import React from 'react';
import {
  Activity, ShieldCheck, Heart, Hospital, Plus, Radio, ShieldAlert,
  Droplet, Trophy, Siren, Volume2, VolumeX, ArrowRightLeft
} from 'lucide-react';
import { isSoundEnabled } from '../utils/audioAlerts';

export function Navbar({
  onOpenInventory,
  onOpenRegisterDonor,
  onOpenAdmin,
  onOpenMatrix,
  onOpenEmergencyRequest,
  onOpenLeaderboard,
  onOpenInterHospital,
  onToggleSound,
  soundOn = true,
  activeDispatchCount = 0
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-5 py-3 flex items-center justify-between glass-panel border-b border-slate-800/80">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/25">
          <Activity className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-white tracking-tight">LifeStream</span>
            <span className="text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
              V3.2 PRO
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Smart Emergency Blood Network & Autonomous Drone Dispatch
          </p>
        </div>
      </div>

      {/* Action Navigation Controls */}
      <div className="flex items-center gap-2">
        {/* Active In-Flight Badge */}
        {activeDispatchCount > 0 && (
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl text-emerald-400 text-xs font-bold animate-pulse">
            <Radio className="w-3.5 h-3.5 animate-spin" />
            <span>{activeDispatchCount} Active Mission{activeDispatchCount > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* STAT Emergency Request (High Priority) */}
        <button
          onClick={onOpenEmergencyRequest}
          className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all active:scale-95 animate-pulse"
        >
          <Siren className="w-3.5 h-3.5" />
          <span className="hidden md:inline">STAT Request</span>
        </button>

        {/* Compatibility Matrix */}
        <button
          onClick={onOpenMatrix}
          className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
        >
          <Droplet className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden lg:inline">Cross-Match Matrix</span>
        </button>

        {/* Hero Leaderboard */}
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Leaderboard</span>
        </button>

        {/* Hospital Blood Reserves & Transfers */}
        <button
          onClick={onOpenInterHospital}
          className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
        >
          <Hospital className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline">Hospital Reserves</span>
        </button>

        {/* Register Donor */}
        <button
          onClick={onOpenRegisterDonor}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Register Donor</span>
        </button>

        {/* Admin Console */}
        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-amber-950/40 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline">Admin</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          title={soundOn ? 'Sound Alerts Enabled' : 'Sound Muted'}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all"
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </div>
    </header>
  );
}
