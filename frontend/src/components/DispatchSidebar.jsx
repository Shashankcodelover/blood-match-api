import React from 'react';
import { AlertCircle, Navigation, ShieldCheck, Zap, Droplets, MapPin, Truck } from 'lucide-react';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export function DispatchSidebar({
  recipientType,
  setRecipientType,
  urgency,
  setUrgency,
  matches,
  activeDispatch,
  onDispatch,
}) {
  return (
    <aside className="fixed top-16 left-0 bottom-0 z-20 w-full max-w-sm glass-panel border-r border-slate-800/80 flex flex-col p-5 shadow-2xl overflow-hidden">
      {/* Urgency & Blood Selection Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-rose-500" />
            Hospital Need
          </label>

          {/* Urgency Toggle */}
          <button
            onClick={() => setUrgency(urgency === 'critical' ? 'normal' : 'critical')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
              urgency === 'critical'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm shadow-red-500/20 animate-pulse'
                : 'bg-slate-800 text-slate-400 border border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            {urgency === 'critical' ? 'CRITICAL EMERGENCY' : 'STANDARD NEED'}
          </button>
        </div>

        {/* Blood Type Grid */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
          {BLOOD_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setRecipientType(type)}
              className={`h-9 rounded-lg font-bold text-xs transition-all flex items-center justify-center ${
                recipientType === type
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-rose-600/30 border border-rose-400/40'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* AI Matches List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
        <div className="flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur-md py-1.5 z-10">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            AI Match Rankings ({matches.length})
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Sorted by Proximity + Cooldown</span>
        </div>

        {matches.map(donor => {
          const isEnRoute = activeDispatch && activeDispatch.donorId === donor.id;
          return (
            <div
              key={donor.id}
              className={`bg-slate-950/70 p-4 rounded-xl border transition-all relative overflow-hidden ${
                isEnRoute
                  ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-100 text-sm">{donor.name}</h4>
                    <span className="bg-rose-500/20 text-rose-300 font-mono font-semibold px-1.5 py-0.5 rounded text-[10px] border border-rose-500/30">
                      {donor.bloodType}
                    </span>
                    {donor.isVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" title="Verified Donor" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {donor.distanceMiles} mi
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">{donor.eligibilityStatus}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                    {donor.aiScore}% Match
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onDispatch(donor.id, 'Autonomous Drone')}
                  disabled={!!activeDispatch}
                  className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-30 flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-purple-400" />
                  <span>Deploy Drone</span>
                </button>
                <button
                  onClick={() => onDispatch(donor.id, 'Emergency Transport')}
                  disabled={!!activeDispatch}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-30 flex items-center justify-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ambulance</span>
                </button>
              </div>
            </div>
          );
        })}

        {matches.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <Droplets className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-400 mb-1">No matching donors in radar range</p>
            <p className="text-xs text-slate-500">Try toggling CRITICAL EMERGENCY mode to bypass 56-day cooldown filtering.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
