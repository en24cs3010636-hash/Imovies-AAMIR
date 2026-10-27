import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Film, User, Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { db } from '../services/mockDb';
import { setCredentials } from '../store/authSlice';
import { useToast } from '../components/Toast';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error } = useToast();

  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'user';
  const [role, setRole] = useState<'user' | 'admin'>(initialRole);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      error('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = db.register(username.trim(), email.trim(), password, role);
      dispatch(setCredentials(result));
      success(`Welcome to iMovies, ${result.user.username}!`);
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/movies');
      }
    } catch (err: any) {
      error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminMode = () => {
    const nextRole = role === 'admin' ? 'user' : 'admin';
    setRole(nextRole);
    setSearchParams(nextRole === 'admin' ? { role: 'admin' } : {});
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#111827] border-2 border-[#d62839] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#d62839]/15 rounded-full blur-3xl pointer-events-none" />

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
            {role === 'admin' ? 'Admin Registration' : 'Create an Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {role === 'admin'
              ? 'Register with full cinema administrative privileges'
              : 'Join to reserve seats, track bookings, and get movie perks'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Enter your full name or nickname"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d62839] transition-colors"
              />
            </div>
          </div>

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
                placeholder="Minimum 6 characters"
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d62839] transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="showPass"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-[#d62839] focus:ring-[#d62839] bg-[#1f2538] accent-[#d62839]"
            />
            <label htmlFor="showPass" className="text-xs text-slate-300 select-none cursor-pointer">
              Show Password
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-full bg-[#d62839] hover:bg-[#b52230] text-white font-semibold text-sm transition-all shadow-lg shadow-red-900/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Submit'}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 pt-6 border-t border-[#252f44] text-center space-y-2 text-xs">
          <p className="text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#d62839] font-semibold hover:underline">
              Login
            </Link>
          </p>

          <p>
            <button
              onClick={toggleAdminMode}
              className="text-amber-400 font-medium hover:underline inline-flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5" />
              {role === 'admin' ? 'Register as a regular User' : 'Register as an Admin'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
