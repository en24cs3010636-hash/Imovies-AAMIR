export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface Movie {
  id: string;
  name: string;
  description: string;
  genres: string[];
  language: string;
  releaseDate: string;
  runtime: number; // in minutes
  certification: string; // e.g., PG-13, R, U/A
  trailerUrl: string; // YouTube embed or watch link
  poster: string; // image URL or base64
  createdAt?: string;
}

export interface Theatre {
  id: string;
  name: string;
  location: string;
  balconySeatPrice: number;
  balconySeatCount: number;
  middleSeatPrice: number;
  middleSeatCount: number;
  lowerSeatPrice: number;
  lowerSeatCount: number;
}

export interface Show {
  id: string;
  movieId: string;
  theatreId: string;
  showDate: string; // YYYY-MM-DD
  showTime: string; // HH:mm format, e.g. 18:30
  movie?: Movie;
  theatre?: Theatre;
}

export type SeatTier = 'balcony' | 'middle' | 'lower';
export type SeatStatus = 'available' | 'locked' | 'booked';

export interface Seat {
  id: string;
  showId: string;
  seatNumber: string; // e.g., B-1, M-5, L-12
  type: SeatTier;
  price: number;
  status: SeatStatus;
  lockedBy?: string; // user id who holds the lock
  lockExpiresAt?: number; // timestamp ms
}

export interface Booking {
  id: string;
  userId: string;
  userEmail: string;
  showId: string;
  show?: Show;
  seats: string[];
  seatType: SeatTier | string;
  totalPrice: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  method: string;
  status: 'success' | 'failed';
  transactionId: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
