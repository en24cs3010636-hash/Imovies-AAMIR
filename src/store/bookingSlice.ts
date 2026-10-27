import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Show, Seat, SeatTier } from '../types';

interface BookingFlowState {
  currentShow: Show | null;
  selectedSeats: Seat[];
  seatType: SeatTier | 'mixed';
  totalPrice: number;
  lockExpiresAt: number | null; // ms timestamp
}

const initialState: BookingFlowState = {
  currentShow: null,
  selectedSeats: [],
  seatType: 'middle',
  totalPrice: 0,
  lockExpiresAt: null
};

export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setCurrentShow: (state, action: PayloadAction<Show | null>) => {
      state.currentShow = action.payload;
      state.selectedSeats = [];
      state.totalPrice = 0;
      state.lockExpiresAt = null;
    },
    toggleSeatSelection: (state, action: PayloadAction<Seat>) => {
      const seat = action.payload;
      const index = state.selectedSeats.findIndex(s => s.id === seat.id);

      if (index >= 0) {
        state.selectedSeats.splice(index, 1);
      } else {
        // limit to 8 seats per booking
        if (state.selectedSeats.length >= 8) {
          return;
        }
        state.selectedSeats.push(seat);
      }

      // calculate total price
      state.totalPrice = state.selectedSeats.reduce((sum, s) => sum + s.price, 0);

      // determine dominant tier
      if (state.selectedSeats.length === 0) {
        state.seatType = 'middle';
      } else {
        const types = new Set(state.selectedSeats.map(s => s.type));
        state.seatType = types.size === 1 ? state.selectedSeats[0].type : 'mixed';
      }
    },
    setLockTimer: (state, action: PayloadAction<number>) => {
      state.lockExpiresAt = action.payload;
    },
    clearBookingSelection: (state) => {
      state.selectedSeats = [];
      state.totalPrice = 0;
      state.lockExpiresAt = null;
    }
  }
});

export const {
  setCurrentShow,
  toggleSeatSelection,
  setLockTimer,
  clearBookingSelection
} = bookingSlice.actions;

export default bookingSlice.reducer;
