import { User, Movie, Theatre, Show, Seat, Booking, Payment, NotificationItem, SeatTier } from '../types';

// BroadcastChannel for cross-tab real-time seat sync
const realtimeChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('imovies_realtime_seats') 
  : null;

// Initial Seeds
const SEED_USERS: User[] = [
  {
    id: 'u-admin-1',
    username: 'SuperAdmin',
    email: 'admin@imovies.com',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'u-user-1',
    username: 'JohnCinephile',
    email: 'user@imovies.com',
    role: 'user',
    createdAt: new Date().toISOString()
  }
];

const SEED_MOVIES: Movie[] = [
  {
    id: 'm-1',
    name: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe.',
    genres: ['Action', 'Sci-Fi', 'Adventure'],
    language: 'English',
    releaseDate: '2024-03-01',
    runtime: 166,
    certification: 'PG-13',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm-2',
    name: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    genres: ['Biography', 'Drama', 'History'],
    language: 'English',
    releaseDate: '2023-07-21',
    runtime: 180,
    certification: 'R',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm-3',
    name: 'Interstellar: Remastered',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    language: 'English',
    releaseDate: '2024-09-15',
    runtime: 169,
    certification: 'PG-13',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm-4',
    name: 'Gladiator II',
    description: 'Years after witnessing the death of the revered hero Maximus, Lucius must enter the Colosseum after his home is conquered by tyrannical Emperors.',
    genres: ['Action', 'Drama', 'Adventure'],
    language: 'English',
    releaseDate: '2024-11-22',
    runtime: 148,
    certification: 'R',
    trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm-5',
    name: 'Spider-Man: Beyond the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    genres: ['Animation', 'Action', 'Sci-Fi'],
    language: 'English',
    releaseDate: '2025-01-10',
    runtime: 140,
    certification: 'PG',
    trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm-6',
    name: 'Cyberpunk: Neon Horizon',
    description: 'In a dystopian metropolis ruled by high-tech corporations, a rogue netrunner and an underground mechanic uncover a reality-altering neural conspiracy.',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    language: 'English',
    releaseDate: '2024-12-05',
    runtime: 135,
    certification: 'R',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date().toISOString()
  }
];

const SEED_THEATRES: Theatre[] = [
  {
    id: 't-1',
    name: 'iMovies Grand Palace - 4K Dolby Atmos',
    location: 'Downtown Boulevard, Sector 4',
    balconySeatPrice: 22,
    balconySeatCount: 16,
    middleSeatPrice: 16,
    middleSeatCount: 24,
    lowerSeatPrice: 10,
    lowerSeatCount: 20
  },
  {
    id: 't-2',
    name: 'Starlight IMAX Cinema & Lounge',
    location: 'Westside Promenade Mall, Level 3',
    balconySeatPrice: 25,
    balconySeatCount: 20,
    middleSeatPrice: 18,
    middleSeatCount: 30,
    lowerSeatPrice: 12,
    lowerSeatCount: 20
  },
  {
    id: 't-3',
    name: 'Regal CineDome Premium',
    location: 'North Hill Galleria, City Center',
    balconySeatPrice: 20,
    balconySeatCount: 16,
    middleSeatPrice: 15,
    middleSeatCount: 24,
    lowerSeatPrice: 9,
    lowerSeatCount: 16
  }
];

// Helper to get formatted dates
const getDates = () => {
  const today = new Date();
  const format = (d: Date) => d.toISOString().split('T')[0];
  const d1 = new Date(today);
  const d2 = new Date(today);
  d2.setDate(today.getDate() + 1);
  const d3 = new Date(today);
  d3.setDate(today.getDate() + 2);
  return [format(d1), format(d2), format(d3)];
};

const [todayDate, tomorrowDate, dayAfterDate] = getDates();

const SEED_SHOWS: Show[] = [
  { id: 's-1', movieId: 'm-1', theatreId: 't-1', showDate: todayDate, showTime: '13:30' },
  { id: 's-2', movieId: 'm-1', theatreId: 't-1', showDate: todayDate, showTime: '18:00' },
  { id: 's-3', movieId: 'm-1', theatreId: 't-2', showDate: todayDate, showTime: '21:15' },
  { id: 's-4', movieId: 'm-2', theatreId: 't-2', showDate: todayDate, showTime: '15:00' },
  { id: 's-5', movieId: 'm-2', theatreId: 't-3', showDate: todayDate, showTime: '19:45' },
  { id: 's-6', movieId: 'm-3', theatreId: 't-1', showDate: tomorrowDate, showTime: '14:00' },
  { id: 's-7', movieId: 'm-3', theatreId: 't-2', showDate: tomorrowDate, showTime: '20:30' },
  { id: 's-8', movieId: 'm-4', theatreId: 't-3', showDate: dayAfterDate, showTime: '17:00' },
  { id: 's-9', movieId: 'm-5', theatreId: 't-1', showDate: todayDate, showTime: '11:00' }
];

// Helper to generate seats for a show based on theatre layout
function generateSeatsForShow(show: Show, theatre: Theatre): Seat[] {
  const seats: Seat[] = [];

  // Balcony (Row A, B)
  const balconyRows = Math.ceil(theatre.balconySeatCount / 8);
  for (let r = 0; r < balconyRows; r++) {
    const rowChar = String.fromCharCode(65 + r); // 'A', 'B'
    for (let c = 1; c <= 8; c++) {
      if (seats.filter(s => s.type === 'balcony').length >= theatre.balconySeatCount) break;
      const num = `${rowChar}${c}`;
      seats.push({
        id: `seat-${show.id}-${num}`,
        showId: show.id,
        seatNumber: num,
        type: 'balcony',
        price: theatre.balconySeatPrice,
        status: (num === 'A3' || num === 'A4') ? 'booked' : 'available'
      });
    }
  }

  // Middle (Row C, D, E)
  const middleRows = Math.ceil(theatre.middleSeatCount / 8);
  for (let r = 0; r < middleRows; r++) {
    const rowChar = String.fromCharCode(67 + r); // 'C', 'D', 'E'
    for (let c = 1; c <= 8; c++) {
      if (seats.filter(s => s.type === 'middle').length >= theatre.middleSeatCount) break;
      const num = `${rowChar}${c}`;
      seats.push({
        id: `seat-${show.id}-${num}`,
        showId: show.id,
        seatNumber: num,
        type: 'middle',
        price: theatre.middleSeatPrice,
        status: (num === 'D4' || num === 'D5' || num === 'C2') ? 'booked' : 'available'
      });
    }
  }

  // Lower (Row F, G)
  const lowerRows = Math.ceil(theatre.lowerSeatCount / 8);
  for (let r = 0; r < lowerRows; r++) {
    const rowChar = String.fromCharCode(70 + r); // 'F', 'G'
    for (let c = 1; c <= 8; c++) {
      if (seats.filter(s => s.type === 'lower').length >= theatre.lowerSeatCount) break;
      const num = `${rowChar}${c}`;
      seats.push({
        id: `seat-${show.id}-${num}`,
        showId: show.id,
        seatNumber: num,
        type: 'lower',
        price: theatre.lowerSeatPrice,
        status: (num === 'F5') ? 'booked' : 'available'
      });
    }
  }

  return seats;
}

class MockDatabase {
  private usersKey = 'imovies_db_users';
  private moviesKey = 'imovies_db_movies';
  private theatresKey = 'imovies_db_theatres';
  private showsKey = 'imovies_db_shows';
  private seatsKey = 'imovies_db_seats';
  private bookingsKey = 'imovies_db_bookings';
  private paymentsKey = 'imovies_db_payments';
  private notificationsKey = 'imovies_db_notifications';
  private activeTokenKey = 'imovies_auth_token';
  private currentUserKey = 'imovies_current_user';

  constructor() {
    this.initDatabase();
    this.setupRealtimeListener();
  }

  private setupRealtimeListener() {
    if (realtimeChannel) {
      realtimeChannel.onmessage = (event) => {
        window.dispatchEvent(new CustomEvent('imovies:realtime', { detail: event.data }));
      };
    }
  }

  private broadcast(action: string, payload: any) {
    const data = { action, payload, timestamp: Date.now() };
    if (realtimeChannel) {
      realtimeChannel.postMessage(data);
    }
    window.dispatchEvent(new CustomEvent('imovies:realtime', { detail: data }));
  }

  private initDatabase() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(this.usersKey)) {
      localStorage.setItem(this.usersKey, JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem(this.moviesKey)) {
      localStorage.setItem(this.moviesKey, JSON.stringify(SEED_MOVIES));
    }
    if (!localStorage.getItem(this.theatresKey)) {
      localStorage.setItem(this.theatresKey, JSON.stringify(SEED_THEATRES));
    }
    if (!localStorage.getItem(this.showsKey)) {
      localStorage.setItem(this.showsKey, JSON.stringify(SEED_SHOWS));
    }
    if (!localStorage.getItem(this.seatsKey)) {
      const allSeats: Record<string, Seat[]> = {};
      const theatres = this.getTheatres();
      const shows = this.getShows();
      shows.forEach(show => {
        const theatre = theatres.find(t => t.id === show.theatreId) || theatres[0];
        allSeats[show.id] = generateSeatsForShow(show, theatre);
      });
      localStorage.setItem(this.seatsKey, JSON.stringify(allSeats));
    }
    if (!localStorage.getItem(this.bookingsKey)) {
      const sampleBookings: Booking[] = [
        {
          id: 'b-sample-1',
          userId: 'u-user-1',
          userEmail: 'user@imovies.com',
          showId: 's-1',
          seats: ['A3', 'A4'],
          seatType: 'balcony',
          totalPrice: 44,
          status: 'confirmed',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
        }
      ];
      localStorage.setItem(this.bookingsKey, JSON.stringify(sampleBookings));
    }
    if (!localStorage.getItem(this.notificationsKey)) {
      const sampleNotifications: NotificationItem[] = [
        {
          id: 'notif-1',
          userId: 'u-user-1',
          message: 'Booking confirmed for Dune: Part Two at iMovies Grand Palace (Seats: A3, A4).',
          read: false,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.notificationsKey, JSON.stringify(sampleNotifications));
    }
    if (!localStorage.getItem(this.paymentsKey)) {
      localStorage.setItem(this.paymentsKey, JSON.stringify([]));
    }
  }

  // USERS & AUTH
  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(this.usersKey) || '[]');
  }

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(this.currentUserKey);
    return raw ? JSON.parse(raw) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.activeTokenKey);
  }

  login(email: string, pass: string): { user: User; token: string } {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password');
    }
    if (email === 'admin@imovies.com' && pass !== 'admin123') {
      throw new Error('Invalid password for admin');
    }
    if (email === 'user@imovies.com' && pass !== 'user123') {
      throw new Error('Invalid password for user');
    }

    const token = `jwt_mock_${user.id}_${Date.now()}`;
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    localStorage.setItem(this.activeTokenKey, token);
    return { user, token };
  }

  register(username: string, email: string, pass: string, role: 'user' | 'admin' = 'user'): { user: User; token: string } {
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists');
    }
    const newUser: User = {
      id: `u-${Date.now()}`,
      username,
      email,
      role,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(users));

    const token = `jwt_mock_${newUser.id}_${Date.now()}`;
    localStorage.setItem(this.currentUserKey, JSON.stringify(newUser));
    localStorage.setItem(this.activeTokenKey, token);
    return { user: newUser, token };
  }

  logout() {
    localStorage.removeItem(this.currentUserKey);
    localStorage.removeItem(this.activeTokenKey);
  }

  // MOVIES
  getMovies(): Movie[] {
    return JSON.parse(localStorage.getItem(this.moviesKey) || '[]');
  }

  getMovieById(id: string): Movie | undefined {
    return this.getMovies().find(m => m.id === id);
  }

  addMovie(movieData: Omit<Movie, 'id' | 'createdAt'>): Movie {
    const movies = this.getMovies();
    const newMovie: Movie = {
      ...movieData,
      id: `m-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    movies.unshift(newMovie);
    localStorage.setItem(this.moviesKey, JSON.stringify(movies));
    this.broadcast('movie:created', newMovie);
    return newMovie;
  }

  deleteMovie(id: string): boolean {
    let movies = this.getMovies();
    movies = movies.filter(m => m.id !== id);
    localStorage.setItem(this.moviesKey, JSON.stringify(movies));

    let shows = this.getShows();
    const showsToDelete = shows.filter(s => s.movieId === id);
    shows = shows.filter(s => s.movieId !== id);
    localStorage.setItem(this.showsKey, JSON.stringify(shows));

    const allSeats = this.getAllSeatsMap();
    showsToDelete.forEach(s => {
      delete allSeats[s.id];
    });
    localStorage.setItem(this.seatsKey, JSON.stringify(allSeats));

    this.broadcast('movie:deleted', { id });
    return true;
  }

  // THEATRES
  getTheatres(): Theatre[] {
    return JSON.parse(localStorage.getItem(this.theatresKey) || '[]');
  }

  addTheatre(theatreData: Omit<Theatre, 'id'>): Theatre {
    const theatres = this.getTheatres();
    const newTheatre: Theatre = {
      ...theatreData,
      id: `t-${Date.now()}`
    };
    theatres.push(newTheatre);
    localStorage.setItem(this.theatresKey, JSON.stringify(theatres));
    this.broadcast('theatre:created', newTheatre);
    return newTheatre;
  }

  deleteTheatre(id: string): boolean {
    let theatres = this.getTheatres();
    theatres = theatres.filter(t => t.id !== id);
    localStorage.setItem(this.theatresKey, JSON.stringify(theatres));
    return true;
  }

  // SHOWS
  getShows(): Show[] {
    const rawShows: Show[] = JSON.parse(localStorage.getItem(this.showsKey) || '[]');
    const movies = this.getMovies();
    const theatres = this.getTheatres();

    return rawShows.map(s => ({
      ...s,
      movie: movies.find(m => m.id === s.movieId),
      theatre: theatres.find(t => t.id === s.theatreId)
    }));
  }

  addShow(showData: Omit<Show, 'id' | 'movie' | 'theatre'>): Show {
    const rawShows: Show[] = JSON.parse(localStorage.getItem(this.showsKey) || '[]');
    const newShow: Show = {
      ...showData,
      id: `s-${Date.now()}`
    };
    rawShows.unshift(newShow);
    localStorage.setItem(this.showsKey, JSON.stringify(rawShows));

    const theatres = this.getTheatres();
    const theatre = theatres.find(t => t.id === showData.theatreId) || theatres[0];
    const seats = generateSeatsForShow(newShow, theatre);
    const allSeats = this.getAllSeatsMap();
    allSeats[newShow.id] = seats;
    localStorage.setItem(this.seatsKey, JSON.stringify(allSeats));

    this.broadcast('show:created', newShow);
    return newShow;
  }

  deleteShow(id: string): boolean {
    let rawShows: Show[] = JSON.parse(localStorage.getItem(this.showsKey) || '[]');
    rawShows = rawShows.filter(s => s.id !== id);
    localStorage.setItem(this.showsKey, JSON.stringify(rawShows));

    const allSeats = this.getAllSeatsMap();
    delete allSeats[id];
    localStorage.setItem(this.seatsKey, JSON.stringify(allSeats));

    this.broadcast('show:deleted', { id });
    return true;
  }

  // SEATS & REALTIME LOCKS
  private getAllSeatsMap(): Record<string, Seat[]> {
    return JSON.parse(localStorage.getItem(this.seatsKey) || '{}');
  }

  getSeatsForShow(showId: string): Seat[] {
    const allSeats = this.getAllSeatsMap();
    let seats = allSeats[showId];
    if (!seats) {
      const shows = this.getShows();
      const show = shows.find(s => s.id === showId);
      if (show) {
        const theatres = this.getTheatres();
        const theatre = theatres.find(t => t.id === show.theatreId) || theatres[0];
        seats = generateSeatsForShow(show, theatre);
        allSeats[showId] = seats;
        localStorage.setItem(this.seatsKey, JSON.stringify(allSeats));
      } else {
        return [];
      }
    }

    const now = Date.now();
    let modified = false;
    seats = seats.map(seat => {
      if (seat.status === 'locked' && seat.lockExpiresAt && seat.lockExpiresAt < now) {
        modified = true;
        return {
          ...seat,
          status: 'available',
          lockedBy: undefined,
          lockExpiresAt: undefined
        };
      }
      return seat;
    });

    if (modified) {
      allSeats[showId] = seats;
      localStorage.setItem(this.seatsKey, JSON.stringify(allSeats));
      this.broadcast('seats:updated', { showId, seats });
    }

    return seats;
  }

  lockSeats(showId: string, seatNumbers: string[], userId: string): { success: boolean; seats: Seat[]; message?: string } {
    const allSeats = this.getAllSeatsMap();
    let seats = this.getSeatsForShow(showId);
    const now = Date.now();
    const lockExpiry = now + 5 * 60 * 1000;

    for (const seatNum of seatNumbers) {
      const target = seats.find(s => s.seatNumber === seatNum);
      if (!target) return { success: false, seats, message: `Seat ${seatNum} not found` };
      if (target.status === 'booked') {
        return { success: false, seats, message: `Seat ${seatNum} is already booked` };
      }
      if (target.status === 'locked' && target.lockedBy !== userId && target.lockExpiresAt && target.lockExpiresAt > now) {
        return { success: false, seats, message: `Seat ${seatNum} is locked by another customer` };
      }
    }

    seats = seats.map(s => {
      if (seatNumbers.includes(s.seatNumber)) {
        return {
          ...s,
          status: 'locked',
          lockedBy: userId,
          lockExpiresAt: lockExpiry
        };
      }
      return s;
    });

    allSeats[showId] = seats;
    localStorage.setItem(this.seatsKey, JSON.stringify(allSeats));
    this.broadcast('seats:updated', { showId, seats });
    return { success: true, seats };
  }

  unlockSeats(showId: string, seatNumbers: string[], userId: string): { success: boolean; seats: Seat[] } {
    const allSeats = this.getAllSeatsMap();
    let seats = this.getSeatsForShow(showId);

    seats = seats.map(s => {
      if (seatNumbers.includes(s.seatNumber) && s.status === 'locked' && (s.lockedBy === userId || !s.lockedBy)) {
        return {
          ...s,
          status: 'available',
          lockedBy: undefined,
          lockExpiresAt: undefined
        };
      }
      return s;
    });

    allSeats[showId] = seats;
    localStorage.setItem(this.seatsKey, JSON.stringify(allSeats));
    this.broadcast('seats:updated', { showId, seats });
    return { success: true, seats };
  }

  // BOOKINGS
  getBookings(): Booking[] {
    const bookings: Booking[] = JSON.parse(localStorage.getItem(this.bookingsKey) || '[]');
    const shows = this.getShows();
    return bookings.map(b => ({
      ...b,
      show: shows.find(s => s.id === b.showId)
    }));
  }

  getUserBookings(userId: string): Booking[] {
    return this.getBookings().filter(b => b.userId === userId);
  }

  createBooking(bookingData: {
    userId: string;
    userEmail: string;
    showId: string;
    seats: string[];
    seatType: string;
    totalPrice: number;
    paymentMethod: string;
  }): { booking: Booking; payment: Payment } {
    const { userId, userEmail, showId, seats, seatType, totalPrice, paymentMethod } = bookingData;
    const allSeats = this.getAllSeatsMap();
    let showSeats = this.getSeatsForShow(showId);

    for (const num of seats) {
      const s = showSeats.find(st => st.seatNumber === num);
      if (s?.status === 'booked') {
        throw new Error(`Seat ${num} has already been booked by another user.`);
      }
    }

    showSeats = showSeats.map(s => {
      if (seats.includes(s.seatNumber)) {
        return {
          ...s,
          status: 'booked',
          lockedBy: undefined,
          lockExpiresAt: undefined
        };
      }
      return s;
    });
    allSeats[showId] = showSeats;
    localStorage.setItem(this.seatsKey, JSON.stringify(allSeats));

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      userId,
      userEmail,
      showId,
      seats,
      seatType,
      totalPrice,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    const bookings = JSON.parse(localStorage.getItem(this.bookingsKey) || '[]');
    bookings.unshift(newBooking);
    localStorage.setItem(this.bookingsKey, JSON.stringify(bookings));

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      bookingId: newBooking.id,
      userId,
      amount: totalPrice,
      method: paymentMethod || 'Credit Card',
      status: 'success',
      transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      createdAt: new Date().toISOString()
    };
    const payments = JSON.parse(localStorage.getItem(this.paymentsKey) || '[]');
    payments.unshift(newPayment);
    localStorage.setItem(this.paymentsKey, JSON.stringify(payments));

    const show = this.getShows().find(s => s.id === showId);
    const movieName = show?.movie?.name || 'Movie';
    const theatreName = show?.theatre?.name || 'Cinema';
    this.addNotification(
      userId,
      `Your ticket is confirmed for "${movieName}" at ${theatreName} on ${show?.showDate} at ${show?.showTime}. Seats: ${seats.join(', ')}.`
    );

    this.broadcast('seats:updated', { showId, seats: showSeats });
    this.broadcast('booking:created', newBooking);

    return { booking: newBooking, payment: newPayment };
  }

  cancelBooking(bookingId: string, userId: string): boolean {
    const bookings: Booking[] = JSON.parse(localStorage.getItem(this.bookingsKey) || '[]');
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.userId !== userId) throw new Error('Unauthorized');
    if (booking.status === 'cancelled') throw new Error('Booking is already cancelled');

    booking.status = 'cancelled';
    localStorage.setItem(this.bookingsKey, JSON.stringify(bookings));

    const allSeats = this.getAllSeatsMap();
    let showSeats = this.getSeatsForShow(booking.showId);
    showSeats = showSeats.map(s => {
      if (booking.seats.includes(s.seatNumber)) {
        return {
          ...s,
          status: 'available',
          lockedBy: undefined,
          lockExpiresAt: undefined
        };
      }
      return s;
    });
    allSeats[booking.showId] = showSeats;
    localStorage.setItem(this.seatsKey, JSON.stringify(allSeats));

    this.addNotification(
      userId,
      `Your booking #${booking.id.slice(-6).toUpperCase()} has been cancelled. Refund of $${booking.totalPrice} has been initiated.`
    );

    this.broadcast('seats:updated', { showId: booking.showId, seats: showSeats });
    this.broadcast('booking:cancelled', { id: bookingId });
    return true;
  }

  // NOTIFICATIONS
  getNotifications(userId: string): NotificationItem[] {
    const notifs: NotificationItem[] = JSON.parse(localStorage.getItem(this.notificationsKey) || '[]');
    return notifs.filter(n => n.userId === userId);
  }

  addNotification(userId: string, message: string): NotificationItem {
    const notifs: NotificationItem[] = JSON.parse(localStorage.getItem(this.notificationsKey) || '[]');
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      message,
      read: false,
      createdAt: new Date().toISOString()
    };
    notifs.unshift(newNotif);
    localStorage.setItem(this.notificationsKey, JSON.stringify(notifs));
    return newNotif;
  }

  markNotificationsAsRead(userId: string) {
    let notifs: NotificationItem[] = JSON.parse(localStorage.getItem(this.notificationsKey) || '[]');
    notifs = notifs.map(n => n.userId === userId ? { ...n, read: true } : n);
    localStorage.setItem(this.notificationsKey, JSON.stringify(notifs));
  }
}

export const db = new MockDatabase();
