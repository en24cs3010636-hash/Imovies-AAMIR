import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ShieldCheck, Lock, AlertTriangle, Armchair } from 'lucide-react';
import { RootState } from '../store/store';
import { toggleSeatSelection } from '../store/bookingSlice';
import { db } from '../services/mockDb';
import { Show, Seat, SeatTier } from '../types';
import { useToast } from './Toast';

interface SeatMapProps {
  show: Show;
  onProceed: () => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({ show, onProceed }) => {
  const dispatch = useDispatch();
  const { error, info } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedSeats, totalPrice } = useSelector((state: RootState) => state.booking);

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch seats initially
  const loadSeats = () => {
    const list = db.getSeatsForShow(show.id);
    setSeats(list);
    setLoading(false);
  };

  useEffect(() => {
    loadSeats();

    // Listen to real-time seat changes (cross-tab / socket event)
    const handleRealtime = (e: any) => {
      const data = e.detail;
      if (data?.action === 'seats:updated' && data?.payload?.showId === show.id) {
        setSeats(data.payload.seats);
      }
    };

    window.addEventListener('imovies:realtime', handleRealtime);
    const interval = setInterval(loadSeats, 10000); // polling fallback for lock expiry

    return () => {
      window.removeEventListener('imovies:realtime', handleRealtime);
      clearInterval(interval);
    };
  }, [show.id]);

  // Group seats by tier
  const balconySeats = useMemo(() => seats.filter(s => s.type === 'balcony'), [seats]);
  const middleSeats = useMemo(() => seats.filter(s => s.type === 'middle'), [seats]);
  const lowerSeats = useMemo(() => seats.filter(s => s.type === 'lower'), [seats]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'booked') {
      error(`Seat ${seat.seatNumber} is already booked.`);
      return;
    }

    const isLockedByOther =
      seat.status === 'locked' &&
      seat.lockedBy !== user?.id &&
      seat.lockExpiresAt &&
      seat.lockExpiresAt > Date.now();

    if (isLockedByOther) {
      error(`Seat ${seat.seatNumber} is temporarily held by another guest.`);
      return;
    }

    const isAlreadySelected = selectedSeats.some(s => s.id === seat.id);

    if (!isAlreadySelected && selectedSeats.length >= 8) {
      error('Maximum 8 seats can be selected per booking.');
      return;
    }

    dispatch(toggleSeatSelection(seat));
  };

  // Group into rows helper
  const renderSeatRows = (tierSeats: Seat[], tierName: string, tierPrice: number, tierColor: string) => {
    // group by row letter (e.g. A, B)
    const rows: Record<string, Seat[]> = {};
    tierSeats.forEach(s => {
      const rowLetter = s.seatNumber.charAt(0);
      if (!rows[rowLetter]) rows[rowLetter] = [];
      rows[rowLetter].push(s);
    });

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#252f44]">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${tierColor}`}></span>
            <span className="text-sm font-semibold tracking-wide text-white capitalize">{tierName} Tier</span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            ${tierPrice.toFixed(2)} <span className="text-[10px] text-slate-500 font-normal">/ seat</span>
          </span>
        </div>

        <div className="space-y-2.5">
          {Object.entries(rows).map(([rowLetter, rowSeats]) => (
            <div key={rowLetter} className="flex items-center justify-center gap-1.5 sm:gap-2">
              <span className="w-5 text-center text-xs font-mono text-slate-500 font-bold">{rowLetter}</span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {rowSeats.map((seat) => {
                  const isSelected = selectedSeats.some(s => s.id === seat.id);
                  const isBooked = seat.status === 'booked';
                  const isLockedByOther =
                    seat.status === 'locked' &&
                    seat.lockedBy !== user?.id &&
                    seat.lockExpiresAt &&
                    seat.lockExpiresAt > Date.now();

                  let buttonClass = 'bg-[#1a2234] border border-[#2e3b55] text-slate-300 hover:border-[#d62839] hover:text-white';

                  if (isBooked) {
                    buttonClass = 'bg-[#0b0f19] border-transparent text-slate-600 cursor-not-allowed line-through opacity-40';
                  } else if (isLockedByOther) {
                    buttonClass = 'bg-amber-950/40 border-amber-600/60 text-amber-400 cursor-not-allowed animate-pulse';
                  } else if (isSelected) {
                    buttonClass = 'bg-[#d62839] border-[#d62839] text-white shadow-lg shadow-red-900/50 scale-105 font-bold';
                  }

                  return (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      disabled={isBooked || !!isLockedByOther}
                      title={`Seat ${seat.seatNumber} - $${seat.price} (${seat.type})`}
                      className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-md flex items-center justify-center text-[11px] sm:text-xs font-medium transition-all ${buttonClass}`}
                    >
                      {isLockedByOther ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        seat.seatNumber
                      )}
                    </button>
                  );
                })}
              </div>
              <span className="w-5 text-center text-xs font-mono text-slate-500 font-bold">{rowLetter}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-[#d62839] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm">Loading real-time seat layout...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-[#2a3449] rounded-2xl p-4 sm:p-8 shadow-2xl">
      {/* Curved Screen */}
      <div className="mb-10 text-center">
        <div className="relative w-full max-w-lg mx-auto mb-2">
          <div className="h-2 w-full rounded-t-full bg-gradient-to-r from-transparent via-[#d62839]/80 to-transparent shadow-[0_4px_24px_rgba(214,40,57,0.4)]"></div>
          <div className="h-6 w-full bg-gradient-to-b from-[#d62839]/10 to-transparent"></div>
        </div>
        <span className="text-[11px] uppercase tracking-[0.25em] text-slate-400 font-semibold">
          Screen (All Eyes Here)
        </span>
      </div>

      {/* Seat Rows by Tier */}
      <div className="max-w-2xl mx-auto overflow-x-auto pb-4">
        {renderSeatRows(balconySeats, 'Balcony', show.theatre?.balconySeatPrice || 22, 'bg-rose-500')}
        {renderSeatRows(middleSeats, 'Middle', show.theatre?.middleSeatPrice || 16, 'bg-blue-500')}
        {renderSeatRows(lowerSeats, 'Lower', show.theatre?.lowerSeatPrice || 10, 'bg-emerald-500')}
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-[#252f44] flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#1a2234] border border-[#2e3b55]"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#d62839] text-white flex items-center justify-center text-[10px] font-bold">✓</div>
          <span className="text-white font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-950/40 border border-amber-500/60 flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 text-amber-400" />
          </div>
          <span>Locked (Other Guest)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#0b0f19] border border-transparent opacity-40 line-through"></div>
          <span>Booked</span>
        </div>
      </div>

      {/* Real-time sync badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Connected to Live Seat Engine (multi-tab sync active)</span>
      </div>

      {/* Booking Action Footer */}
      <div className="mt-8 pt-6 border-t border-[#252f44] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Selected Seats:</span>
            {selectedSeats.length > 0 ? (
              <span className="text-sm font-semibold text-white">
                {selectedSeats.map(s => s.seatNumber).join(', ')} ({selectedSeats.length})
              </span>
            ) : (
              <span className="text-xs text-slate-500 italic">None selected yet</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">Total Price:</span>
            <span className="text-xl font-bold font-mono text-[#d62839]">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          onClick={onProceed}
          disabled={selectedSeats.length === 0}
          className={`w-full sm:w-auto px-8 py-3 rounded-full font-semibold text-sm transition-all shadow-lg ${
            selectedSeats.length > 0
              ? 'bg-[#d62839] hover:bg-[#b52230] text-white shadow-red-900/40 hover:scale-[1.02] cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {selectedSeats.length > 0 ? `Book ${selectedSeats.length} Seat(s) Now` : 'Select Seats to Proceed'}
        </button>
      </div>
    </div>
  );
};
