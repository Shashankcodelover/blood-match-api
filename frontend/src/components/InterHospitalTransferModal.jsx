import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Hospital, Navigation, AlertTriangle, CheckCircle2, ShieldCheck, Box } from 'lucide-react';
import { playDispatchSonar } from '../utils/audioAlerts';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export function InterHospitalTransferModal({ onClose, currentHospital, onTransferInitiated }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [surplusMatches, setSurplusMatches] = useState([]);
  const [selectedBloodType, setSelectedBloodType] = useState('O-');

  // Custom Transfer form
  const [sourceHospitalId, setSourceHospitalId] = useState('');
  const [targetHospitalId, setTargetHospitalId] = useState(currentHospital?.id || 'HOSP-01');
  const [units, setUnits] = useState(2);
  const [transferring, setTransferring] = useState(false);
  const [transferResult, setTransferResult] = useState(null);

  const fetchHospitals = async () => {
    try {
      const res = await fetch('/api/hospitals');
      const data = await res.json();
      setHospitals(data);
      if (data.length > 1 && !sourceHospitalId) {
        setSourceHospitalId(data.find(h => h.id !== targetHospitalId)?.id || data[1].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurplusMatches = async () => {
    if (!targetHospitalId) return;
    try {
      const res = await fetch(`/api/hospitals/surplus/${targetHospitalId}/${selectedBloodType}`);
      const data = await res.json();
      setSurplusMatches(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    fetchSurplusMatches();
  }, [targetHospitalId, selectedBloodType]);

  const handleLaunchTransfer = async (srcId, tgtId, bType, qty) => {
    setTransferring(true);
    try {
      playDispatchSonar();
      const res = await fetch('/api/hospitals/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceHospitalId: srcId,
          targetHospitalId: tgtId,
          bloodType: bType,
          units: qty
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transfer failed');

      setTransferResult(data);
      if (onTransferInitiated) onTransferInitiated(data.dispatch);
      fetchHospitals();
    } catch (err) {
      alert(err.message);
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-4xl glass-panel p-6 rounded-2xl shadow-2xl border border-slate-700/80 relative flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Inter-Hospital Emergency Blood Transfer</h3>
              <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                HOSPITAL-TO-HOSPITAL DRONE
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous medical payload balancing between regional trauma centers</p>
          </div>
        </div>

        {/* Transfer Success Card */}
        {transferResult && (
          <div className="mb-4 bg-cyan-950/40 border border-cyan-500/40 p-4 rounded-2xl animate-fade-in flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                  Inter-Hospital Drone Transfer Dispatched · {transferResult.dispatch.id}
                </h4>
                <p className="text-xs text-slate-200 mt-1">{transferResult.message}</p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-cyan-300 mt-2">
                  <span>Speed: {transferResult.dispatch.speedMph} mph</span>
                  <span>•</span>
                  <span>Est. ETA: ~{transferResult.dispatch.etaMinutes} min</span>
                  <span>•</span>
                  <span>Payload: {transferResult.dispatch.payloadUnits} units</span>
                </div>
              </div>
            </div>
            <button onClick={() => setTransferResult(null)} className="text-xs text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Target Hospital & Blood Shortage Scanner */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl mb-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Hospital className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Hospital Needing Blood:</span>
              <select
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                value={targetHospitalId}
                onChange={e => setTargetHospitalId(e.target.value)}
              >
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Blood Group:</span>
              <select
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-rose-400 font-bold font-mono outline-none"
                value={selectedBloodType}
                onChange={e => setSelectedBloodType(e.target.value)}
              >
                {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Quick 1-Click Surplus Transfer Cards */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Surplus Inventories in Neighboring Centers ({surplusMatches.length})
            </span>

            {surplusMatches.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-3">No other hospitals currently have surplus units of {selectedBloodType}.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {surplusMatches.map((m, idx) => (
                  <div key={idx} className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-white text-xs">{m.sourceHospitalName}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        <strong className="text-emerald-400 font-mono">{m.availableUnits} units</strong> available • {m.distanceMiles} mi away
                      </p>
                      <span className="text-[10px] text-cyan-400 font-mono block mt-0.5">Drone Flight ETA: ~{m.estimatedDroneMins} min</span>
                    </div>

                    <button
                      onClick={() => handleLaunchTransfer(m.sourceHospitalId, m.targetHospitalId, m.bloodType, 1)}
                      disabled={transferring}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Launch Drone</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Multi-Hospital Regional Inventory Matrix */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">All Regional Trauma Centers & Blood Stock</h4>

          {hospitals.map(h => (
            <div key={h.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{h.name}</span>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{h.code}</span>
                  {h.helipad && <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">DRONE HELIPAD</span>}
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Tel: {h.phone}</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {BLOOD_TYPES.map(t => {
                  const units = (h.inventory && h.inventory[t]) || 0;
                  const isLow = units <= 1;
                  return (
                    <div
                      key={t}
                      className={`p-1.5 rounded-lg text-center border font-mono ${
                        isLow
                          ? 'bg-rose-950/40 border-rose-500/30 text-rose-400'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="text-[9px] block text-slate-500 font-sans font-semibold">{t}</span>
                      <span className="text-xs font-bold">{units}u</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
