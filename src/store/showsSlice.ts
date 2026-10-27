import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Show } from '../types';
import { db } from '../services/mockDb';

interface ShowsState {
  shows: Show[];
  selectedDate: string;
}

const initialState: ShowsState = {
  shows: typeof window !== 'undefined' ? db.getShows() : [],
  selectedDate: ''
};

export const showsSlice = createSlice({
  name: 'shows',
  initialState,
  reducers: {
    refreshShows: (state) => {
      state.shows = db.getShows();
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    }
  }
});

export const { refreshShows, setSelectedDate } = showsSlice.actions;
export default showsSlice.reducer;
