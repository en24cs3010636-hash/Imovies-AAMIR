import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Film,
  Upload,
  Trash2,
  Calendar,
  Clock,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';
import { RootState } from '../store/store';
import { db } from '../services/mockDb';
import { refreshMovies } from '../store/moviesSlice';
import { useToast } from '../components/Toast';

export const AdminAddMovie: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { success, error } = useToast();
  const { movies } = useSelector((state: RootState) => state.movies);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState('');
  const [language, setLanguage] = useState('English');
  const [releaseDate, setReleaseDate] = useState('');
  const [runtime, setRuntime] = useState<number | ''>('');
  const [certification, setCertification] = useState('PG-13');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [poster, setPoster] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle image upload / preview (file reader to base64 or URL)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        error('Poster image must be smaller than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPoster(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || !genres.trim() || !releaseDate || !runtime) {
      error('Please fill in all required fields.');
      return;
    }

    const genreList = genres.split(',').map(g => g.trim()).filter(Boolean);
    const defaultPoster = poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';

    setLoading(true);
    try {
      db.addMovie({
        name: name.trim(),
        description: description.trim(),
        genres: genreList,
        language: language.trim() || 'English',
        releaseDate,
        runtime: Number(runtime),
        certification: certification || 'PG-13',
        trailerUrl: trailerUrl.trim() || 'https://www.youtube.com/watch?v=Way9Dexny3w',
        poster: defaultPoster
      });

      dispatch(refreshMovies());
      success(`Movie "${name}" added successfully!`);

      // Reset form
      setName('');
      setDescription('');
      setGenres('');
      setReleaseDate('');
      setRuntime('');
      setTrailerUrl('');
      setPoster('');
    } catch (err: any) {
      error(err.message || 'Failed to add movie');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovie = (id: string, movieName: string) => {
    if (window.confirm(`Are you sure you want to delete "${movieName}"? This will also remove scheduled shows.`)) {
      db.deleteMovie(id);
      dispatch(refreshMovies());
      success(`Movie "${movieName}" deleted.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#1f2538] text-slate-100 py-8 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="text-xs font-bold text-[#d62839] uppercase tracking-wider">
            Admin Movie Management
          </span>
        </div>

        {/* Form Card */}
        <div className="bg-[#111827] border border-[#2a3449] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Film className="w-6 h-6 text-[#d62839]" />
            <span>Add New</span> <span className="text-[#d62839]">Movie</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Poster Upload & Preview Column */}
              <div className="md:col-span-1 flex flex-col items-center">
                <label className="block text-xs font-semibold text-slate-300 mb-2 w-full text-left">
                  Poster Image (File or URL)
                </label>
                <div className="w-full aspect-[2/3] max-w-[240px] rounded-2xl border-2 border-dashed border-[#2a3449] hover:border-[#d62839] transition-colors bg-[#1f2538] flex flex-col items-center justify-center p-4 relative overflow-hidden group">
                  {poster ? (
                    <>
                      <img
                        src={poster}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setPoster('')}
                        className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-semibold"
                      >
                        Change Image
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                      <p className="text-xs text-slate-300 font-medium">Upload Poster</p>
                      <p className="text-[10px] text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                <div className="w-full mt-3">
                  <input
                    type="url"
                    placeholder="Or enter poster image URL"
                    value={poster.startsWith('data:') ? '' : poster}
                    onChange={(e) => setPoster(e.target.value)}
                    className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d62839]"
                  />
                </div>
              </div>

              {/* Form Details Column */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Movie Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dune: Part Two"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d62839]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Brief synopsis of the film..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d62839]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Genres (Comma separated) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Action, Sci-Fi, Adventure"
                      value={genres}
                      onChange={(e) => setGenres(e.target.value)}
                      className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d62839]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Language *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. English, Spanish"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d62839]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Release Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d62839]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Runtime (Minutes) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="e.g. 150"
                      value={runtime}
                      onChange={(e) => setRuntime(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d62839]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Certification *
                    </label>
                    <select
                      value={certification}
                      onChange={(e) => setCertification(e.target.value)}
                      className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d62839]"
                    >
                      <option value="G">G - General Audiences</option>
                      <option value="PG">PG - Parental Guidance</option>
                      <option value="PG-13">PG-13 - Parents Strongly Cautioned</option>
                      <option value="R">R - Restricted</option>
                      <option value="NC-17">NC-17 - Adults Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Trailer URL (YouTube) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={trailerUrl}
                    onChange={(e) => setTrailerUrl(e.target.value)}
                    className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d62839]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 rounded-full bg-[#d62839] hover:bg-[#b52230] text-white text-sm font-semibold transition-all shadow-lg shadow-red-900/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? 'Adding Movie...' : 'Submit Movie'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* SECTION: Available Movies with Red Banner */}
        <section>
          {/* Red Banner Header */}
          <div className="bg-[#d62839] text-white px-6 py-3.5 rounded-t-2xl flex items-center justify-between shadow-lg">
            <h3 className="text-base font-bold tracking-wide">Available Movies ({movies.length})</h3>
            <span className="text-xs bg-black/30 px-3 py-1 rounded-full font-medium">
              Click red button on poster to delete
            </span>
          </div>

          <div className="bg-[#111827] border-x border-b border-[#2a3449] rounded-b-2xl p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movies.map((m) => (
                <div
                  key={m.id}
                  className="group relative bg-[#1f2538] rounded-xl overflow-hidden border border-[#2a3449] flex flex-col shadow-md"
                >
                  <div className="relative aspect-[2/3] w-full bg-slate-900">
                    <img
                      src={m.poster}
                      alt={m.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />

                    {/* Small Round Red Delete Button on Poster */}
                    <button
                      onClick={() => handleDeleteMovie(m.id, m.name)}
                      title="Delete Movie"
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#d62839] hover:bg-rose-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white truncate" title={m.name}>
                        {m.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(m.releaseDate).getFullYear()} · {m.certification}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
