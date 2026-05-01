"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          // localStorage for Axios interceptor
          localStorage.setItem("tabibcare_token", token);
          localStorage.setItem("tabibcare_locale", user.language ?? "fr");
          // Cookies for Next.js middleware (server-side auth guard + role-aware redirect)
          document.cookie = `tabibcare_token=${token}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;
          document.cookie = `tabibcare_role=${user.role}; path=/; max-age=${60 * 60 * 8}; SameSite=Lax`;
        }
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("tabibcare_token");
          localStorage.removeItem("tabibcare_locale");
          // Remove auth cookies
          document.cookie = "tabibcare_token=; path=/; max-age=0";
          document.cookie = "tabibcare_role=; path=/; max-age=0";
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: "tabibcare_auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
