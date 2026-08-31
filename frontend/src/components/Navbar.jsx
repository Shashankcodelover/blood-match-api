import React from 'react';
import {
  Activity, ShieldCheck, Heart, Hospital, Plus, Radio, ShieldAlert,
  Droplet, Trophy, Siren, Volume2, VolumeX, ArrowRightLeft, User,
  Package, Calendar, LogIn, Sparkles
} from 'lucide-react';

export function Navbar({
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenInventory,
  onOpenRegisterDonor,
  onOpenAdmin,
  onOpenMatrix,
  onOpenEmergencyRequest,
  onOpenLeaderboard,
  onOpenInterHospital,
  onOpenOrderTracking,
  onOpenAppointments,
  onToggleSound,
  soundOn = true,
  activeDispatchCount = 0
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-5 py-2.5 flex items-center justify-between glass-panel border-b border-slate-800/80">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/25">
          <Activity className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-white tracking-tight">LifeStream</span>
            <span className="text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
              ENTERPRISE V4.0
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
            Autonomous Emergency Blood Network & E2E Cold-Chain Delivery
          </p>
        </div>
      </div>

      {/* Action Navigation Controls */}
      <div className="flex items-center gap-2">
        {/* Active In-Flight Badge */}
        {activeDispatchCount > 0 && (
          <button
            onClick={onOpenOrderTracking}
            className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl text-emerald-400 text-xs font-bold animate-pulse hover:bg-emerald-500/20 transition-all"
          >
            <Radio className="w-3.5 h-3.5 animate-spin" />
            <span>{activeDispatchCount} In-Flight</span>
          </button>
        )}

        {/* Amazon-Grade Order Tracking */}
        <button
          onClick={onOpenOrderTracking}
          className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
        >
          <Package className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Track Delivery</span>
        </button>

        {/* STAT Emergency Request (High Priority) */}
        <button
          onClick={onOpenEmergencyRequest}
          className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all active:scale-95 animate-pulse"
        >
          <Siren className="w-3.5 h-3.5" />
          <span>STAT Request</span>
        </button>

        {/* Donor Appointment Schedule */}
        <button
          onClick={onOpenAppointments}
          className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
        >
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden lg:inline">Appointments</span>
        </button>

        {/* Compatibility Matrix */}
        <button
          onClick={onOpenMatrix}
          className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
        >
          <Droplet className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden xl:inline">Cross-Match</span>
        </button>

        {/* Hero Leaderboard */}
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline">Leaderboard</span>
        </button>

        {/* Hospital Reserves & Transfers */}
        <button
          onClick={onOpenInterHospital}
          className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
        >
          <Hospital className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden xl:inline">Hospital Reserves</span>
        </button>

        {/* Admin Console */}
        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-amber-950/40 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Admin</span>
        </button>

        {/* User Profile Pill OR Sign In */}
        {user ? (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-900/60 to-slate-900 border border-purple-500/40 hover:border-purple-400 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <div className="w-5 h-5 rounded-lg bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
              {user.name.charAt(0)}
            </div>
            <span className="max-w-[110px] truncate hidden sm:inline">{user.name}</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          title={soundOn ? 'Sound Alerts Enabled' : 'Sound Muted'}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all"
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </div>
    </header>
  );
}
