import React, { useState, useEffect } from 'react';
import { Trophy, Award, Heart, CheckCircle2, Calendar, Plus, Phone, Droplet, Clock, ShieldCheck } from 'lucide-react';
import { resilientFetch } from '../api/client';

export function CommunityView({ user, hospitals = [], onOpenAppointments, onOpenEligibility }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [lbData, aptData] = await Promise.all([
          resilientFetch('/api/donors/leaderboard'),
          resilientFetch('/api/auth/appointments')
        ]);
        if (Array.isArray(lbData)) setLeaderboard(lbData);
        if (Array.isArray(aptData)) setAppointments(aptData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="pt-20 pb-12 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Hero Donor Community & Appointments</h2>
            <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
              LIFESAVERS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Top voluntary community heroes, rapid health screening clearance, and scheduled center appointments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenEligibility}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>5-Point Health Clearance</span>
          </button>

          <button
            onClick={onOpenAppointments}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Donation Appointment</span>
          </button>
        </div>
      </div>

      {/* 2-Column Community Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leaderboard */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Top Voluntary Blood Donors
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Ranked by verified donations & reliability</span>
          </div>

          <div className="space-y-3">
            {leaderboard.map((donor, idx) => {
              const rank = idx + 1;
              return (
                <div
                  key={donor.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-3 ${
                    rank === 1
                      ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/10'
                      : rank === 2
                      ? 'bg-slate-900/90 border-slate-700'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl font-bold font-mono text-xs flex items-center justify-center ${
                        rank === 1
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                          : rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-xs">{donor.name}</h4>
                        <span className="text-[10px] font-mono font-bold bg-red-600 text-white px-1.5 py-0.2 rounded">
                          {donor.bloodType}
                        </span>
                        {donor.isVerified && (
                          <span className="text-[9px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-1 rounded">
                            Verified
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {(donor.badges || []).map(b => (
                          <span key={b} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <span className="font-bold text-white block">{donor.totalDonations || 0} Donations</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">~{donor.estimatedLivesSaved || (donor.totalDonations * 3)} Lives Saved</span>
                    </div>

                    <div className="text-right pl-3 border-l border-slate-800">
                      <span className="font-bold text-cyan-400 block">{donor.reliabilityScore || 95}%</span>
                      <span className="text-[10px] text-slate-500">Reliability</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Appointments & Quick Actions */}
        <div className="space-y-6">
          {/* Scheduled Appointments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Upcoming Center Bookings
                </h3>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3">
              {appointments.length > 0 ? (
                appointments.slice(0, 3).map(apt => (
                  <div key={apt.id} className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{apt.hospitalName}</span>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{apt.donationType}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                      <span>📅 {apt.date}</span>
                      <span>⏰ {apt.timeSlot}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  No appointments booked yet. Click "Book Donation Appointment" above.
                </div>
              )}
            </div>
          </div>

          {/* Impact Stats Card */}
          <div className="bg-gradient-to-tr from-rose-950/50 to-slate-900 border border-rose-500/30 p-5 rounded-3xl space-y-3">
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Community Impact Goal</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every whole blood unit can be separated into Red Blood Cells, Plasma, and Platelets — potentially saving up to **3 individual lives** in acute trauma cases.
            </p>
            <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Universal O- Reserves</span>
              <span className="text-emerald-400 font-bold">Priority Monitored</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
