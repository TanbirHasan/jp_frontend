"use client";

import { create } from "zustand";

export type AppNotification = {
  id: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
};

type NotificationState = {
  notifications: AppNotification[];
  addNotification: (message: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
};

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],

  addNotification: (message) =>
    set((state) => ({
      notifications: [
        {
          id: crypto.randomUUID(),
          message,
          isRead: false,
          timestamp: new Date(),
        },
        ...state.notifications,
      ],
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),

  clearAll: () => set({ notifications: [] }),
}));
