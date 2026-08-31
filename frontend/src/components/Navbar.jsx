import React from 'react';
import {
  Activity, Radio, Siren, Droplet, Trophy, Package,
  Compass, MapPin, Volume2, VolumeX, LogIn, User, Hospital, ShieldAlert
} from 'lucide-react';

export function Navbar({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenEmergencyRequest,
  onOpenAdmin,
  onToggleSound,
  soundOn = true,
  activeDispatchCount = 0,
  isTrackingUserLocation = false,
  onToggleUserLocation
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-4 sm:px-6 py-2.5 flex items-center justify-between glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      {/* Brand & Network Status */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => setActiveTab('radar')}
          className="cursor-pointer flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
            <Activity className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white tracking-tight">LifeStream</span>
              <span className="text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded-full uppercase">
                V4
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-medium">Autonomous Network Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modular View Switcher (Decluttered, Clean Tabs) */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800/80 shadow-inner">
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'radar'
              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Radar & Dispatch</span>
        </button>

        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'tracker'
              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-cyan-400" />
          <span>Delivery Tracker</span>
          {activeDispatchCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('reserves')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reserves'
              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Hospital className="w-3.5 h-3.5 text-rose-400" />
          <span>Blood Reserves & Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'community'
              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Hero Community</span>
        </button>
      </nav>

      {/* Action Controls & GPS */}
      <div className="flex items-center gap-2">
        {/* Live GPS Locator Button */}
        <button
          onClick={onToggleUserLocation}
          title="Track your real-time physical GPS location on the radar"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isTrackingUserLocation
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20 animate-pulse'
              : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          <MapPin className={`w-3.5 h-3.5 ${isTrackingUserLocation ? 'text-cyan-400' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">{isTrackingUserLocation ? 'Live GPS Active' : 'Locate Me'}</span>
        </button>

        {/* STAT Emergency SOS Button */}
        <button
          onClick={onOpenEmergencyRequest}
          className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95 animate-pulse"
        >
          <Siren className="w-3.5 h-3.5" />
          <span>STAT Request</span>
        </button>

        {/* Admin Quick Console */}
        <button
          onClick={onOpenAdmin}
          title="Open Administrative Command Center"
          className="p-1.5 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 border border-amber-500/30 transition-all hidden lg:flex"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundOn ? 'Sound Alerts Active' : 'Sound Muted'}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all"
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* User Profile Pill OR Sign In */}
        {user ? (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-slate-900 border border-purple-500/40 hover:border-purple-400 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
              {user.name.charAt(0)}
            </div>
            <span className="max-w-[100px] truncate hidden sm:inline">{user.name}</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          >
            <LogIn className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
