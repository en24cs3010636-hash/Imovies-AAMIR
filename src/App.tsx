import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AvailableMoviesPage } from './pages/AvailableMoviesPage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { PaymentConfirmationPage } from './pages/PaymentConfirmationPage';
import { YourBookingsPage } from './pages/YourBookingsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminAddMovie } from './pages/AdminAddMovie';
import { AdminAddShow } from './pages/AdminAddShow';
import { AdminAddTheatre } from './pages/AdminAddTheatre';

export default function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#1f2538] text-slate-100">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* 1. Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* 2 & 3. Auth Pages */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* 8. Available Movies Page */}
                <Route path="/movies" element={<AvailableMoviesPage />} />

                {/* 9. Movie Details + Show Selection + Seat Selection */}
                <Route path="/movies/:id" element={<MovieDetailsPage />} />

                {/* 10. Payment + Booking Confirmation */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <PaymentConfirmationPage />
                    </ProtectedRoute>
                  }
                />

                {/* 11. Your Bookings Page */}
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute>
                      <YourBookingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 4. Admin Dashboard */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 5. Admin Add Movie */}
                <Route
                  path="/admin/movies/add"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminAddMovie />
                    </ProtectedRoute>
                  }
                />

                {/* 6. Admin Add Show */}
                <Route
                  path="/admin/shows/add"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminAddShow />
                    </ProtectedRoute>
                  }
                />

                {/* 7. Admin Add Theatre */}
                <Route
                  path="/admin/theatres/add"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminAddTheatre />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  );
}
