import React, { useState } from 'react';
import { X, Droplet, HeartHandshake, ShieldCheck, AlertCircle, Info } from 'lucide-react';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const RED_CELL_COMPATIBILITY = {
  'O-': { canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-'], isUniversalDonor: true },
  'O+': { canGiveTo: ['O+', 'A+', 'B+', 'AB+'], canReceiveFrom: ['O-', 'O+'] },
  'A-': { canGiveTo: ['A-', 'A+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'A-'] },
  'A+': { canGiveTo: ['A+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+'] },
  'B-': { canGiveTo: ['B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'B-'] },
  'B+': { canGiveTo: ['B+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'B-', 'B+'] },
  'AB-': { canGiveTo: ['AB-', 'AB+'], canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'] },
  'AB+': { canGiveTo: ['AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], isUniversalRecipient: true }
};

const PLASMA_COMPATIBILITY = {
  'AB+': { canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['AB+'], isUniversalPlasma: true },
  'AB-': { canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['AB-', 'AB+'] },
  'A+': { canGiveTo: ['O-', 'O+', 'A-', 'A+'], canReceiveFrom: ['A+', 'AB+'] },
  'A-': { canGiveTo: ['O-', 'O+', 'A-', 'A+'], canReceiveFrom: ['A-', 'A+', 'AB-', 'AB+'] },
  'B+': { canGiveTo: ['O-', 'O+', 'B-', 'B+'], canReceiveFrom: ['B+', 'AB+'] },
  'B-': { canGiveTo: ['O-', 'O+', 'B-', 'B+'], canReceiveFrom: ['B-', 'B+', 'AB-', 'AB+'] },
  'O+': { canGiveTo: ['O-', 'O+'], canReceiveFrom: ['O+', 'A+', 'B+', 'AB+'] },
  'O-': { canGiveTo: ['O-', 'O+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] }
};

export function BloodMatrixModal({ onClose, selectedType = 'O-', onSelectType }) {
  const [currentType, setCurrentType] = useState(selectedType);
  const [viewMode, setViewMode] = useState('redCells'); // redCells | plasma

  const redData = RED_CELL_COMPATIBILITY[currentType] || RED_CELL_COMPATIBILITY['O-'];
  const plasmaData = PLASMA_COMPATIBILITY[currentType] || PLASMA_COMPATIBILITY['O-'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-3xl glass-panel p-6 rounded-2xl shadow-2xl border border-slate-700/80 relative flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Emergency Blood Compatibility Calculator</h3>
              <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                CLINICAL CROSS-MATCH
              </span>
            </div>
            <p className="text-xs text-slate-400">Interactive red blood cell (RBC) and plasma transfusion compatibility chart</p>
          </div>
        </div>

        {/* Blood Group Selector Buttons */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Patient / Recipient Blood Type:</label>
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('redCells')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${viewMode === 'redCells' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Red Blood Cells
              </button>
              <button
                onClick={() => setViewMode('plasma')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${viewMode === 'plasma' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Plasma & Platelets
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {BLOOD_TYPES.map(type => (
              <button
                key={type}
                onClick={() => {
                  setCurrentType(type);
                  if (onSelectType) onSelectType(type);
                }}
                className={`h-12 rounded-xl font-mono font-bold text-sm transition-all flex flex-col items-center justify-center border ${
                  currentType === type
                    ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white border-rose-400/50 shadow-lg shadow-rose-600/30 scale-105'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{type}</span>
                {type === 'O-' && <span className="text-[8px] text-amber-300 font-sans">UNIV RBC</span>}
                {type === 'AB+' && <span className="text-[8px] text-emerald-300 font-sans">UNIV REC</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Transfusion Guidance Card */}
        {viewMode === 'redCells' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Can Receive From */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  <strong className="text-rose-400">{currentType}</strong> Can Receive RBCs From:
                </h4>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map(type => {
                  const isMatch = redData.canReceiveFrom.includes(type);
                  return (
                    <div
                      key={type}
                      className={`p-2.5 rounded-xl border text-center font-mono text-xs font-bold transition-all ${
                        isMatch
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                          : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-40'
                      }`}
                    >
                      {type}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                {redData.canReceiveFrom.length === 1
                  ? `Critical Notice: ${currentType} patients can only receive exact match ${currentType} red blood cells.`
                  : `${currentType} can safely receive red cells from ${redData.canReceiveFrom.join(', ')}.`}
              </p>
            </div>

            {/* Can Donate To */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  <strong className="text-rose-400">{currentType}</strong> Donors Can Give RBCs To:
                </h4>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map(type => {
                  const isMatch = redData.canGiveTo.includes(type);
                  return (
                    <div
                      key={type}
                      className={`p-2.5 rounded-xl border text-center font-mono text-xs font-bold transition-all ${
                        isMatch
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-sm'
                          : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-40'
                      }`}
                    >
                      {type}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                {currentType === 'O-'
                  ? '🌟 Universal Red Cell Donor: O- red blood cells can be transfused into any recipient during trauma emergencies.'
                  : `${currentType} donors can supply whole blood to ${redData.canGiveTo.join(', ')}.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Plasma Receive */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <HeartHandshake className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  <strong className="text-amber-400">{currentType}</strong> Can Receive Plasma From:
                </h4>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map(type => {
                  const isMatch = plasmaData.canReceiveFrom.includes(type);
                  return (
                    <div
                      key={type}
                      className={`p-2.5 rounded-xl border text-center font-mono text-xs font-bold transition-all ${
                        isMatch
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm'
                          : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-40'
                      }`}
                    >
                      {type}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                Plasma compatibility is the inverse of red cell compatibility. AB+ is the Universal Plasma Donor.
              </p>
            </div>

            {/* Plasma Donate */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  <strong className="text-amber-400">{currentType}</strong> Plasma Can Be Given To:
                </h4>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map(type => {
                  const isMatch = plasmaData.canGiveTo.includes(type);
                  return (
                    <div
                      key={type}
                      className={`p-2.5 rounded-xl border text-center font-mono text-xs font-bold transition-all ${
                        isMatch
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm'
                          : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-40'
                      }`}
                    >
                      {type}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-3">
                {currentType === 'AB+' || currentType === 'AB-'
                  ? '🌟 Universal Plasma Donor: AB plasma contains neither anti-A nor anti-B antibodies and can be given to all blood groups.'
                  : `${currentType} plasma can be transfused to ${plasmaData.canGiveTo.join(', ')}.`}
              </p>
            </div>
          </div>
        )}

        {/* Clinical Emergency Transfusion Matrix Rules */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-2 text-rose-400">
            <AlertCircle className="w-4 h-4" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">STAT Trauma Transfusion Protocols</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-400">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <strong className="text-slate-200 block mb-0.5">Uncrossed Emergency Protocol</strong>
              In unknown trauma cases where type-and-cross cannot wait, uncrossed <strong>O-Negative</strong> RBCs are deployed immediately.
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <strong className="text-slate-200 block mb-0.5">Rh Factor Compatibility</strong>
              Rh-negative patients should receive Rh-negative blood to avoid Rh antibody alloimmunization, especially women of childbearing potential.
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <strong className="text-slate-200 block mb-0.5">Cold-Chain Assurance</strong>
              LifeStream autonomous vectors ensure all whole blood and packed cells remain strictly between <strong>2°C and 6°C</strong> during transit.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
