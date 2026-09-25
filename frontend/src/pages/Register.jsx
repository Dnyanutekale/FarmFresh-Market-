import React, { useState } from 'react';
import { User, Mail, Lock, Phone, MapPin, Sprout, Building2, FileText, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register({ onNavigate, defaultRole }) {
  const { register } = useAuth();
  const [role, setRole] = useState(defaultRole || 'customer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    farm_name: '',
    farm_location: '',
    bio: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 2) return { level: score, label: 'Weak', color: 'bg-red-400' };
    if (score <= 3) return { level: score, label: 'Fair', color: 'bg-amber-400' };
    return { level: score, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        role,
      };

      if (role === 'farmer') {
        userData.farm_name = formData.farm_name || undefined;
        userData.farm_location = formData.farm_location || undefined;
        userData.bio = formData.bio || undefined;
      }

      const user = await register(userData);
      if (user.role === 'farmer') {
        onNavigate('farmer-dashboard');
      } else {
        onNavigate('home');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-farm-50/60 to-earth-50">
      <div className="w-full max-w-lg">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-farm-700 to-farm-500 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-farm-700/20">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Join FarmFresh</h1>
          <p className="text-slate-500 text-sm mt-1">Create your account and start exploring farm-fresh produce</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-earth-200/40 border border-earth-200/60 p-8">
          {/* Role Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">I want to</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                  role === 'customer'
                    ? 'border-farm-600 bg-farm-50 text-farm-800'
                    : 'border-earth-200 text-slate-500 hover:border-earth-300'
                }`}
              >
                🛒 Buy Produce
              </button>
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                  role === 'farmer'
                    ? 'border-farm-600 bg-farm-50 text-farm-800'
                    : 'border-earth-200 text-slate-500 hover:border-earth-300'
                }`}
              >
                🌾 Sell as Farmer
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-earth-300 text-sm focus:outline-none focus:border-farm-600 focus:ring-2 focus:ring-farm-600/20"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-earth-300 text-sm focus:outline-none focus:border-farm-600 focus:ring-2 focus:ring-farm-600/20"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-earth-300 text-sm focus:outline-none focus:border-farm-600 focus:ring-2 focus:ring-farm-600/20"
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-earth-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${strength.color}`}
                      style={{ width: `${(strength.level / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{strength.label}</span>
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-earth-300 text-sm focus:outline-none focus:border-farm-600 focus:ring-2 focus:ring-farm-600/20"
                  placeholder="+91-9876543210"
                />
              </div>
            </div>

            {/* Farmer-specific Fields */}
            {role === 'farmer' && (
              <div className="space-y-4 pt-3 border-t border-earth-200">
                <p className="text-xs font-bold text-farm-700 uppercase tracking-wider">Farm Details</p>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Farm Name</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="farm_name"
                      value={formData.farm_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-earth-300 text-sm focus:outline-none focus:border-farm-600 focus:ring-2 focus:ring-farm-600/20"
                      placeholder="e.g., Green Valley Organic Farm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Farm Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="farm_location"
                      value={formData.farm_location}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-earth-300 text-sm focus:outline-none focus:border-farm-600 focus:ring-2 focus:ring-farm-600/20"
                      placeholder="e.g., Nashik, Maharashtra"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">About Your Farm</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-earth-300 text-sm focus:outline-none focus:border-farm-600 focus:ring-2 focus:ring-farm-600/20 resize-none"
                      placeholder="Tell customers about your farming practices, specialties..."
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-farm-700 hover:bg-farm-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md shadow-farm-700/20 hover:shadow-lg mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {role === 'farmer' ? 'Register as Farmer' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-semibold text-farm-700 hover:text-farm-800 hover:underline"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
