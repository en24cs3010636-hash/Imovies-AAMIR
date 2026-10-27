import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Film, Mail, Lock, Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react';
import { db } from '../services/mockDb';
import { setCredentials } from '../store/authSlice';
import { useToast } from '../components/Toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/movies';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      error('Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const result = db.login(email.trim(), password);
      dispatch(setCredentials(result));
      success(`Welcome back, ${result.user.username}!`);
      if (result.user.role === 'admin' && from === '/movies') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (err: any) {
      error(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    try {
      const result = db.login(demoEmail, demoPass);
      dispatch(setCredentials(result));
      success(`Logged in as ${result.user.role === 'admin' ? 'Administrator' : 'User'}`);
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/movies');
      }
    } catch (err: any) {
      error(err.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#111827] border-2 border-[#d62839] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#d62839]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-10 h-10 rounded-xl bg-[#d62839]/15 flex items-center justify-center text-[#d62839] border border-[#d62839]/40 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-[#d62839]" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight">
              <span className="text-[#d62839]">i</span>
              <span className="text-white">Movies</span>
            </span>
          </Link>
          <h2 className="text-lg font-bold text-white tracking-wide mt-2">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to manage your tickets, seats, and movie preferences
          </p>
        </div>

        {/* Quick Demo Login Bar */}
        <div className="mb-6 p-3 rounded-xl bg-[#1f2538] border border-[#2a3449]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 text-center">
            One-Click Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@imovies.com', 'admin123')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('user@imovies.com', 'user123')}
              className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              User Demo
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d62839] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d62839] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPassLogin"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-[#d62839] focus:ring-[#d62839] bg-[#1f2538] accent-[#d62839]"
              />
              <label htmlFor="showPassLogin" className="text-xs text-slate-300 select-none cursor-pointer">
                Show Password
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-full bg-[#d62839] hover:bg-[#b52230] text-white font-semibold text-sm transition-all shadow-lg shadow-red-900/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Submit'}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 pt-6 border-t border-[#252f44] text-center text-xs">
          <p className="text-slate-400">
            Create an account{' '}
            <Link to="/register" className="text-[#d62839] font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
