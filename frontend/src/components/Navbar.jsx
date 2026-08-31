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
    <header className="fixed top-0 left-0 right-0 z-30 px-4 sm:px-6 py-2.5 flex items-center justify-between glass-panel border-b border-slate-200/90 bg-white/90 backdrop-blur-xl shadow-sm">
      {/* Brand & Network Status */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => setActiveTab('radar')}
          className="cursor-pointer flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-md shadow-rose-600/20 group-hover:scale-105 transition-transform">
            <Activity className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-slate-900 tracking-tight">LifeStream</span>
              <span className="text-[9px] font-mono font-bold bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.2 rounded-full uppercase">
                V4
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-emerald-600 font-medium">Autonomous Network Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modular View Switcher (Clean, Light, Modular Tabs) */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200 shadow-inner">
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'radar'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Radar & Dispatch</span>
        </button>

        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'tracker'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-sky-500" />
          <span>Delivery Tracker</span>
          {activeDispatchCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('reserves')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reserves'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Hospital className="w-3.5 h-3.5 text-rose-500" />
          <span>Blood Reserves & Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'community'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
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
              ? 'bg-sky-50 text-sky-700 border-sky-300 shadow-sm shadow-sky-500/10 animate-pulse'
              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <MapPin className={`w-3.5 h-3.5 ${isTrackingUserLocation ? 'text-sky-600' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">{isTrackingUserLocation ? 'Live GPS Active' : 'Locate Me'}</span>
        </button>

        {/* STAT Emergency SOS Button */}
        <button
          onClick={onOpenEmergencyRequest}
          className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all active:scale-95 animate-pulse"
        >
          <Siren className="w-3.5 h-3.5" />
          <span>STAT Request</span>
        </button>

        {/* Admin Quick Console */}
        <button
          onClick={onOpenAdmin}
          title="Open Administrative Command Center"
          className="p-1.5 rounded-xl text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-amber-200 transition-all hidden lg:flex"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundOn ? 'Sound Alerts Active' : 'Sound Muted'}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-all"
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        {/* User Profile Pill OR Sign In */}
        {user ? (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-white border border-purple-200 hover:border-purple-300 text-slate-800 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
              {user.name.charAt(0)}
            </div>
            <span className="max-w-[100px] truncate hidden sm:inline">{user.name}</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5 text-rose-600" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
