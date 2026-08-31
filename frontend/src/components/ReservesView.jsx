import React, { useState } from 'react';
import { Hospital, Droplet, ShieldCheck, ArrowRightLeft, Plus, RefreshCw, AlertTriangle } from 'lucide-react';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const WHOLE_BLOOD_DONOR_COMPATIBILITY = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

export function ReservesView({
  hospitals = [],
  onOpenInterHospital,
  onOpenEmergencyRequest,
  onAdjustInventory
}) {
  const [selectedType, setSelectedType] = useState('O-');
  const compatibleDonors = WHOLE_BLOOD_DONOR_COMPATIBILITY[selectedType] || [];

  return (
    <div className="pt-20 pb-12 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Regional Blood Bank Reserves & Clinical Matrix</h2>
            <span className="text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
              LIVE INVENTORY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time blood group stock levels across 5 regional trauma centers and interactive clinical cross-matching
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInterHospital}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Launch Inter-Hospital Drone Transfer</span>
          </button>
        </div>
      </div>

      {/* Clinical Compatibility Matrix */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl bg-slate-900/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplet className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Emergency Transfusion Cross-Match Calculator
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Select recipient blood type to highlight compatible donors</span>
        </div>

        {/* Type Selector Buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-6">
          {BLOOD_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`py-3 rounded-2xl font-mono text-sm font-bold transition-all border ${
                selectedType === type
                  ? 'bg-gradient-to-tr from-rose-600 to-red-600 text-white border-rose-400 shadow-lg shadow-rose-600/30 scale-105'
                  : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Compatibility Guidance */}
        <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Selected Recipient</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-rose-400">{selectedType}</span>
              {selectedType === 'AB+' && (
                <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded">
                  Universal Recipient
                </span>
              )}
            </div>
          </div>

          <div className="sm:col-span-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Clinically Compatible Donor Types</span>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {compatibleDonors.map(donorType => (
                <span
                  key={donorType}
                  className={`font-mono font-bold px-2.5 py-1 rounded-xl text-xs border ${
                    donorType === 'O-'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-900 text-slate-200 border-slate-700'
                  }`}
                >
                  {donorType} {donorType === 'O-' && '★ (Universal)'}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5 Regional Trauma Centers Inventory Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Hospital className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Regional Hospital Blood Banks & Reserves
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Total 5 Network Trauma Hubs</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {hospitals.map(hosp => {
            const totalUnits = Object.values(hosp.inventory || {}).reduce((a, b) => a + b, 0);
            const isCritical = (hosp.inventory?.['O-'] || 0) < 2;

            return (
              <div
                key={hosp.id}
                className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{hosp.name}</h4>
                        <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {hosp.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{hosp.phone} • {hosp.helipad ? '🚁 Active Helipad' : '🚑 Ground Ambulance'}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-white">{totalUnits} Units</span>
                      <span className="text-[10px] text-slate-500 block">Total Reserve</span>
                    </div>
                  </div>

                  {isCritical && (
                    <div className="mb-3 bg-amber-950/40 border border-amber-500/40 p-2.5 rounded-xl text-[11px] text-amber-300 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Critical O- Universal Donor shortage at this trauma station.</span>
                    </div>
                  )}

                  {/* Blood Group Units Matrix */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {BLOOD_TYPES.map(type => {
                      const count = hosp.inventory?.[type] || 0;
                      const isLow = count < 2;
                      return (
                        <div
                          key={type}
                          className={`p-2 rounded-xl text-center border font-mono ${
                            isLow
                              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="text-[10px] text-slate-500 block">{type}</span>
                          <span className="text-xs font-bold">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onOpenEmergencyRequest && onOpenEmergencyRequest()}
                    className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                  >
                    <span>Request Emergency Supply</span>
                  </button>

                  <button
                    onClick={() => onOpenInterHospital && onOpenInterHospital()}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    <span>Balance Surplus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
