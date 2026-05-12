"use client";

import { create } from "zustand";
import type { User } from "@/lib/types";

type AuthState = {
  accessToken: string | null;
  user: User | null;
  hasHydrated: boolean;
  hydrateFromStorage: () => void;
  setAuth: (accessToken: string, user: User) => void;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
};

const ACCESS_TOKEN_KEY = "access_token";
const AUTH_USER_KEY = "auth_user";

function readStoredUser() {
  const storedUser = localStorage.getItem(AUTH_USER_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

function normalizeStoredToken(token: string | null) {
  if (!token || token === "undefined" || token === "null") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return null;
  }

  return token;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  hasHydrated: false,

  hydrateFromStorage: () => {
    const accessToken = normalizeStoredToken(localStorage.getItem(ACCESS_TOKEN_KEY));
    const user = readStoredUser();

    set({
      accessToken,
      user,
      hasHydrated: true,
    });
  },

  setAuth: (accessToken, user) => {
    if (!accessToken) {
      throw new Error("Cannot store an empty access token.");
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    set({ accessToken, user });
  },

  setAccessToken: (accessToken) => {
    if (accessToken && accessToken !== "undefined" && accessToken !== "null") {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      accessToken = null;
    }

    set({ accessToken });
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }

    set({ user });
  },

  clearAuth: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    set({ accessToken: null, user: null });
  },
}));
