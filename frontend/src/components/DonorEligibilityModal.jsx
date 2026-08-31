import React, { useState } from 'react';
import { X, HeartPulse, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, UserPlus } from 'lucide-react';

export function DonorEligibilityModal({ onClose, onClearedForRegistration }) {
  const [form, setForm] = useState({
    age: 26,
    weightKg: 68,
    lastDonationDays: 90,
    feelingWell: true,
    pregnantOrMedication: false
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/donors/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-lg glass-panel p-6 rounded-2xl shadow-2xl border border-slate-700/80 relative flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Donor Health & Eligibility Checker</h3>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                5-POINT SCREEN
              </span>
            </div>
            <p className="text-xs text-slate-400">Clinical pre-donation health screening according to medical blood safety standards</p>
          </div>
        </div>

        {/* Form or Result */}
        {result ? (
          <div className="space-y-4">
            {result.isEligible ? (
              <div className="bg-emerald-950/40 border border-emerald-500/40 p-5 rounded-2xl text-center space-y-3">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">{result.clearanceStatus}</h4>
                <p className="text-xs text-slate-300">
                  Congratulations! You meet all blood banking criteria and are cleared to join the emergency rapid dispatch network.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (onClearedForRegistration) onClearedForRegistration();
                      onClose();
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Proceed to Official Registration</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-950/40 border border-amber-500/40 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h4 className="text-sm font-bold text-white">{result.clearanceStatus}</h4>
                </div>
                <div className="space-y-1.5 pl-2">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-amber-200/90 flex items-center gap-1.5">
                      <span>•</span> {err}
                    </p>
                  ))}
                </div>
                {result.nextEligibleDays > 0 && (
                  <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
                    Estimated time to next donation eligibility: ~{result.nextEligibleDays} days.
                  </p>
                )}
                <div className="pt-2">
                  <button
                    onClick={() => setResult(null)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-all"
                  >
                    Adjust Answers
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleCheck} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Donor Age (18–65)</label>
                <input
                  type="number"
                  min="16"
                  max="80"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/60"
                  value={form.age}
                  onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Weight in KG (Min 50kg)</label>
                <input
                  type="number"
                  min="40"
                  max="150"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/60"
                  value={form.weightKg}
                  onChange={e => setForm(f => ({ ...f, weightKg: Number(e.target.value) }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Days Since Last Blood Donation (Min 56 Days)</label>
              <input
                type="number"
                min="0"
                max="365"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/60"
                value={form.lastDonationDays}
                onChange={e => setForm(f => ({ ...f, lastDonationDays: Number(e.target.value) }))}
                required
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={form.feelingWell}
                  onChange={e => setForm(f => ({ ...f, feelingWell: e.target.checked }))}
                  className="rounded text-emerald-500 focus:ring-0"
                />
                <span className="text-xs text-slate-200 font-medium">I am feeling healthy, well, and free of active cold/flu symptoms today.</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={form.pregnantOrMedication}
                  onChange={e => setForm(f => ({ ...f, pregnantOrMedication: e.target.checked }))}
                  className="rounded text-emerald-500 focus:ring-0"
                />
                <span className="text-xs text-slate-300 font-medium">Currently pregnant or taking active blood thinner medications.</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Evaluating Health Data...' : 'Run Instant Medical Clearance Scan'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
