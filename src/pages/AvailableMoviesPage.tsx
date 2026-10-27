import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Film,
  Search,
  Filter,
  Heart,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { RootState } from '../store/store';
import {
  setSelectedGenre,
  setSelectedLanguage,
  setSortBy,
  setCurrentPage,
  toggleFavorite
} from '../store/moviesSlice';
import { Movie } from '../types';

export const AvailableMoviesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const {
    movies,
    searchQuery,
    selectedGenre,
    selectedLanguage,
    sortBy,
    currentPage,
    itemsPerPage,
    favorites
  } = useSelector((state: RootState) => state.movies);

  const isFavoritesOnly = searchParams.get('filter') === 'favorites';

  // Extract all available genres
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach(m => m.genres.forEach(g => set.add(g)));
    return ['All', ...Array.from(set)];
  }, [movies]);

  // Extract all available languages
  const allLanguages = useMemo(() => {
    const set = new Set<string>();
    movies.forEach(m => set.add(m.language));
    return ['All', ...Array.from(set)];
  }, [movies]);

  // Filter & Sort
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    if (isFavoritesOnly) {
      result = result.filter(m => favorites.includes(m.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.language.toLowerCase().includes(q) ||
        m.genres.some(g => g.toLowerCase().includes(q))
      );
    }

    if (selectedGenre !== 'All') {
      result = result.filter(m => m.genres.includes(selectedGenre));
    }

    if (selectedLanguage !== 'All') {
      result = result.filter(m => m.language === selectedLanguage);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'releaseDate') {
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'runtime') {
        return b.runtime - a.runtime;
      }
      return 0;
    });

    return result;
  }, [movies, isFavoritesOnly, favorites, searchQuery, selectedGenre, selectedLanguage, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage) || 1;
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMovies.slice(start, start + itemsPerPage);
  }, [filteredMovies, currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen bg-[#1f2538] text-slate-100 py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Title & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#252f44]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Film className="w-7 h-7 text-[#d62839]" />
              <span>Available</span> <span className="text-[#d62839]">Movies</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isFavoritesOnly
                ? `Showing ${filteredMovies.length} saved favorite movies`
                : `Explore now playing cinema releases with real-time seat booking (${filteredMovies.length} titles)`}
            </p>
          </div>

          {/* Quick Filters / Sorting Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#111827] border border-[#2a3449] rounded-xl px-3 py-1.5 text-xs">
              <span className="text-slate-400 font-medium">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => dispatch(setSelectedLanguage(e.target.value))}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                {allLanguages.map((l) => (
                  <option key={l} value={l} className="bg-[#111827]">
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#111827] border border-[#2a3449] rounded-xl px-3 py-1.5 text-xs">
              <span className="text-slate-400 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => dispatch(setSortBy(e.target.value as any))}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                <option value="releaseDate" className="bg-[#111827]">Newest First</option>
                <option value="name" className="bg-[#111827]">Movie Title (A-Z)</option>
                <option value="runtime" className="bg-[#111827]">Longest Runtime</option>
              </select>
            </div>
          </div>
        </div>

        {/* Genre Pill Selection Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {allGenres.map((genre) => {
            const isActive = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => dispatch(setSelectedGenre(genre))}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#d62839] text-white shadow-md shadow-red-900/40'
                    : 'bg-[#111827] text-slate-300 hover:text-white border border-[#2a3449] hover:border-slate-600'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Movies Grid matching exact screenshot requirements */}
        {paginatedMovies.length === 0 ? (
          <div className="bg-[#111827] border border-[#2a3449] rounded-2xl p-12 text-center text-slate-400 max-w-md mx-auto my-12">
            <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No movies found</h3>
            <p className="text-xs text-slate-400">
              Try adjusting your search query, genre filters, or language selector.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedMovies.map((movie) => {
              const isFav = favorites.includes(movie.id);

              return (
                <div
                  key={movie.id}
                  className="group bg-[#111827] rounded-2xl overflow-hidden border border-[#2a3449] hover:border-[#d62839] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-950/40 flex flex-col cursor-pointer"
                  onClick={() => navigate(`/movies/${movie.id}`)}
                >
                  {/* Poster Image */}
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

                    {/* Favorite Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(toggleFavorite(movie.id));
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white transition-transform hover:scale-110"
                      title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFav ? 'fill-[#d62839] text-[#d62839]' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Movie Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Red Genre Tags (per prompt requirements) */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {movie.genres.map((g) => (
                          <span
                            key={g}
                            className="text-[11px] font-semibold text-[#d62839] uppercase tracking-wide"
                          >
                            {g}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-[#d62839] transition-colors line-clamp-1">
                        {movie.name}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {movie.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#1f2538] flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{movie.releaseDate}</span>
                      </div>

                      <span className="px-3.5 py-1.5 rounded-full bg-[#d62839] hover:bg-[#b52230] text-white text-xs font-semibold transition-colors shadow-md shadow-red-900/30">
                        Book Now
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8">
            <button
              onClick={() => dispatch(setCurrentPage(Math.max(currentPage - 1, 1)))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-[#111827] border border-[#2a3449] text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  onClick={() => dispatch(setCurrentPage(page))}
                  className={`w-9 h-9 rounded-xl text-xs font-semibold font-mono transition-colors ${
                    currentPage === page
                      ? 'bg-[#d62839] text-white shadow-md shadow-red-900/30'
                      : 'bg-[#111827] border border-[#2a3449] text-slate-300 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => dispatch(setCurrentPage(Math.min(currentPage + 1, totalPages)))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-[#111827] border border-[#2a3449] text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
