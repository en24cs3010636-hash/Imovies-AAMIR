import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import moviesReducer from './moviesSlice';
import theatresReducer from './theatresSlice';
import showsReducer from './showsSlice';
import bookingReducer from './bookingSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: moviesReducer,
    theatres: theatresReducer,
    shows: showsReducer,
    booking: bookingReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
