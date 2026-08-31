import React, { useState, useEffect } from 'react';
import {
  X, Lock, Mail, User, ShieldCheck, Zap, Droplet, Hospital,
  ArrowRight, KeyRound, CheckCircle2, UserCheck, Heart
} from 'lucide-react';

export function AuthModal({ onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('login'); // login | register | demo
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('patient');
  const [regBloodType, setRegBloodType] = useState('O-');
  const [regPhone, setRegPhone] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/demo-accounts');
        const data = await res.json();
        setDemoAccounts(data);
      } catch (e) {}
    })();
  }, []);

  const handleLogin = async (e, customEmail = null, customPass = null) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const email = customEmail || loginEmail;
    const password = customPass || loginPassword;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('lifestream_token', data.token);
      localStorage.setItem('lifestream_user', JSON.stringify(data.user));

      if (onAuthSuccess) onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: regRole,
          bloodType: regBloodType,
          phone: regPhone
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('lifestream_token', data.token);
      localStorage.setItem('lifestream_user', JSON.stringify(data.user));

      if (onAuthSuccess) onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handle1ClickDemo = (acc) => {
    setLoginEmail(acc.email);
    setLoginPassword(acc.password);
    handleLogin(null, acc.email, acc.password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-xl glass-panel p-6 rounded-2xl shadow-2xl border border-slate-700/80 relative flex flex-col max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">LifeStream Account Authentication</h3>
              <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                HIPAA & E2E ENCRYPTED
              </span>
            </div>
            <p className="text-xs text-slate-400">Sign in to manage emergency blood dispatches, donor profiles, and delivery tracks</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 mb-5 text-xs font-semibold">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 rounded-lg transition-all ${tab === 'login' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('demo')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${tab === 'demo' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>1-Click Demo Logins</span>
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 rounded-lg transition-all ${tab === 'register' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-rose-950/50 border border-rose-500/50 p-3 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* TAB 1: LOGIN */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-rose-500/60"
                  placeholder="name@organization.com"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-rose-500/60"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to LifeStream'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: 1-CLICK DEMO ACCESS */}
        {tab === 'demo' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 mb-2">
              Select any preconfigured role profile to explore real-time features instantly without typing credentials:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoAccounts.map(acc => (
                <div
                  key={acc.email}
                  onClick={() => handle1ClickDemo(acc)}
                  className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 p-3.5 rounded-xl cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                        {acc.title}
                      </span>
                      <span className="text-[9px] font-mono uppercase bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                        {acc.role}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-300">{acc.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{acc.description}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-purple-400 font-bold">
                    <span>1-Click Launch</span>
                    <Zap className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REGISTER */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Full Legal Name *</label>
                <input
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500/60"
                  placeholder="e.g. Samantha Cruz"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email Address *</label>
                <input
                  type="email"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500/60"
                  placeholder="samantha@example.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Role Type</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  value={regRole}
                  onChange={e => setRegRole(e.target.value)}
                >
                  <option value="patient">Patient / Requester</option>
                  <option value="donor">Voluntary Donor</option>
                  <option value="hospital">Hospital Staff / Clinician</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Blood Group</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  value={regBloodType}
                  onChange={e => setRegBloodType(e.target.value)}
                >
                  {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Phone Contact</label>
                <input
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  placeholder="+1 415-555-0199"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Secure Password *</label>
              <input
                type="password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500/60"
                placeholder="Minimum 6 characters"
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Creating Profile...' : 'Complete Registration & Sign In'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
