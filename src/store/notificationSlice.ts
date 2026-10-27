import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationItem } from '../types';
import { db } from '../services/mockDb';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    loadUserNotifications: (state, action: PayloadAction<string>) => {
      const items = db.getNotifications(action.payload);
      state.notifications = items;
      state.unreadCount = items.filter(n => !n.read).length;
    },
    markAllRead: (state, action: PayloadAction<string>) => {
      db.markNotificationsAsRead(action.payload);
      state.notifications = state.notifications.map(n => ({ ...n, read: true }));
      state.unreadCount = 0;
    }
  }
});

export const { loadUserNotifications, markAllRead } = notificationSlice.actions;
export default notificationSlice.reducer;
