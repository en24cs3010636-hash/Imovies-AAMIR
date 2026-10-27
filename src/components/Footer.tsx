import React from 'react';
import { Film, ShieldCheck, Clock, CreditCard, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#111827] border-t border-[#252f44] mt-auto py-12 px-4 lg:px-8 text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#d62839]/15 flex items-center justify-center text-[#d62839] border border-[#d62839]/30">
              <Film className="w-4 h-4 text-[#d62839]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              <span className="text-[#d62839]">i</span>Movies
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Movie ticket booking made simple. Real-time seat updates, instant confirmation, and seamless cinema experiences.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time seat engine active</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Quick Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/movies" className="hover:text-white transition-colors">Available Movies</Link></li>
            <li><Link to="/bookings" className="hover:text-white transition-colors">Your Bookings</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Cinema Technologies</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> IMAX Laser Projection</li>
            <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> Dolby Atmos 64-Channel</li>
            <li className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-blue-400" /> 5-Minute Seat Reservation Lock</li>
            <li className="flex items-center gap-2"><CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Zero Convenience Fee</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Admin & Demo Credentials</h4>
          <div className="bg-[#1f2538] p-3 rounded-lg border border-[#2a3449] text-xs space-y-1.5 font-mono">
            <p className="text-slate-300"><span className="text-[#d62839] font-bold">Admin:</span> admin@imovies.com</p>
            <p className="text-slate-400">Pass: admin123</p>
            <div className="border-t border-slate-700 my-1 pt-1"></div>
            <p className="text-slate-300"><span className="text-blue-400 font-bold">User:</span> user@imovies.com</p>
            <p className="text-slate-400">Pass: user123</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-[#252f44] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <p>© {new Date().getFullYear()} iMovies Inc. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span className="hover:text-slate-200 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-200 cursor-pointer">Terms of Service</span>
          <span className="hover:text-slate-200 cursor-pointer">Contact Support</span>
        </div>
      </div>
    </footer>
  );
};
