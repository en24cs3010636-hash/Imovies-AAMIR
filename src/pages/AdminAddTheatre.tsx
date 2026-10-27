import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Building2, ArrowLeft, Trash2, MapPin } from 'lucide-react';
import { RootState } from '../store/store';
import { db } from '../services/mockDb';
import { refreshTheatres } from '../store/theatresSlice';
import { useToast } from '../components/Toast';

export const AdminAddTheatre: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { success, error } = useToast();
  const { theatres } = useSelector((state: RootState) => state.theatres);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [balconySeatPrice, setBalconySeatPrice] = useState<number | ''>(22);
  const [balconySeatCount, setBalconySeatCount] = useState<number | ''>(16);
  const [middleSeatPrice, setMiddleSeatPrice] = useState<number | ''>(16);
  const [middleSeatCount, setMiddleSeatCount] = useState<number | ''>(24);
  const [lowerSeatPrice, setLowerSeatPrice] = useState<number | ''>(10);
  const [lowerSeatCount, setLowerSeatCount] = useState<number | ''>(20);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !location.trim()) {
      error('Please enter Theatre Name and Location');
      return;
    }

    setLoading(true);
    try {
      db.addTheatre({
        name: name.trim(),
        location: location.trim(),
        balconySeatPrice: Number(balconySeatPrice) || 20,
        balconySeatCount: Number(balconySeatCount) || 16,
        middleSeatPrice: Number(middleSeatPrice) || 15,
        middleSeatCount: Number(middleSeatCount) || 24,
        lowerSeatPrice: Number(lowerSeatPrice) || 10,
        lowerSeatCount: Number(lowerSeatCount) || 20
      });

      dispatch(refreshTheatres());
      success(`Theatre "${name}" added successfully!`);

      // Reset
      setName('');
      setLocation('');
    } catch (err: any) {
      error(err.message || 'Failed to add theatre');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTheatre = (id: string, theatreName: string) => {
    if (window.confirm(`Are you sure you want to delete "${theatreName}"?`)) {
      db.deleteTheatre(id);
      dispatch(refreshTheatres());
      success(`Theatre "${theatreName}" deleted.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#1f2538] text-slate-100 py-8 px-4 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="text-xs font-bold text-[#d62839] uppercase tracking-wider">
            Cinema Multiplex Manager
          </span>
        </div>

        {/* Card Form */}
        <div className="bg-[#111827] border border-[#2a3449] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#252f44]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Add Cinema <span className="text-[#d62839]">Theatre</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure hall tiers, seat counts, and baseline ticket rates
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Theatre Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iMovies StarDome 4K"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d62839]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Theatre Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. City Mall, 4th Floor"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#d62839]"
                  />
                </div>
              </div>
            </div>

            {/* Seating Tiers Section */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Seat Tiers Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Balcony */}
                <div className="bg-[#1f2538] border border-rose-900/40 rounded-xl p-4">
                  <span className="text-xs font-bold text-rose-400 block mb-2">Balcony (Premium)</span>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Seat Price ($)</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={balconySeatPrice}
                        onChange={(e) => setBalconySeatPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-[#111827] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Seat Count</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={balconySeatCount}
                        onChange={(e) => setBalconySeatCount(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-[#111827] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Middle */}
                <div className="bg-[#1f2538] border border-blue-900/40 rounded-xl p-4">
                  <span className="text-xs font-bold text-blue-400 block mb-2">Middle (Standard)</span>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Seat Price ($)</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={middleSeatPrice}
                        onChange={(e) => setMiddleSeatPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-[#111827] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Seat Count</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={middleSeatCount}
                        onChange={(e) => setMiddleSeatCount(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-[#111827] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Lower */}
                <div className="bg-[#1f2538] border border-emerald-900/40 rounded-xl p-4">
                  <span className="text-xs font-bold text-emerald-400 block mb-2">Lower (Front)</span>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Seat Price ($)</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={lowerSeatPrice}
                        onChange={(e) => setLowerSeatPrice(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-[#111827] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase">Seat Count</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={lowerSeatCount}
                        onChange={(e) => setLowerSeatCount(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-[#111827] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 rounded-full bg-[#d62839] hover:bg-[#b52230] text-white text-xs font-semibold transition-all shadow-lg shadow-red-900/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? 'Adding Theatre...' : 'Submit Theatre'}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Theatres List */}
        <div className="bg-[#111827] border border-[#2a3449] rounded-2xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
            <span>Existing Theatres ({theatres.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theatres.map((t) => (
              <div
                key={t.id}
                className="bg-[#1f2538] border border-[#2a3449] rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-white">{t.name}</h4>
                    {theatres.length > 1 && (
                      <button
                        onClick={() => handleDeleteTheatre(t.id, t.name)}
                        className="p-1 rounded text-slate-500 hover:text-[#d62839] transition-colors"
                        title="Delete Theatre"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {t.location}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-[#111827] p-2 rounded-lg border border-[#2a3449]">
                    <div>
                      <span className="text-rose-400 font-bold block">Balcony</span>
                      <span className="text-slate-300 font-mono">${t.balconySeatPrice}</span>
                      <span className="text-slate-500 block">({t.balconySeatCount} seats)</span>
                    </div>
                    <div>
                      <span className="text-blue-400 font-bold block">Middle</span>
                      <span className="text-slate-300 font-mono">${t.middleSeatPrice}</span>
                      <span className="text-slate-500 block">({t.middleSeatCount} seats)</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 font-bold block">Lower</span>
                      <span className="text-slate-300 font-mono">${t.lowerSeatPrice}</span>
                      <span className="text-slate-500 block">({t.lowerSeatCount} seats)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
