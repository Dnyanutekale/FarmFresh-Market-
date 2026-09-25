import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sprout, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@farmfresh.com', password: 'Pass123!', role: 'admin', color: 'purple' },
  { label: 'Farmer (Ramesh)', email: 'farmer.ramesh@farmfresh.com', password: 'Pass123!', role: 'farmer', color: 'green' },
  { label: 'Farmer (Anita)', email: 'farmer.anita@farmfresh.com', password: 'Pass123!', role: 'farmer', color: 'emerald' },
  { label: 'Customer', email: 'customer@example.com', password: 'Pass123!', role: 'customer', color: 'blue' },
];

export default function Login({ onNavigate, redirectTo }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (redirectTo) {
        onNavigate(redirectTo);
      } else if (user.role === 'farmer') {
        onNavigate('farmer-dashboard');
      } else if (user.role === 'admin') {
        onNavigate('admin-dashboard');
      } else {
        onNavigate('home');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setLoading(true);
    try {
      const user = await login(account.email, account.password);
      if (user.role === 'farmer') {
        onNavigate('farmer-dashboard');
      } else if (user.role === 'admin') {
        onNavigate('admin-dashboard');
      } else {
        onNavigate('home');
      }
    } catch (err) {
      setError(err.message || 'Demo login failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-farm-50/60 to-earth-50">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-farm-700 to-farm-500 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-farm-700/20">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to FarmFresh Market</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-earth-200/40 border border-earth-200/60 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-earth-300 text-sm focus:outline-none focus:border-farm-600 focus:ring-2 focus:ring-farm-600/20 transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-earth-300 text-sm focus:outline-none focus:border-farm-600 focus:ring-2 focus:ring-farm-600/20 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-farm-700 hover:bg-farm-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md shadow-farm-700/20 hover:shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="font-semibold text-farm-700 hover:text-farm-800 hover:underline"
            >
              Create one free
            </button>
          </div>
        </div>

        {/* Demo Accounts Quick Login */}
        <div className="mt-6 bg-white rounded-3xl shadow-lg shadow-earth-200/30 border border-earth-200/60 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800">Quick Demo Login</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => handleDemoLogin(account)}
                disabled={loading}
                className="flex flex-col items-start gap-0.5 p-3 rounded-xl border border-earth-200 hover:border-farm-300 hover:bg-farm-50/60 transition-all text-left disabled:opacity-50"
              >
                <span className="text-xs font-bold text-slate-800">{account.label}</span>
                <span className="text-[10px] text-slate-400 truncate w-full">{account.email}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-3 text-center">
            All demo passwords: <code className="bg-earth-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">Pass123!</code>
          </p>
        </div>
      </div>
    </div>
  );
}
