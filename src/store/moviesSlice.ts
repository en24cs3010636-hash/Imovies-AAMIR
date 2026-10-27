import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Movie } from '../types';
import { db } from '../services/mockDb';

interface MoviesState {
  movies: Movie[];
  searchQuery: string;
  selectedGenre: string;
  selectedLanguage: string;
  sortBy: 'releaseDate' | 'name' | 'runtime';
  currentPage: number;
  itemsPerPage: number;
  favorites: string[]; // movie IDs
}

const initialState: MoviesState = {
  movies: typeof window !== 'undefined' ? db.getMovies() : [],
  searchQuery: '',
  selectedGenre: 'All',
  selectedLanguage: 'All',
  sortBy: 'releaseDate',
  currentPage: 1,
  itemsPerPage: 8,
  favorites: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('imovies_favs') || '[]') : []
};

export const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    refreshMovies: (state) => {
      state.movies = db.getMovies();
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setSelectedGenre: (state, action: PayloadAction<string>) => {
      state.selectedGenre = action.payload;
      state.currentPage = 1;
    },
    setSelectedLanguage: (state, action: PayloadAction<string>) => {
      state.selectedLanguage = action.payload;
      state.currentPage = 1;
    },
    setSortBy: (state, action: PayloadAction<'releaseDate' | 'name' | 'runtime'>) => {
      state.sortBy = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.favorites.includes(id)) {
        state.favorites = state.favorites.filter(favId => favId !== id);
      } else {
        state.favorites.push(id);
      }
      localStorage.setItem('imovies_favs', JSON.stringify(state.favorites));
    }
  }
});

export const {
  refreshMovies,
  setSearchQuery,
  setSelectedGenre,
  setSelectedLanguage,
  setSortBy,
  setCurrentPage,
  toggleFavorite
} = moviesSlice.actions;

export default moviesSlice.reducer;
