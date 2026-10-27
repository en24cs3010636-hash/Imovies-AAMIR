import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '../types';
import { db } from '../services/mockDb';

const savedUser = typeof window !== 'undefined' ? db.getCurrentUser() : null;
const savedToken = typeof window !== 'undefined' ? db.getToken() : null;

const initialState: AuthState = {
  user: savedUser,
  token: savedToken,
  isAuthenticated: !!savedUser && !!savedToken,
  isLoading: false
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    logoutUser: (state) => {
      db.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  }
});

export const { setCredentials, logoutUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
