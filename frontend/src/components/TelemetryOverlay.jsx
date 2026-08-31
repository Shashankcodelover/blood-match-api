import React, { useState } from 'react';
import {
  Navigation, Thermometer, BatteryCharging, Gauge, CheckCircle2,
  Wind, ShieldCheck, X, FileCheck, UserCheck
} from 'lucide-react';

export function TelemetryOverlay({
  dispatches = [],
  focusedDispatchId,
  onFocusDispatch,
  onConfirmReceipt
}) {
  const activeList = dispatches.filter(d => d.status === 'En Route' || d.status === 'Arrived');
  if (activeList.length === 0) return null;

  const currentDispatch = activeList.find(d => d.id === focusedDispatchId) || activeList[0];
  const isArrived = currentDispatch.status === 'Arrived';
  const isColdSafe = currentDispatch.tempCelsius >= 2.0 && currentDispatch.tempCelsius <= 6.0;

  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [nurseName, setNurseName] = useState('');
  const [nurseBadge, setNurseBadge] = useState('RN-8021');

  const handleIntakeSubmit = (e) => {
    e.preventDefault();
    if (onConfirmReceipt) {
      onConfirmReceipt(currentDispatch.id, nurseName || 'Nurse Practitioner On-Duty', nurseBadge);
    }
    setShowIntakeModal(false);
  };

  return (
    <div className="fixed bottom-6 left-[395px] z-30 w-full max-w-md glass-panel p-4 rounded-2xl shadow-xl border border-slate-200 bg-white/95 animate-fade-in">
      {/* Multi-Dispatch Tabs */}
      {activeList.length > 1 && (
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1.5 border-b border-slate-200">
          {activeList.map(disp => (
            <button
              key={disp.id}
              onClick={() => onFocusDispatch(disp.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-all ${
                currentDispatch.id === disp.id
                  ? 'bg-purple-50 text-purple-700 border border-purple-300 shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {disp.id} • {disp.donorBloodType}
            </button>
          ))}
        </div>
      )}

      {/* Header status */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isArrived ? 'bg-emerald-500' : 'bg-emerald-500 animate-ping'}`} />
          <span className="font-bold text-xs text-slate-800 tracking-wide uppercase">
            {isArrived ? 'MISSION COMPLETED · ROOFTOP ARRIVAL' : `ACTIVE TELEMETRY · ${currentDispatch.id}`}
          </span>
        </div>
        <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {currentDispatch.transportType}
        </span>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">EST. ARRIVAL</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900 font-mono">{currentDispatch.etaMinutes}</span>
            <span className="text-xs text-slate-500 font-semibold">{isArrived ? 'DELIVERED' : 'min'}</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-sky-600" />
            IoT COLD-CHAIN
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black font-mono ${isColdSafe ? 'text-sky-600' : 'text-amber-600'}`}>
              {currentDispatch.tempCelsius}°C
            </span>
            <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 rounded">
              Safe 2-6°C
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Kinematics (Speed, Altitude, Battery, Weather) */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200 mb-3 text-center font-mono text-[11px]">
        <div>
          <span className="text-[8px] text-slate-400 block">SPEED</span>
          <span className="text-slate-800 font-bold">{currentDispatch.speedMph} mph</span>
        </div>
        <div>
          <span className="text-[8px] text-slate-400 block">ALTITUDE</span>
          <span className="text-slate-800 font-bold">{currentDispatch.altitudeMeters} m</span>
        </div>
        <div>
          <span className="text-[8px] text-slate-400 block">BATTERY</span>
          <span className="text-emerald-600 font-bold">{currentDispatch.batteryPct}%</span>
        </div>
        <div>
          <span className="text-[8px] text-slate-400 block">WEATHER</span>
          <span className="text-sky-600 font-bold text-[10px]">Optimal</span>
        </div>
      </div>

      {/* Route details & Intake button */}
      <div className="text-xs text-slate-600 flex items-center justify-between">
        <div>
          <span>Route: <strong className="text-slate-900">{currentDispatch.donorName}</strong></span>
          <span className="text-[10px] font-mono text-slate-400 block">→ {currentDispatch.hospitalName} ({currentDispatch.remainingMiles} mi left)</span>
        </div>

        {isArrived && !currentDispatch.intakeConfirmation && (
          <button
            onClick={() => setShowIntakeModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-md transition-all flex items-center gap-1"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Confirm Intake</span>
          </button>
        )}

        {currentDispatch.intakeConfirmation && (
          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
            ✓ Logged by {currentDispatch.intakeConfirmation.badgeId}
          </span>
        )}
      </div>

      {/* Intake Signature Modal */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowIntakeModal(false)}>
          <div className="w-full max-w-sm glass-panel p-5 rounded-2xl shadow-2xl border border-slate-200 bg-white relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">Hospital Intake Verification</h4>
            </div>
            <form onSubmit={handleIntakeSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Receiving Practitioner Name</label>
                <input
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-500"
                  placeholder="e.g. Sarah Lin, BSN RN"
                  value={nurseName}
                  onChange={e => setNurseName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Staff Badge ID</label>
                <input
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-500"
                  value={nurseBadge}
                  onChange={e => setNurseBadge(e.target.value)}
                  required
                />
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-700 font-mono space-y-1">
                <div>Payload: 1 Unit {currentDispatch.donorBloodType}</div>
                <div>Intake Temp: {currentDispatch.tempCelsius}°C (Medical Safe)</div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg shadow-sm"
                >
                  Confirm & Stock in Bank
                </button>
                <button
                  type="button"
                  onClick={() => setShowIntakeModal(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
