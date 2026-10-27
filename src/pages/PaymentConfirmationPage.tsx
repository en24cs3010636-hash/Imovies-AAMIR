import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ticket,
  Calendar,
  Building2,
  Film,
  ArrowLeft,
  ShieldCheck,
  Printer,
  ChevronRight
} from 'lucide-react';
import { RootState } from '../store/store';
import { clearBookingSelection } from '../store/bookingSlice';
import { db } from '../services/mockDb';
import { useToast } from '../components/Toast';
import { Booking, Payment } from '../types';

export const PaymentConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { success, error, info } = useToast();

  const { user } = useSelector((state: RootState) => state.auth);
  const { currentShow, selectedSeats, totalPrice, lockExpiresAt, seatType } = useSelector(
    (state: RootState) => state.booking
  );

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardName, setCardName] = useState(user?.username || 'John Doe');
  const [simulateFailure, setSimulateFailure] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [confirmedPayment, setConfirmedPayment] = useState<Payment | null>(null);

  // 5-minute countdown calculation
  const [timeLeftMs, setTimeLeftMs] = useState<number>(() => {
    return lockExpiresAt ? Math.max(0, lockExpiresAt - Date.now()) : 300000;
  });

  useEffect(() => {
    if (confirmedBooking) return;

    const timer = setInterval(() => {
      if (lockExpiresAt) {
        const remaining = Math.max(0, lockExpiresAt - Date.now());
        setTimeLeftMs(remaining);

        if (remaining <= 0) {
          clearInterval(timer);
          // Auto release
          if (currentShow && selectedSeats.length > 0 && user) {
            db.unlockSeats(currentShow.id, selectedSeats.map(s => s.seatNumber), user.id);
          }
          dispatch(clearBookingSelection());
          error('Your 5-minute seat reservation has expired. Please select your seats again.');
          navigate(currentShow ? `/movies/${currentShow.movieId}` : '/movies');
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockExpiresAt, confirmedBooking, currentShow, selectedSeats, user, dispatch, navigate, error]);

  // Format mm:ss
  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // If page accessed directly with no selected show
  if (!currentShow || selectedSeats.length === 0) {
    if (!confirmedBooking) {
      return (
        <div className="min-h-screen bg-[#1f2538] text-white flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <Ticket className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">No Active Booking</h2>
            <p className="text-xs text-slate-400 mb-6">
              You haven't selected any seats yet. Please browse movies and pick a showtime.
            </p>
            <Link to="/movies" className="px-6 py-2.5 rounded-full bg-[#d62839] text-white text-xs font-semibold">
              Browse Movies
            </Link>
          </div>
        </div>
      );
    }
  }

  const handlePayAndConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (simulateFailure) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        error('Payment Gateway Declined: Card authorization failed. Check details or uncheck test failure toggle.');
      }, 1200);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      try {
        const result = db.createBooking({
          userId: user!.id,
          userEmail: user!.email,
          showId: currentShow!.id,
          seats: selectedSeats.map(s => s.seatNumber),
          seatType: seatType,
          totalPrice,
          paymentMethod: paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'upi' ? 'UPI / QR' : 'Digital Wallet'
        });

        setConfirmedBooking(result.booking);
        setConfirmedPayment(result.payment);
        dispatch(clearBookingSelection());
        success('Payment successful! Your cinema ticket is confirmed.');
      } catch (err: any) {
        error(err.message || 'Booking transaction failed.');
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  // SUCCESS CONFIRMATION VIEW
  if (confirmedBooking && confirmedPayment) {
    const movie = currentShow?.movie || db.getMovieById(currentShow?.movieId || '');
    const theatre = currentShow?.theatre;

    return (
      <div className="min-h-screen bg-[#1f2538] text-slate-100 py-12 px-4 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Confirmed Banner */}
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6 text-center shadow-2xl">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-3 animate-bounce" />
            <h2 className="text-2xl font-extrabold text-white">Booking Confirmed!</h2>
            <p className="text-xs text-slate-300 mt-1">
              Your ticket has been booked and an instant confirmation notification was issued.
            </p>
          </div>

          {/* Ticket Card */}
          <div className="bg-[#111827] border-2 border-[#d62839] rounded-3xl overflow-hidden shadow-2xl">
            {/* Ticket Header */}
            <div className="bg-[#d62839] text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-red-100">Official E-Ticket</span>
                <h3 className="text-xl font-black">{movie?.name || 'Blockbuster Movie'}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider block text-red-200">Ref Code</span>
                <span className="font-mono font-bold text-sm bg-black/30 px-3 py-1 rounded-lg">
                  #{confirmedBooking.id.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-semibold block">Theatre</span>
                  <span className="text-white font-medium text-sm">{theatre?.name || 'Grand Cinema'}</span>
                  <span className="text-slate-400 block text-[11px]">{theatre?.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-semibold block">Date & Showtime</span>
                  <span className="text-amber-400 font-mono font-bold text-sm">
                    {currentShow?.showDate} · {currentShow?.showTime}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#1f2538]">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-semibold block">Seats ({confirmedBooking.seats.length})</span>
                  <span className="text-white font-mono font-bold text-base text-[#d62839]">
                    {confirmedBooking.seats.join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-semibold block">Total Paid</span>
                  <span className="text-emerald-400 font-mono font-bold text-base">
                    ${confirmedBooking.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1f2538] flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Transaction ID: {confirmedPayment.transactionId}</span>
                <span className="text-emerald-400 font-bold uppercase">{confirmedPayment.status}</span>
              </div>
            </div>

            {/* Ticket Cutout Line */}
            <div className="relative border-t-2 border-dashed border-[#252f44] py-4 px-6 bg-[#161b2b] flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Show this QR / Reference barcode at the cinema turnstile.</span>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-[#1f2538] hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/bookings"
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#d62839] hover:bg-[#b52230] text-white font-semibold text-xs transition-all shadow-lg shadow-red-900/40 text-center"
            >
              View in Your Bookings
            </Link>
            <Link
              to="/movies"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#111827] border border-[#2a3449] hover:bg-[#1a2234] text-slate-300 font-semibold text-xs transition-all text-center"
            >
              Book Another Movie
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // CHECKOUT PAYMENT FORM
  const movie = currentShow?.movie;
  const theatre = currentShow?.theatre;

  return (
    <div className="min-h-screen bg-[#1f2538] text-slate-100 py-8 px-4 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          to={currentShow ? `/movies/${currentShow.movieId}` : '/movies'}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Change Seats
        </Link>

        {/* 5-minute Seat Lock Expiration Alert */}
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            <div>
              <span className="font-bold">Seats Locked Temporarily:</span> Complete your checkout before time expires.
            </div>
          </div>
          <div className="font-mono font-bold text-base text-amber-400 bg-black/40 px-3 py-1 rounded-lg">
            {formatTime(timeLeftMs)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left: Payment Form */}
          <div className="md:col-span-7 bg-[#111827] border border-[#2a3449] rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#d62839]" />
              <span>Payment Details</span>
            </h2>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-[#d62839] border-[#d62839] text-white shadow-md'
                    : 'bg-[#1f2538] border-[#2a3449] text-slate-300 hover:text-white'
                }`}
              >
                Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-[#d62839] border-[#d62839] text-white shadow-md'
                    : 'bg-[#1f2538] border-[#2a3449] text-slate-300 hover:text-white'
                }`}
              >
                UPI / QR
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  paymentMethod === 'wallet'
                    ? 'bg-[#d62839] border-[#d62839] text-white shadow-md'
                    : 'bg-[#1f2538] border-[#2a3449] text-slate-300 hover:text-white'
                }`}
              >
                Apple / GPay
              </button>
            </div>

            <form onSubmit={handlePayAndConfirm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Name on Card</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d62839]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#d62839]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#d62839]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">CVC / CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-[#1f2538] border border-[#2a3449] rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#d62839]"
                  />
                </div>
              </div>

              {/* Gateway Simulation Failure Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-[#d62839] accent-[#d62839]"
                  />
                  <span>Simulate Payment Failure (Test Gateway Error Handling)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-4 py-3 rounded-full bg-[#d62839] hover:bg-[#b52230] text-white font-bold text-sm transition-all shadow-xl shadow-red-900/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isProcessing ? 'Processing Transaction...' : `Pay $${totalPrice.toFixed(2)} & Confirm Tickets`}
              </button>
            </form>
          </div>

          {/* Right: Booking Summary Column */}
          <div className="md:col-span-5 bg-[#111827] border border-[#2a3449] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-4 pb-2 border-b border-[#252f44]">
                Booking Summary
              </h3>

              <div className="flex gap-3 mb-4">
                <img
                  src={movie?.poster}
                  alt={movie?.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-24 object-cover rounded-xl border border-[#2a3449]"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{movie?.name}</h4>
                  <span className="text-[11px] text-[#d62839] font-semibold block mt-0.5">
                    {movie?.certification} · {movie?.runtime}m
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">{theatre?.name}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 py-3 border-y border-[#1f2538]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-mono text-white">{currentShow?.showDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Showtime:</span>
                  <span className="font-mono text-amber-400 font-bold">{currentShow?.showTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Seats:</span>
                  <span className="font-mono text-[#d62839] font-bold">
                    {selectedSeats.map(s => s.seatNumber).join(', ')} ({selectedSeats.length})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Seating Tier:</span>
                  <span className="capitalize text-white">{seatType}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#252f44]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Due</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Includes all cinema taxes and 0% booking fees</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
