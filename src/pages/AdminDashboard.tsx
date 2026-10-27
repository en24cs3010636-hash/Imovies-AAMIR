import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Film,
  PlusCircle,
  Building2,
  CalendarDays,
  Ticket,
  Trash2,
  DollarSign,
  Users,
  ShieldCheck,
  Home,
  Sun,
  Moon,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { RootState } from '../store/store';
import { db } from '../services/mockDb';
import { refreshShows } from '../store/showsSlice';
import { refreshMovies } from '../store/moviesSlice';
import { logoutUser } from '../store/authSlice';
import { useToast } from '../components/Toast';
import { Booking, Show } from '../types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { success, error, info } = useToast();

  const { shows } = useSelector((state: RootState) => state.shows);
  const { movies } = useSelector((state: RootState) => state.movies);
  const { theatres } = useSelector((state: RootState) => state.theatres);
  const { user } = useSelector((state: RootState) => state.auth);

  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const loadData = () => {
    dispatch(refreshShows());
    dispatch(refreshMovies());
    setAllBookings(db.getBookings());
  };

  useEffect(() => {
    loadData();
    const savedTheme = (localStorage.getItem('imovies_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);

    const handleRealtime = () => {
      loadData();
    };
    window.addEventListener('imovies:realtime', handleRealtime);
    return () => window.removeEventListener('imovies:realtime', handleRealtime);
  }, [dispatch]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('imovies_theme', next);
  };

  const handleDeleteShow = (showId: string) => {
    if (window.confirm('Are you sure you want to delete this show and release all associated seats?')) {
      db.deleteShow(showId);
      dispatch(refreshShows());
      success('Show deleted successfully.');
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    info('Logged out of admin console');
    navigate('/login');
  };

  const totalRevenue = allBookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="min-h-screen bg-[#1f2538] text-slate-100">
      {/* Admin Specific Sub-Navbar with Navigation Icons */}
      <div className="bg-[#111827] border-b border-[#252f44] px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#d62839]/20 border border-[#d62839]/40 text-[#d62839] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Control
            </span>
            <span className="text-sm font-semibold text-slate-300 hidden sm:inline">
              Welcome, {user?.username}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              to="/"
              className="p-2 rounded-lg bg-[#1f2538] hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Home"
            >
              <Home className="w-4 h-4" />
            </Link>
            <Link
              to="/admin/movies/add"
              className="px-3 py-1.5 rounded-lg bg-[#d62839] hover:bg-[#b52230] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-red-900/30"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Add Movie
            </Link>
            <Link
              to="/admin/shows/add"
              className="px-3 py-1.5 rounded-lg bg-[#1f2538] hover:bg-slate-700 text-slate-200 border border-[#2a3449] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5 text-blue-400" /> Add Show
            </Link>
            <Link
              to="/admin/theatres/add"
              className="px-3 py-1.5 rounded-lg bg-[#1f2538] hover:bg-slate-700 text-slate-200 border border-[#2a3449] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Add Theatre
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[#1f2538] hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-[#1f2538] hover:bg-rose-900/50 text-rose-400 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-10">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111827] border border-[#2a3449] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">${totalRevenue.toFixed(2)}</div>
            <span className="text-[10px] text-slate-500 mt-1 block">From confirmed ticket bookings</span>
          </div>

          <div className="bg-[#111827] border border-[#2a3449] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Active Shows</span>
              <CalendarDays className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{shows.length}</div>
            <span className="text-[10px] text-slate-500 mt-1 block">Scheduled across multiplexes</span>
          </div>

          <div className="bg-[#111827] border border-[#2a3449] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Catalog Movies</span>
              <Film className="w-4 h-4 text-[#d62839]" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{movies.length}</div>
            <span className="text-[10px] text-slate-500 mt-1 block">Now showing / available</span>
          </div>

          <div className="bg-[#111827] border border-[#2a3449] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium">Total Bookings</span>
              <Ticket className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{allBookings.length}</div>
            <span className="text-[10px] text-slate-500 mt-1 block">All registered user reservations</span>
          </div>
        </div>

        {/* SECTION 1: Admin Shows */}
        <section>
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#252f44]">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Admin <span className="text-[#d62839]">Shows</span>
            </h2>
            <Link
              to="/admin/shows/add"
              className="text-xs font-semibold text-[#d62839] hover:underline flex items-center gap-1"
            >
              + Create New Show
            </Link>
          </div>

          {shows.length === 0 ? (
            <div className="bg-[#111827] border border-[#2a3449] rounded-2xl p-8 text-center text-slate-400">
              <CalendarDays className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm">No shows scheduled currently.</p>
              <Link
                to="/admin/shows/add"
                className="mt-3 inline-block px-4 py-1.5 rounded-full bg-[#d62839] text-white text-xs font-semibold"
              >
                Schedule First Show
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {shows.map((show) => (
                <div
                  key={show.id}
                  className="bg-[#111827] border border-[#2a3449] rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#d62839] uppercase tracking-wider block">
                          Movie
                        </span>
                        <h3 className="text-base font-bold text-white leading-tight">
                          {show.movie?.name || 'Untitled Movie'}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleDeleteShow(show.id)}
                        className="px-2.5 py-1 rounded-lg border border-[#d62839] text-[#d62839] hover:bg-[#d62839] hover:text-white transition-colors text-xs font-semibold flex items-center gap-1 shrink-0"
                        title="Delete Show"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-[#1f2538]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Theatre:</span>
                        <span className="font-medium text-white truncate max-w-[180px]">
                          {show.theatre?.name || 'Grand Cinema'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Show Date:</span>
                        <span className="font-mono text-slate-200">{show.showDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Show Time:</span>
                        <span className="font-mono text-amber-400 font-bold">{show.showTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1f2538] flex items-center justify-between text-[11px] text-slate-500">
                    <span>Show ID: #{show.id.slice(-6).toUpperCase()}</span>
                    <Link
                      to={`/movies/${show.movieId}`}
                      className="text-xs text-[#d62839] hover:underline"
                    >
                      View Seat Map →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: All Bookings */}
        <section>
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#252f44]">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              All <span className="text-[#d62839]">Bookings</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Total {allBookings.length} records
            </span>
          </div>

          {allBookings.length === 0 ? (
            <div className="bg-[#111827] border border-[#2a3449] rounded-2xl p-8 text-center text-slate-400">
              <Ticket className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm">No ticket bookings yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {allBookings.map((b) => (
                <div
                  key={b.id}
                  className={`bg-[#111827] border rounded-2xl p-5 shadow-lg flex flex-col justify-between ${
                    b.status === 'cancelled'
                      ? 'border-rose-950/40 opacity-70'
                      : 'border-[#2a3449]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1f2538]">
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        REF: #{b.id.slice(-6).toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">User Email</span>
                        <span className="font-semibold text-white truncate block">{b.userEmail}</span>
                      </div>
                      <div className="pt-1">
                        <span className="text-slate-500 block text-[10px] uppercase">Movie</span>
                        <span className="font-medium text-amber-300">{b.show?.movie?.name || 'Movie'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Theatre</span>
                        <span className="text-slate-200">{b.show?.theatre?.name || 'Cinema'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Date & Time</span>
                          <span className="font-mono text-slate-300">
                            {b.show?.showDate} · {b.show?.showTime}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Seats</span>
                          <span className="font-mono font-bold text-[#d62839]">{b.seats.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1f2538] flex items-center justify-between">
                    <span className="text-xs text-slate-500">Tier: {b.seatType}</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      ${b.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
