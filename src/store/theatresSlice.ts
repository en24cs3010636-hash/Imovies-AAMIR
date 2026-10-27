import { createSlice } from '@reduxjs/toolkit';
import { Theatre } from '../types';
import { db } from '../services/mockDb';

interface TheatresState {
  theatres: Theatre[];
}

const initialState: TheatresState = {
  theatres: typeof window !== 'undefined' ? db.getTheatres() : []
};

export const theatresSlice = createSlice({
  name: 'theatres',
  initialState,
  reducers: {
    refreshTheatres: (state) => {
      state.theatres = db.getTheatres();
    }
  }
});

export const { refreshTheatres } = theatresSlice.actions;
export default theatresSlice.reducer;
