import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Ticket,
  Calendar,
  Clock,
  Building2,
  Trash2,
  AlertCircle,
  Film,
  ArrowRight,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { RootState } from '../store/store';
import { db } from '../services/mockDb';
import { useToast } from '../components/Toast';
import { Booking } from '../types';

export const YourBookingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { success, error, info } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const loadUserBookings = () => {
    if (user?.id) {
      setBookings(db.getUserBookings(user.id));
    }
  };

  useEffect(() => {
    loadUserBookings();

    const handleRealtime = () => {
      loadUserBookings();
    };
    window.addEventListener('imovies:realtime', handleRealtime);
    return () => window.removeEventListener('imovies:realtime', handleRealtime);
  }, [user]);

  // Split into Upcoming and Past based on showDate / showTime and status
  const { upcomingBookings, pastBookings } = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const upcoming: Booking[] = [];
    const past: Booking[] = [];

    bookings.forEach((b) => {
      const showDate = b.show?.showDate || '';
      if (b.status === 'cancelled' || (showDate && showDate < today)) {
        past.push(b);
      } else {
        upcoming.push(b);
      }
    });

    return { upcomingBookings: upcoming, pastBookings: past };
  }, [bookings]);

  const handleCancelBooking = (booking: Booking) => {
    if (
      window.confirm(
        `Are you sure you want to cancel booking for "${booking.show?.movie?.name}"? Your seats (${booking.seats.join(
          ', '
        )}) will be released immediately.`
      )
    ) {
      try {
        db.cancelBooking(booking.id, user!.id);
        loadUserBookings();
        success('Booking cancelled. Seats have been made available.');
      } catch (err: any) {
        error(err.message || 'Failed to cancel booking');
      }
    }
  };

  const currentList = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="min-h-screen bg-[#1f2538] text-slate-100 py-8 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#252f44]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Ticket className="w-7 h-7 text-[#d62839]" />
              <span>Your</span> <span className="text-[#d62839]">Bookings</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Track active movie tickets, cancellation receipts, and cinema history
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center p-1 bg-[#111827] border border-[#2a3449] rounded-xl">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-[#d62839] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Upcoming ({upcomingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'past'
                  ? 'bg-[#d62839] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Past / Cancelled ({pastBookings.length})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {currentList.length === 0 ? (
          <div className="bg-[#111827] border border-[#2a3449] rounded-2xl p-12 text-center text-slate-400 max-w-md mx-auto my-12 shadow-xl">
            <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">
              No {activeTab} bookings
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {activeTab === 'upcoming'
                ? "You don't have any upcoming movies scheduled."
                : 'No past booking records found.'}
            </p>
            <Link
              to="/movies"
              className="px-6 py-2.5 rounded-full bg-[#d62839] text-white text-xs font-semibold hover:bg-[#b52230] transition-colors"
            >
              Book Movies Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map((booking) => {
              const movie = booking.show?.movie;
              const theatre = booking.show?.theatre;
              const isUpcoming = booking.status === 'confirmed' && activeTab === 'upcoming';

              return (
                <div
                  key={booking.id}
                  className={`bg-[#111827] border rounded-2xl overflow-hidden shadow-xl transition-all p-5 flex flex-col md:flex-row gap-5 items-stretch ${
                    booking.status === 'cancelled'
                      ? 'border-rose-950/40 opacity-70'
                      : 'border-[#2a3449] hover:border-slate-700'
                  }`}
                >
                  {/* Poster */}
                  <div className="w-full md:w-32 aspect-[2/3] md:aspect-auto rounded-xl overflow-hidden bg-slate-900 shrink-0">
                    <img
                      src={movie?.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80'}
                      alt={movie?.name || 'Movie'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          BOOKING ID: #{booking.id.slice(-6).toUpperCase()}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            booking.status === 'confirmed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1">
                        {movie?.name || 'Featured Movie'}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-slate-300 font-medium">{theatre?.name || 'Cinema Hall'}</span>
                        <span>·</span>
                        <span className="text-slate-500">{theatre?.location}</span>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#1f2538] p-3 rounded-xl border border-[#2a3449] text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Show Date</span>
                        <span className="font-mono text-white font-medium">{booking.show?.showDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Showtime</span>
                        <span className="font-mono text-amber-400 font-bold">{booking.show?.showTime}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                          Seats ({booking.seats.length})
                        </span>
                        <span className="font-mono font-bold text-[#d62839]">
                          {booking.seats.join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">Seating Tier</span>
                        <span className="capitalize text-slate-300 font-medium">{booking.seatType}</span>
                      </div>
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-slate-500">Total Paid:</span>
                        <span className="text-xl font-bold font-mono text-emerald-400">
                          ${booking.totalPrice.toFixed(2)}
                        </span>
                      </div>

                      {isUpcoming && (
                        <button
                          onClick={() => handleCancelBooking(booking)}
                          className="px-4 py-1.5 rounded-full border border-[#d62839] text-[#d62839] hover:bg-[#d62839] hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Cancel Booking</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
