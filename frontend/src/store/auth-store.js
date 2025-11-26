"use client";

import { create } from "zustand";

const getInitialToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("lms_token") : null;

const getInitialUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem("lms_user");
  try {
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

export const TOKEN_COOKIE_NAME = "lms_token";

const setTokenCookie = (token) => {
  if (typeof document === "undefined") {
    return;
  }

  if (token) {
    // Set cookie with SameSite=Lax and max-age for better cross-origin support
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } else {
    document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
};

export const useAuthStore = create((set) => ({
  token: getInitialToken(),
  user: getInitialUser(),
  setAuth: ({ token, user }) => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("lms_token", token);
      } else {
        localStorage.removeItem("lms_token");
      }

      if (user) {
        localStorage.setItem("lms_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("lms_user");
      }
    }

    setTokenCookie(token);

    set({ token, user });
  },
  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lms_token");
      localStorage.removeItem("lms_user");
    }

    setTokenCookie(null);

    set({ token: null, user: null });
  },
}));

