import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Film,
  Calendar,
  Clock,
  Play,
  ArrowLeft,
  MapPin,
  Heart,
  Share2,
  Sparkles,
  Building2,
  Check
} from 'lucide-react';
import { RootState } from '../store/store';
import { setCurrentShow, setLockTimer } from '../store/bookingSlice';
import { toggleFavorite } from '../store/moviesSlice';
import { db } from '../services/mockDb';
import { SeatMap } from '../components/SeatMap';
import { TrailerModal } from '../components/TrailerModal';
import { useToast } from '../components/Toast';
import { Show, Movie } from '../types';

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { success, error, info } = useToast();

  const { movies, favorites } = useSelector((state: RootState) => state.movies);
  const { shows } = useSelector((state: RootState) => state.shows);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { currentShow, selectedSeats, totalPrice } = useSelector((state: RootState) => state.booking);

  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const movie = useMemo(() => {
    return movies.find(m => m.id === id) || db.getMovieById(id || '');
  }, [movies, id]);

  const movieShows = useMemo(() => {
    return shows.filter(s => s.movieId === id);
  }, [shows, id]);

  // Extract unique show dates
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(movieShows.map(s => s.showDate))).sort();
    return dates;
  }, [movieShows]);

  useEffect(() => {
    if (availableDates.length > 0 && (!selectedDate || !availableDates.includes(selectedDate))) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  // Filter shows by selected date
  const filteredShowsByDate = useMemo(() => {
    return movieShows.filter(s => s.showDate === selectedDate);
  }, [movieShows, selectedDate]);

  // Group shows by Theatre
  const showsByTheatre = useMemo(() => {
    const map: Record<string, Show[]> = {};
    filteredShowsByDate.forEach(s => {
      const tName = s.theatre?.name || 'Grand Cinema';
      if (!map[tName]) map[tName] = [];
      map[tName].push(s);
    });
    return map;
  }, [filteredShowsByDate]);

  // Select initial show if none selected
  useEffect(() => {
    if (filteredShowsByDate.length > 0 && (!currentShow || currentShow.movieId !== id)) {
      dispatch(setCurrentShow(filteredShowsByDate[0]));
    }
  }, [filteredShowsByDate, currentShow, id, dispatch]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#1f2538] text-white flex items-center justify-center p-8">
        <div className="text-center">
          <Film className="w-12 h-12 text-[#d62839] mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Movie Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">The requested movie could not be located in our catalog.</p>
          <Link to="/movies" className="px-6 py-2.5 rounded-full bg-[#d62839] text-white text-xs font-semibold">
            Back to Available Movies
          </Link>
        </div>
      </div>
    );
  }

  const isFav = favorites.includes(movie.id);

  const handleSelectShow = (show: Show) => {
    dispatch(setCurrentShow(show));
    info(`Selected ${show.theatre?.name} at ${show.showTime}`);
  };

  const handleProceedToPayment = () => {
    if (!isAuthenticated) {
      info('Please sign in or create an account to finalize your booking.');
      navigate('/login', { state: { from: { pathname: `/movies/${movie.id}` } } });
      return;
    }

    if (!currentShow || selectedSeats.length === 0) {
      error('Please select at least one seat to book.');
      return;
    }

    // Lock seats in database for 5 minutes
    const seatNumbers = selectedSeats.map(s => s.seatNumber);
    const lockResult = db.lockSeats(currentShow.id, seatNumbers, user!.id);

    if (!lockResult.success) {
      error(lockResult.message || 'Failed to lock seats. Some seats may have just been taken.');
      return;
    }

    // Set 5-minute lock timer
    const lockExpiry = Date.now() + 5 * 60 * 1000;
    dispatch(setLockTimer(lockExpiry));

    success(`Locked ${selectedSeats.length} seat(s) for 5 minutes.`);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#1f2538] text-slate-100 py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/movies"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Movies
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(toggleFavorite(movie.id))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111827] border border-[#2a3449] text-xs font-semibold hover:border-rose-500 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-[#d62839] text-[#d62839]' : 'text-slate-400'}`} />
              <span>{isFav ? 'Favorited' : 'Add to Favorites'}</span>
            </button>
          </div>
        </div>

        {/* HERO: Movie Details & Trailer Split */}
        <div className="bg-[#111827] border border-[#2a3449] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Poster */}
            <div className="md:col-span-4 lg:col-span-3">
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-[#2a3449] group bg-slate-900">
                <img
                  src={movie.poster}
                  alt={movie.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="absolute inset-0 bg-black/40 hover:bg-black/60 flex flex-col items-center justify-center gap-2 transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-[#d62839] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide">Watch Trailer</span>
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-3">
                  <span className="px-3 py-1 rounded-md bg-[#d62839] text-white text-xs font-bold uppercase tracking-wider">
                    {movie.certification}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-300 font-medium">{movie.language}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {movie.runtime} mins
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {movie.releaseDate}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                  {movie.name}
                </h1>

                {/* Genre Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genres.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 rounded-full bg-[#1f2538] border border-[#2a3449] text-xs font-semibold text-[#d62839]"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                  {movie.description}
                </p>
              </div>

              {/* Cinema audio/visual perks */}
              <div className="pt-4 border-t border-[#252f44] flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-400" /> 4K Ultra Laser Clarity</span>
                <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-blue-400" /> Dolby Atmos Surround</span>
                <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-emerald-400" /> Instant E-Ticket On Smartphone</span>
              </div>
            </div>
          </div>
        </div>

        {/* SHOWTIMES & SEAT SELECTION SECTION */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#252f44]">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Select <span className="text-[#d62839]">Showtime</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Pick a date and cinema screen to view real-time seat availability</p>
            </div>

            {/* Date Tabs */}
            {availableDates.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {availableDates.map((dateStr) => {
                  const dateObj = new Date(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`px-4 py-2 rounded-xl text-center transition-all ${
                        isSelected
                          ? 'bg-[#d62839] text-white shadow-lg shadow-red-900/40'
                          : 'bg-[#111827] text-slate-300 hover:text-white border border-[#2a3449]'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold block opacity-80">{dayName}</span>
                      <span className="text-xs font-bold font-mono">{dayNum}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* List of Shows Grouped by Theatre */}
          {movieShows.length === 0 ? (
            <div className="bg-[#111827] border border-[#2a3449] rounded-2xl p-8 text-center text-slate-400">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm">No shows scheduled yet for this movie.</p>
              {user?.role === 'admin' && (
                <Link
                  to="/admin/shows/add"
                  className="mt-3 inline-block px-4 py-1.5 rounded-full bg-[#d62839] text-white text-xs font-semibold"
                >
                  Schedule a Show as Admin
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(showsByTheatre).map(([theatreName, tShows]) => (
                <div
                  key={theatreName}
                  className="bg-[#111827] border border-[#2a3449] rounded-2xl p-5 shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-3 text-slate-300">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">{theatreName}</h3>
                    <span className="text-xs text-slate-500">· {tShows[0]?.theatre?.location}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {tShows.map((s) => {
                      const isShowActive = currentShow?.id === s.id;

                      return (
                        <button
                          key={s.id}
                          onClick={() => handleSelectShow(s)}
                          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                            isShowActive
                              ? 'bg-[#d62839] text-white ring-2 ring-red-400 shadow-md shadow-red-900/40'
                              : 'bg-[#1f2538] text-slate-200 border border-[#2a3449] hover:border-slate-500'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{s.showTime}</span>
                          {isShowActive && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VISUAL SEAT MAP */}
          {currentShow && (
            <div className="pt-6">
              <div className="flex items-center justify-between pb-3 mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Visual Seat Map —</span>
                  <span className="text-[#d62839] font-mono">{currentShow.showTime}</span>
                  <span className="text-xs text-slate-400 font-normal">({currentShow.theatre?.name})</span>
                </h3>
              </div>

              <SeatMap
                show={currentShow}
                onProceed={handleProceedToPayment}
              />
            </div>
          )}
        </section>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={movie.trailerUrl}
        movieName={movie.name}
      />
    </div>
  );
};
