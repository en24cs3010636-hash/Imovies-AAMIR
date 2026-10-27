import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Film,
  Search,
  Sun,
  Moon,
  Heart,
  Ticket,
  ShieldAlert,
  Bell,
  LogOut,
  User as UserIcon,
  Home,
  Check
} from 'lucide-react';
import { RootState } from '../store/store';
import { logoutUser } from '../store/authSlice';
import { setSearchQuery } from '../store/moviesSlice';
import { loadUserNotifications, markAllRead } from '../store/notificationSlice';
import { useToast } from './Toast';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { info } = useToast();

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { searchQuery, favorites } = useSelector((state: RootState) => state.movies);
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('imovies_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('imovies_theme', nextTheme);
  };

  useEffect(() => {
    if (user?.id) {
      dispatch(loadUserNotifications(user.id));
    }
  }, [user, dispatch]);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    info('Logged out successfully');
    navigate('/');
  };

  const handleMarkNotificationsRead = () => {
    if (user?.id) {
      dispatch(markAllRead(user.id));
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#161b2b] border-b border-[#252f44] px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-8 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-[#d62839]/15 flex items-center justify-center text-[#d62839] border border-[#d62839]/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-[#d62839]" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-[#d62839]">i</span>
              <span className="text-white">Movies</span>
            </span>
          </Link>

          {/* Primary Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link
              to="/"
              className={`flex items-center gap-1.5 transition-colors hover:text-white ${
                location.pathname === '/' ? 'text-[#d62839] font-semibold' : ''
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/movies"
              className={`flex items-center gap-1.5 transition-colors hover:text-white ${
                location.pathname === '/movies' ? 'text-[#d62839] font-semibold' : ''
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Available Movies</span>
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/bookings"
                  className={`flex items-center gap-1.5 transition-colors hover:text-white ${
                    location.pathname === '/bookings' ? 'text-[#d62839] font-semibold' : ''
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>Your Bookings</span>
                </Link>
              </>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors ${
                  location.pathname.startsWith('/admin') ? 'font-bold' : ''
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Search Bar (Responsive) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search movies, genres, languages..."
              value={searchQuery}
              onChange={(e) => {
                dispatch(setSearchQuery(e.target.value));
                if (location.pathname !== '/movies') {
                  navigate('/movies');
                }
              }}
              className="w-full bg-[#111827] border border-[#2a3449] rounded-full pl-10 pr-4 py-1.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#d62839] transition-all"
            />
          </div>
        </div>

        {/* Right Action Zone */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          </button>

          {/* Favorites link if logged in */}
          {isAuthenticated && (
            <Link
              to="/movies?filter=favorites"
              title="Favorite Movies"
              className="p-2 rounded-full text-slate-300 hover:text-rose-400 hover:bg-slate-800 transition-colors relative"
            >
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#d62839] text-white text-[10px] font-bold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
          )}

          {/* Notifications Dropdown */}
          {isAuthenticated && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (unreadCount > 0) handleMarkNotificationsRead();
                }}
                title="Notifications"
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#d62839] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111827] border border-[#2a3449] rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-[#2a3449]">
                    <h4 className="text-sm font-semibold text-white">Notifications</h4>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleMarkNotificationsRead}
                        className="text-xs text-[#d62839] hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#1f2538] mt-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div key={n.id} className="py-2.5 text-xs text-slate-300">
                          <p className="leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile or Sign In */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#2a3449]">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white truncate max-w-[120px]">{user?.username}</span>
                <span className="text-[10px] uppercase font-bold text-[#d62839]">
                  {user?.role === 'admin' ? 'Administrator' : 'Moviegoer'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 rounded-lg bg-[#1f2538] hover:bg-[#d62839] text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#d62839] hover:bg-[#b52230] rounded-full transition-colors whitespace-nowrap shadow-md shadow-red-900/30"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-xs font-semibold text-white border border-[#d62839] hover:bg-[#d62839]/15 rounded-full transition-colors whitespace-nowrap"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
