import React, { useState, useEffect } from 'react';
import { X, Siren, Zap, Hospital, User, Phone, Droplet, CheckCircle, Navigation, AlertTriangle } from 'lucide-react';
import { playEmergencyBeacon } from '../utils/audioAlerts';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export function EmergencyRequestModal({ onClose, hospitals = [], onDispatchMission, onRequestCreated }) {
  const [form, setForm] = useState({
    patientName: '',
    bloodType: 'O-',
    unitsRequired: 2,
    urgency: 'critical',
    hospitalId: hospitals[0]?.id || 'HOSP-01',
    contactPhone: '',
    medicalReason: 'Emergency Trauma Blood Loss'
  });

  const [loading, setLoading] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientName) return;
    setLoading(true);

    try {
      playEmergencyBeacon();
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setCreatedTicket(data);
      if (onRequestCreated) onRequestCreated(data);
    } catch (err) {
      console.error('Request creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-2xl glass-panel p-6 rounded-2xl shadow-2xl border border-red-500/40 relative flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 animate-pulse">
            <Siren className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">STAT Emergency Blood Request</h3>
              <span className="text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full">
                PRIORITY 1 DISPATCH
              </span>
            </div>
            <p className="text-xs text-slate-400">Direct hospital intake request for critical trauma, surgery, or massive transfusion protocol</p>
          </div>
        </div>

        {/* If ticket generated, show response */}
        {createdTicket ? (
          <div className="space-y-4">
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">Emergency Request Activated — Ticket #{createdTicket.request.id}</h4>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">BROADCASTED</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Required: <strong>{createdTicket.request.unitsRequired} units of {createdTicket.request.bloodType}</strong> for patient <strong>{createdTicket.request.patientName}</strong> at <strong>{createdTicket.request.hospitalName}</strong>.
                </p>
              </div>
            </div>

            {/* AI Matched Donors for Immediate Deployment */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  Instant AI Proximity Matches ({createdTicket.matchingDonors?.length || 0})
                </h4>
                <span className="text-[10px] text-slate-400">Click to deploy immediate drone</span>
              </div>

              <div className="space-y-2">
                {(createdTicket.matchingDonors || []).map(donor => (
                  <div key={donor.id} className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{donor.name}</span>
                        <span className="font-mono text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">{donor.bloodType}</span>
                        <span className="text-[10px] text-slate-400">• {donor.distanceMiles} mi away</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">{donor.aiScore}% Match Score</span>
                    </div>

                    <button
                      onClick={() => {
                        if (onDispatchMission) onDispatchMission(donor.id, 'Autonomous Drone');
                        onClose();
                      }}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Deploy Drone</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
              >
                Done & Monitor Radar Map
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Patient Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-red-500/60"
                    placeholder="e.g. Jessica Williams"
                    value={form.patientName}
                    onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Emergency Contact Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-red-500/60"
                    placeholder="+1 415-555-0911"
                    value={form.contactPhone}
                    onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Required Blood Type *</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500/60"
                  value={form.bloodType}
                  onChange={e => setForm(f => ({ ...f, bloodType: e.target.value }))}
                >
                  {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Units Required (Pints/Bags)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500/60"
                  value={form.unitsRequired}
                  onChange={e => setForm(f => ({ ...f, unitsRequired: Number(e.target.value) }))}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Urgency Level</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500/60"
                  value={form.urgency}
                  onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}
                >
                  <option value="critical">🚨 Critical STAT (0-15 min)</option>
                  <option value="urgent">⚡ Urgent Surgery (15-45 min)</option>
                  <option value="scheduled">🕒 Scheduled Procedure (2-4 hrs)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Destination Trauma Center / Hospital *</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500/60"
                value={form.hospitalId}
                onChange={e => setForm(f => ({ ...f, hospitalId: e.target.value }))}
              >
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Clinical Notes & Diagnosis</label>
              <textarea
                rows="2"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500/60 resize-none"
                placeholder="e.g. Acute internal hemorrhage post-accident. Immediate transfusion required on ICU Room 402."
                value={form.medicalReason}
                onChange={e => setForm(f => ({ ...f, medicalReason: e.target.value }))}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3 rounded-xl text-sm shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Siren className="w-4 h-4 animate-bounce" />
                <span>{loading ? 'Transmitting STAT Request...' : 'Transmit STAT Emergency Blood Beacon'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
