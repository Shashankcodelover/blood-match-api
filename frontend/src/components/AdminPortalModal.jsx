import React, { useState, useEffect, useCallback } from 'react';
import {
  X, ShieldAlert, Users, Hospital, Radio, AlertTriangle, CheckCircle,
  XCircle, Trash2, Plus, RefreshCw, BarChart3, ArrowUpRight, Flame,
  Battery, Thermometer, MapPin, Search, Filter, ShieldCheck, HeartPulse
} from 'lucide-react';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export function AdminPortalModal({ onClose, onDataChange }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview | donors | hospitals | dispatches | alerts
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states for donors
  const [donorSearch, setDonorSearch] = useState('');
  const [donorBloodFilter, setDonorBloodFilter] = useState('');
  const [donorVerifiedFilter, setDonorVerifiedFilter] = useState('');

  // Add Donor form
  const [showAddDonor, setShowAddDonor] = useState(false);
  const [newDonor, setNewDonor] = useState({
    name: '',
    bloodType: 'O-',
    phone: '',
    reliabilityScore: 95,
    isVerified: true
  });

  // Add Hospital form
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [newHospital, setNewHospital] = useState({
    name: '',
    lat: 37.7749,
    lng: -122.4194
  });

  // Create Alert form
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    hospitalId: 'HOSP-01',
    bloodType: 'O-',
    urgency: 'critical',
    message: ''
  });

  // Fetch all admin data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, donorsRes, hospitalsRes, dispatchesRes, alertsRes] = await Promise.all([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch(`/api/admin/donors?search=${encodeURIComponent(donorSearch)}&bloodType=${donorBloodFilter}&verified=${donorVerifiedFilter}`).then(r => r.json()),
        fetch('/api/admin/hospitals').then(r => r.json()),
        fetch('/api/admin/dispatches').then(r => r.json()),
        fetch('/api/admin/alerts').then(r => r.json())
      ]);

      setStats(statsRes);
      setDonors(donorsRes);
      setHospitals(hospitalsRes);
      setDispatches(dispatchesRes);
      setAlerts(alertsRes);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  }, [donorSearch, donorBloodFilter, donorVerifiedFilter]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Donor Actions
  const toggleDonorVerification = async (id, currentStatus) => {
    try {
      await fetch(`/api/admin/donors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: !currentStatus })
      });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteDonor = async (id) => {
    if (!confirm('Are you sure you want to remove this donor from the dispatch registry?')) return;
    try {
      await fetch(`/api/admin/donors/${id}`, { method: 'DELETE' });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDonor = async (e) => {
    e.preventDefault();
    if (!newDonor.name) return;
    try {
      await fetch('/api/admin/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDonor)
      });
      setShowAddDonor(false);
      setNewDonor({ name: '', bloodType: 'O-', phone: '', reliabilityScore: 95, isVerified: true });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  // Hospital Inventory Actions
  const adjustHospitalInventory = async (hospitalId, bloodType, delta) => {
    try {
      await fetch(`/api/admin/hospitals/${hospitalId}/inventory`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bloodType, delta })
      });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateHospital = async (e) => {
    e.preventDefault();
    if (!newHospital.name) return;
    try {
      await fetch('/api/admin/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHospital)
      });
      setShowAddHospital(false);
      setNewHospital({ name: '', lat: 37.7749, lng: -122.4194 });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  // Dispatch Actions
  const updateDispatchStatus = async (id, status) => {
    try {
      await fetch(`/api/admin/dispatches/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteDispatch = async (id) => {
    try {
      await fetch(`/api/admin/dispatches/${id}`, { method: 'DELETE' });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  // Alert Actions
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!newAlert.message) return;
    try {
      await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert)
      });
      setShowAddAlert(false);
      setNewAlert({ hospitalId: 'HOSP-01', bloodType: 'O-', urgency: 'critical', message: '' });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  const dismissAlert = async (id) => {
    try {
      await fetch(`/api/admin/alerts/${id}`, { method: 'DELETE' });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-5xl h-[88vh] glass-panel rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">LifeStream Administrator Command Suite</h3>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  ROOT ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-400">Network control, hospital reserves, donor authentication & cold-chain audit</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              title="Refresh Data"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-slate-800/80 bg-slate-900/50 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview & KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('donors')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'donors'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Donors ({donors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hospitals')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'hospitals'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Hospital className="w-4 h-4" />
            <span>Hospital Blood Banks ({hospitals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dispatches')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'dispatches'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Dispatch Telemetry ({dispatches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'alerts'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Emergency Alerts ({alerts.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Top Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-medium block">Total Donors</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-white">{stats.totalDonors}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-medium block">Verified Network</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-emerald-400">{stats.verifiedPercentage}%</span>
                    <span className="text-[10px] text-slate-500">({stats.verifiedDonors})</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-medium block">Trauma Centers</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-white">{stats.totalHospitals}</span>
                    <span className="text-[10px] text-rose-400 font-semibold">SF Bay</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-medium block">Active Drones</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-rose-400">{stats.activeDispatches}</span>
                    <span className="text-[10px] text-amber-400">In-Flight</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-medium block">Total Reserve Units</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-teal-400">{stats.totalReserveUnits}</span>
                    <span className="text-[10px] text-slate-500">units</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[11px] text-slate-400 font-medium block">Avg Reliability</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-cyan-400">{stats.avgReliability}</span>
                    <span className="text-[10px] text-cyan-400 font-semibold">/100</span>
                  </div>
                </div>
              </div>

              {/* Regional Blood Bank Reserve Distribution */}
              <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">Regional Blood Bank Reserve Aggregate</h4>
                    <p className="text-xs text-slate-400">Total units available across all registered medical trauma centers</p>
                  </div>
                  <span className="text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-lg">
                    {stats.totalReserveUnits} Total Units
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                  {Object.entries(stats.aggregateInventory).map(([type, units]) => {
                    const isUniversal = type === 'O-';
                    const isCritical = units <= 2;
                    return (
                      <div
                        key={type}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isCritical
                            ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-bold text-xs">{type}</span>
                          {isUniversal && <span className="text-[9px] bg-red-500 text-white px-1 rounded">UNIV</span>}
                        </div>
                        <span className="text-xl font-bold font-mono block mt-1">{units}</span>
                        <span className="text-[10px] text-slate-500 block">units in bank</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions & Shortage Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Live Emergency Shortage Broadcasts</h4>
                  {alerts.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4">No active blood shortage broadcasts currently active.</p>
                  ) : (
                    <div className="space-y-2">
                      {alerts.map(a => (
                        <div key={a.id} className="bg-rose-950/30 border border-rose-500/30 p-3 rounded-lg flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-rose-400">[{a.bloodType}]</span>
                              <span className="text-xs font-semibold text-slate-200">{a.message}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-1">Center: {a.hospitalId} • {new Date(a.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <button
                            onClick={() => dismissAlert(a.id)}
                            className="text-[10px] text-rose-400 hover:text-white bg-rose-500/20 px-2 py-1 rounded border border-rose-500/30 hover:bg-rose-500/40 transition-all"
                          >
                            Resolve
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Recent Dispatch Vectors</h4>
                  {dispatches.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4">No dispatch missions recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {dispatches.slice(0, 3).map(d => (
                        <div key={d.id} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-lg flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{d.id}</span>
                              <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{d.transportType}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{d.donorName} ({d.donorBloodType}) → {d.hospitalName}</p>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            d.status === 'En Route'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              : d.status === 'Arrived'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                            {d.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DONOR MANAGEMENT */}
          {activeTab === 'donors' && (
            <div className="space-y-4">
              {/* Action bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-rose-500/60 transition-all"
                      placeholder="Search donor name or phone..."
                      value={donorSearch}
                      onChange={e => setDonorSearch(e.target.value)}
                    />
                  </div>

                  <select
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                    value={donorBloodFilter}
                    onChange={e => setDonorBloodFilter(e.target.value)}
                  >
                    <option value="">All Blood Types</option>
                    {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <select
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                    value={donorVerifiedFilter}
                    onChange={e => setDonorVerifiedFilter(e.target.value)}
                  >
                    <option value="">All Verification</option>
                    <option value="true">Verified Only</option>
                    <option value="false">Unverified Only</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowAddDonor(!showAddDonor)}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-rose-600/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Donor</span>
                </button>
              </div>

              {/* Add Donor Form Drawer */}
              {showAddDonor && (
                <form onSubmit={handleCreateDonor} className="bg-slate-900/90 border border-rose-500/40 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Full Name</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      placeholder="e.g. Rachel Adams"
                      value={newDonor.name}
                      onChange={e => setNewDonor(d => ({ ...d, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Blood Type</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      value={newDonor.bloodType}
                      onChange={e => setNewDonor(d => ({ ...d, bloodType: e.target.value }))}
                    >
                      {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Phone</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      placeholder="+1 415-555-0100"
                      value={newDonor.phone}
                      onChange={e => setNewDonor(d => ({ ...d, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Reliability Score</label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      value={newDonor.reliabilityScore}
                      onChange={e => setNewDonor(d => ({ ...d, reliabilityScore: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition-all"
                    >
                      Save Donor
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddDonor(false)}
                      className="px-2.5 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Donors Table */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Donor Name</th>
                        <th className="px-4 py-3">Blood Type</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Reliability</th>
                        <th className="px-4 py-3">Donations</th>
                        <th className="px-4 py-3">Verification</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {donors.map(donor => (
                        <tr key={donor.id} className="hover:bg-slate-800/40 transition-all">
                          <td className="px-4 py-3 font-semibold text-white">
                            <div className="flex items-center gap-2">
                              <span>{donor.name}</span>
                              {donor.bloodType === 'O-' && (
                                <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded font-mono">
                                  Universal
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-rose-400">{donor.bloodType}</td>
                          <td className="px-4 py-3 text-slate-400 font-mono">{donor.phone || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-cyan-400">{donor.reliabilityScore || 90}%</span>
                              <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-cyan-400 rounded-full"
                                  style={{ width: `${donor.reliabilityScore || 90}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono">{donor.totalDonations || 0} units</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleDonorVerification(donor.id, donor.isVerified)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                                donor.isVerified
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                              }`}
                            >
                              {donor.isVerified ? (
                                <>
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Verified</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Pending</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => deleteDonor(donor.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Delete Donor"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOSPITAL BLOOD BANKS & INVENTORY */}
          {activeTab === 'hospitals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-white">Trauma Center Reserve Management</h4>
                  <p className="text-[11px] text-slate-400">Inline adjust inventory levels for emergency stock matching</p>
                </div>
                <button
                  onClick={() => setShowAddHospital(!showAddHospital)}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-rose-600/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medical Center</span>
                </button>
              </div>

              {/* Add Hospital Form */}
              {showAddHospital && (
                <form onSubmit={handleCreateHospital} className="bg-slate-900/90 border border-rose-500/40 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Center Name</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      placeholder="e.g. Kaiser Permanente SF"
                      value={newHospital.name}
                      onChange={e => setNewHospital(h => ({ ...h, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      value={newHospital.lat}
                      onChange={e => setNewHospital(h => ({ ...h, lat: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      value={newHospital.lng}
                      onChange={e => setNewHospital(h => ({ ...h, lng: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition-all"
                    >
                      Save Hospital
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddHospital(false)}
                      className="px-2.5 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Hospital Cards with +/- buttons */}
              <div className="space-y-4">
                {hospitals.map(h => (
                  <div key={h.id} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <Hospital className="w-4 h-4 text-rose-400" />
                          <h4 className="font-bold text-sm text-white">{h.name}</h4>
                          <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{h.id}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">GPS: [{h.lat}, {h.lng}]</p>
                      </div>

                      <span className="text-xs font-bold text-slate-300">
                        Total Stock: {Object.values(h.inventory || {}).reduce((a, b) => a + b, 0)} Units
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                      {BLOOD_TYPES.map(type => {
                        const units = (h.inventory && h.inventory[type]) || 0;
                        const isLow = units <= 1;
                        return (
                          <div
                            key={type}
                            className={`p-2.5 rounded-xl border text-center ${
                              isLow
                                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                                : 'bg-slate-950/70 border-slate-800 text-slate-200'
                            }`}
                          >
                            <span className="text-[10px] block font-bold text-slate-400 mb-1">{type}</span>
                            <span className="text-base font-bold font-mono block my-0.5">{units} u</span>
                            <div className="flex items-center justify-center gap-1 mt-1.5">
                              <button
                                onClick={() => adjustHospitalInventory(h.id, type, -1)}
                                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs transition-all"
                              >
                                -
                              </button>
                              <button
                                onClick={() => adjustHospitalInventory(h.id, type, 1)}
                                className="w-6 h-6 rounded bg-rose-600/80 hover:bg-rose-600 text-white font-bold flex items-center justify-center text-xs transition-all"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DISPATCH TELEMETRY AUDIT */}
          {activeTab === 'dispatches' && (
            <div className="space-y-4">
              <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-white">Cold-Chain Drone & Ground Transport Mission Log</h4>
                <p className="text-[11px] text-slate-400">Live vector state, battery telemetry, and temperature compliance</p>
              </div>

              {dispatches.length === 0 ? (
                <div className="bg-slate-900/60 border border-slate-800 p-12 text-center rounded-2xl text-slate-400 text-sm">
                  No active or past dispatch sessions recorded yet. Launch a dispatch from the main radar map.
                </div>
              ) : (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3">Mission ID</th>
                          <th className="px-4 py-3">Transport</th>
                          <th className="px-4 py-3">Route (Donor → Hospital)</th>
                          <th className="px-4 py-3">Cold-Chain Temp</th>
                          <th className="px-4 py-3">Battery</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {dispatches.map(disp => (
                          <tr key={disp.id} className="hover:bg-slate-800/40 transition-all">
                            <td className="px-4 py-3 font-mono font-bold text-white">{disp.id}</td>
                            <td className="px-4 py-3">
                              <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-semibold">
                                {disp.transportType}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <span className="font-semibold text-rose-300">{disp.donorName} ({disp.donorBloodType})</span>
                                <span className="text-slate-500 mx-1.5">→</span>
                                <span className="text-slate-300">{disp.hospitalName}</span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono block">Rem: {disp.remainingMiles} mi • ETA: ~{disp.etaMinutes} min</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 font-mono text-xs">
                                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                                <span className="text-cyan-300 font-bold">{disp.tempCelsius}°C</span>
                                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1 rounded">Safe</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 font-mono text-xs">
                                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-slate-200">{disp.batteryPct}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                                disp.status === 'En Route'
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                  : disp.status === 'Arrived'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : 'bg-slate-800 border-slate-700 text-slate-400'
                              }`}>
                                {disp.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {disp.status === 'En Route' && (
                                  <button
                                    onClick={() => updateDispatchStatus(disp.id, 'Cancelled')}
                                    className="text-[10px] bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded border border-red-500/30 transition-all"
                                  >
                                    Abort
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteDispatch(disp.id)}
                                  className="p-1 text-slate-500 hover:text-slate-300 transition-all"
                                  title="Clear Log"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EMERGENCY BROADCAST ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-white">Emergency Shortage Alerts & Network Broadcasts</h4>
                  <p className="text-[11px] text-slate-400">Broadcast immediate critical supply shortage beacons to regional donors</p>
                </div>
                <button
                  onClick={() => setShowAddAlert(!showAddAlert)}
                  className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-amber-600/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Broadcast New Alert</span>
                </button>
              </div>

              {/* Add Alert Form */}
              {showAddAlert && (
                <form onSubmit={handleCreateAlert} className="bg-slate-900/90 border border-amber-500/40 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Medical Center</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      value={newAlert.hospitalId}
                      onChange={e => setNewAlert(a => ({ ...a, hospitalId: e.target.value }))}
                    >
                      {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Shortage Blood Group</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      value={newAlert.bloodType}
                      onChange={e => setNewAlert(a => ({ ...a, bloodType: e.target.value }))}
                    >
                      {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Emergency Message</label>
                    <input
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      placeholder="e.g. Critical Trauma Shortage — Urgent O- units required"
                      value={newAlert.message}
                      onChange={e => setNewAlert(a => ({ ...a, message: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2 rounded-lg transition-all"
                    >
                      Broadcast
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddAlert(false)}
                      className="px-2.5 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Alerts List */}
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 p-12 text-center rounded-2xl text-slate-400 text-sm">
                    No active emergency broadcasts. All hospital reserves are within safe thresholds.
                  </div>
                ) : (
                  alerts.map(a => (
                    <div key={a.id} className="bg-slate-900/90 border border-rose-500/40 p-4 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-rose-500 text-white px-2 py-0.5 rounded">
                              {a.bloodType} Shortage
                            </span>
                            <span className="text-xs text-slate-400 font-mono">{a.id}</span>
                            <span className="text-[10px] text-amber-400 font-semibold uppercase">{a.urgency}</span>
                          </div>
                          <p className="text-sm font-semibold text-white mt-1">{a.message}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Location: {a.hospitalId} • Broadcasted {new Date(a.createdAt).toLocaleString()}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => dismissAlert(a.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition-all shrink-0"
                      >
                        Dismiss / Resolved
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
