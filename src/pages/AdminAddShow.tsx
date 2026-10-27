import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CalendarDays, ArrowLeft, Clock, Building2, Film, PlusCircle } from 'lucide-react';
import { RootState } from '../store/store';
import { db } from '../services/mockDb';
import { refreshShows } from '../store/showsSlice';
import { useToast } from '../components/Toast';

export const AdminAddShow: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { success, error } = useToast();

  const { movies } = useSelector((state: RootState) => state.movies);
  const { theatres } = useSelector((state: RootState) => state.theatres);
  const { shows } = useSelector((state: RootState) => state.shows);

  const [theatreId, setTheatreId] = useState(theatres[0]?.id || '');
  const [movieId, setMovieId] = useState(movies[0]?.id || '');
  const [showDate, setShowDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showTime, setShowTime] = useState('18:00');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!theatreId || !movieId || !showDate || !showTime) {
      error('Please select all required fields');
      return;
    }

    setLoading(true);
    try {
      db.addShow({
        theatreId,
        movieId,
        showDate,
        showTime
      });

      dispatch(refreshShows());
      const selectedMovie = movies.find(m => m.id === movieId);
      success(`Show for "${selectedMovie?.name || 'Movie'}" scheduled at ${showTime}!`);
      navigate('/admin');
    } catch (err: any) {
      error(err.message || 'Failed to add show');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1f2538] text-slate-100 py-8 px-4 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="text-xs font-bold text-[#d62839] uppercase tracking-wider">
            Show Scheduler
          </span>
        </div>

        {/* Card Form */}
        <div className="bg-[#111827] border border-[#2a3449] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#252f44]">
            <div className="w-10 h-10 rounded-xl bg-[#d62839]/15 border border-[#d62839]/30 flex items-center justify-center text-[#d62839]">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Schedule New <span className="text-[#d62839]">Show</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Assign a movie and showtime to a cinema hall with auto-generated seat tiers
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Theatre Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Select Theatre *
              </label>
              <select
                value={theatreId}
                onChange={(e) => setTheatreId(e.target.value)}
                required
                className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d62839]"
              >
                {theatres.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.location}
                  </option>
                ))}
              </select>
            </div>

            {/* Movie Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Film className="w-4 h-4 text-[#d62839]" />
                Select Movie *
              </label>
              <select
                value={movieId}
                onChange={(e) => setMovieId(e.target.value)}
                required
                className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d62839]"
              >
                {movies.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.certification} · {m.runtime}m · {m.language})
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-blue-400" />
                  Show Date *
                </label>
                <input
                  type="date"
                  required
                  value={showDate}
                  onChange={(e) => setShowDate(e.target.value)}
                  className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d62839]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Showtime *
                </label>
                <input
                  type="time"
                  required
                  value={showTime}
                  onChange={(e) => setShowTime(e.target.value)}
                  className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d62839]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-[#252f44] flex items-center justify-end gap-3">
              <Link
                to="/admin"
                className="px-6 py-2.5 rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 rounded-full bg-[#d62839] hover:bg-[#b52230] text-white text-xs font-semibold transition-all shadow-lg shadow-red-900/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Submit Show'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
