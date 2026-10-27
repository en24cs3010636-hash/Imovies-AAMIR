import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Play, Calendar, Clock, Film, ChevronRight, Shield } from 'lucide-react';
import { RootState } from '../store/store';
import { TrailerModal } from '../components/TrailerModal';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { movies } = useSelector((state: RootState) => state.movies);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [activeTrailer, setActiveTrailer] = useState<{ url: string; name: string } | null>(null);

  const featuredMovies = movies.slice(0, 4);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#d62839] selection:text-white">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Cinematic Backdrop Glow */}
        <div className="absolute inset-0 bg-radial from-[#d62839]/15 via-black/90 to-black z-0 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay z-0 pointer-events-none filter blur-sm scale-105"
          style={{ backgroundImage: `url(${movies[0]?.poster || ''})` }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111827] border border-[#2a3449] text-xs font-medium text-slate-300 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#d62839] animate-ping" />
            <span className="text-[#d62839] font-bold">NEW</span> Live Real-time Seat Booking Engine
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Welcome to <span className="text-[#d62839]">iMovies</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            Your ultimate destination for the latest blockbusters and timeless classics. Pick showtimes, reserve seats in real time, and enjoy cinema at its finest.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/movies"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#d62839] hover:bg-[#b52230] text-white font-semibold text-sm transition-all shadow-xl shadow-red-900/40 hover:scale-105"
              >
                Browse Available Movies
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#d62839] hover:bg-[#b52230] text-white font-semibold text-sm transition-all shadow-xl shadow-red-900/40 hover:scale-105 text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full border-2 border-[#d62839] text-white hover:bg-[#d62839]/15 font-semibold text-sm transition-all text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
            <Link
              to="/movies"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#111827] hover:bg-[#1a2234] border border-[#2a3449] text-slate-200 font-medium text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Explore All Shows</span>
              <ChevronRight className="w-4 h-4 text-[#d62839]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured / Now Showing Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#252f44]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Now</span> <span className="text-[#d62839]">Showing</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Reserve seats with real-time availability across top multiplexes</p>
          </div>
          <Link
            to="/movies"
            className="text-xs font-semibold text-[#d62839] hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            View All Movies <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredMovies.map((movie) => (
            <div
              key={movie.id}
              className="group bg-[#111827] rounded-2xl overflow-hidden border border-[#2a3449] hover:border-[#d62839] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-950/30 flex flex-col"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
                <img
                  src={movie.poster}
                  alt={movie.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80" />

                {/* Certification Badge */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[11px] font-bold text-slate-200 border border-white/10">
                  {movie.certification}
                </span>

                {/* Trailer Play Button */}
                <button
                  onClick={() => setActiveTrailer({ url: movie.trailerUrl, name: movie.name })}
                  className="absolute bottom-3 right-3 p-2.5 rounded-full bg-[#d62839] text-white hover:scale-110 transition-transform shadow-lg shadow-black/50"
                  title="Watch Trailer"
                >
                  <Play className="w-4 h-4 fill-white text-white" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {movie.genres.slice(0, 2).map((g) => (
                      <span key={g} className="text-[10px] font-semibold text-[#d62839] uppercase tracking-wider">
                        {g}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-500">· {movie.runtime}m</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#d62839] transition-colors line-clamp-1">
                    {movie.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {movie.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#1f2538] flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(movie.releaseDate).getFullYear()}
                  </span>
                  <button
                    onClick={() => navigate(`/movies/${movie.id}`)}
                    className="px-4 py-1.5 rounded-full bg-[#d62839] hover:bg-[#b52230] text-white text-xs font-semibold transition-colors"
                  >
                    Book Tickets
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Value Props & Experience */}
      <section className="py-16 bg-[#161b2b] border-y border-[#252f44]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#111827] border border-[#2a3449]">
              <div className="w-12 h-12 rounded-xl bg-[#d62839]/15 border border-[#d62839]/30 flex items-center justify-center text-[#d62839] mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Real-Time Seat Locks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you click a seat, it locks instantly for 5 minutes so no other moviegoer can take it while you complete payment.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111827] border border-[#2a3449]">
              <div className="w-12 h-12 rounded-xl bg-[#d62839]/15 border border-[#d62839]/30 flex items-center justify-center text-[#d62839] mb-4">
                <Film className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Dolby Atmos & IMAX</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Experience sound and picture perfection across Balcony, Middle, and Lower seating tiers customized to your view.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111827] border border-[#2a3449]">
              <div className="w-12 h-12 rounded-xl bg-[#d62839]/15 border border-[#d62839]/30 flex items-center justify-center text-[#d62839] mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Hassle-Free Cancellation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Plans changed? Cancel any upcoming booking directly from Your Bookings page with instantaneous seat release and refund receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
      {activeTrailer && (
        <TrailerModal
          isOpen={!!activeTrailer}
          onClose={() => setActiveTrailer(null)}
          trailerUrl={activeTrailer.url}
          movieName={activeTrailer.name}
        />
      )}
    </div>
  );
};
