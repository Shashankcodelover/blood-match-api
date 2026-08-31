import React from 'react';
import {
  AlertCircle, Navigation, ShieldCheck, Zap, Droplets, MapPin,
  Truck, Hospital, ArrowRightLeft, Send, Siren, Sparkles
} from 'lucide-react';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export function DispatchSidebar({
  hospitals = [],
  selectedHospitalId,
  onSelectHospital,
  recipientType,
  setRecipientType,
  urgency,
  setUrgency,
  matches = [],
  activeDispatches = [],
  onDispatch,
  onOpenInterHospital,
  onOpenEmergencyRequest,
  onOpenMatrix
}) {
  const currentHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];
  const hospitalUnits = (currentHospital?.inventory && currentHospital.inventory[recipientType]) || 0;
  const isShortage = hospitalUnits <= 1;

  return (
    <aside className="fixed top-16 left-0 bottom-0 z-20 w-full max-w-sm glass-panel border-r border-slate-800/80 flex flex-col p-4 shadow-2xl overflow-hidden">
      {/* Hospital Hub Selector */}
      <div className="mb-3.5 pb-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Hospital className="w-3.5 h-3.5 text-rose-500" />
            Trauma Center Dispatch Hub
          </label>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">LIVE RADAR</span>
        </div>

        <select
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none focus:border-rose-500/60"
          value={selectedHospitalId}
          onChange={e => onSelectHospital(e.target.value)}
        >
          {hospitals.map(h => (
            <option key={h.id} value={h.id}>
              {h.name} ({h.code})
            </option>
          ))}
        </select>
      </div>

      {/* Urgency & Blood Selection Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-rose-500" />
            Required Blood Group
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
            {urgency === 'critical' ? 'CRITICAL STAT' : 'STANDARD'}
          </button>
        </div>

        {/* Blood Type Grid */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
          {BLOOD_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setRecipientType(type)}
              className={`h-8 rounded-lg font-mono font-bold text-xs transition-all flex items-center justify-center ${
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

      {/* Hospital Stock Warning Banner */}
      <div className={`p-2.5 rounded-xl border mb-3 flex items-center justify-between text-xs transition-all ${
        isShortage
          ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 animate-pulse'
          : 'bg-slate-900/80 border-slate-800 text-slate-300'
      }`}>
        <div>
          <span className="font-bold block">
            {currentHospital?.code} Reserve: {hospitalUnits} Unit{hospitalUnits !== 1 ? 's' : ''} ({recipientType})
          </span>
          {isShortage && <span className="text-[10px] text-rose-400">Critical low supply at destination hub</span>}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenInterHospital}
            title="Inter-Hospital Drone Transfer"
            className="p-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>XFER</span>
          </button>
          <button
            onClick={onOpenMatrix}
            title="View Cross-Match Matrix"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 transition-all"
          >
            Matrix
          </button>
        </div>
      </div>

      {/* AI Matches List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
        <div className="flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur-md py-1 z-10">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            AI Match Rankings ({matches.length})
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Distance + Cooldown</span>
        </div>

        {matches.map(donor => {
          const isEnRoute = activeDispatches.some(disp => disp.donorId === donor.id && disp.status === 'En Route');
          return (
            <div
              key={donor.id}
              className={`bg-slate-950/80 p-3.5 rounded-xl border transition-all relative overflow-hidden ${
                isEnRoute
                  ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-100 text-xs">{donor.name}</h4>
                    <span className="bg-rose-500/20 text-rose-300 font-mono font-bold px-1.5 py-0.2 rounded text-[10px] border border-rose-500/30">
                      {donor.bloodType}
                    </span>
                    {donor.isVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" title="Verified Donor" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {donor.distanceMiles} mi
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">{donor.eligibilityStatus}</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-mono">{donor.reliabilityScore}% rel</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {donor.aiScore}%
                  </div>
                </div>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onDispatch(donor.id, 'Autonomous Drone')}
                  disabled={isEnRoute}
                  className="bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 text-purple-200 border border-purple-500/40 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3 h-3 text-purple-300" />
                  <span>Deploy Drone</span>
                </button>
                <button
                  onClick={() => onDispatch(donor.id, 'Emergency Transport')}
                  disabled={isEnRoute}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-1"
                >
                  <Truck className="w-3 h-3 text-slate-400" />
                  <span>Ambulance</span>
                </button>
              </div>
            </div>
          );
        })}

        {matches.length === 0 && (
          <div className="text-center py-8 px-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center mx-auto mb-2 text-slate-500">
              <Droplets className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-400 mb-1">No matching donors in radar range</p>
            <p className="text-[11px] text-slate-500 mb-3">Try toggling CRITICAL STAT mode or request an Inter-Hospital Drone Transfer.</p>
            <button
              onClick={onOpenInterHospital}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-md"
            >
              Transfer from Other Hospital
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
