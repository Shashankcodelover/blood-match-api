import React, { useState, useEffect } from 'react';
import { X, Hospital, PackageCheck, AlertTriangle } from 'lucide-react';

export function HospitalInventoryModal({ onClose }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/hospitals');
        const data = await res.json();
        setHospitals(data);
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-xl glass-panel p-6 rounded-2xl shadow-2xl border border-slate-700/80 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Hospital className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Hospital Blood Bank Reserves</h3>
            <p className="text-xs text-slate-400">Real-time inventory levels across San Francisco regional trauma centers</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading hospital data...</div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {hospitals.map(h => (
              <div key={h.id} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-sm text-slate-200">{h.name}</h4>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{h.id}</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(h.inventory).map(([type, units]) => {
                    const isLow = units <= 1;
                    return (
                      <div
                        key={type}
                        className={`p-2 rounded-lg text-center border font-mono ${
                          isLow
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="text-[10px] block text-slate-500 font-sans font-semibold">{type}</span>
                        <span className="text-sm font-bold">{units} u</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
