"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, setAuthToken } from "@/lib/api";
import type { LoginCredentials, RegisterData, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  toast: (message: string, type?: "success" | "error" | "info") => void;
  toastMessage: { message: string; type: "success" | "error" | "info" } | null;
  clearToast: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PUBLIC_ROUTES = ["/login", "/recuperar-senha", "/redefinir-senha"];

function isPublicPath(pathname: string) {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith("/compartilhar/")) return true;
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  });
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const toast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setToastMessage({ message, type });
      setTimeout(() => setToastMessage(null), 4000);
    },
    []
  );

  const clearToast = useCallback(() => setToastMessage(null), []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const { data } = await api.post<User>("/user/login", credentials);
        if (!data.token) return false;
        localStorage.setItem("token", data.token);
        setAuthToken(data.token);
        setUser(data);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const register = useCallback(async (registerData: RegisterData) => {
    try {
      await api.post("/user/create", registerData);
      return true;
    } catch {
      return false;
    }
  }, []);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setAuthToken(token);
      const { data } = await api.post<User>("/user/loginToken");
      setUser(data);
    } catch {
      // sessão inválida — AuthProvider trata no próximo load
    }
  }, []);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        setAuthToken(token);
        const { data } = await api.post<User>("/user/loginToken");
        setUser(data);
      } catch {
        localStorage.removeItem("token");
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  useEffect(() => {
    if (loading) return;
    const isPublic = isPublicPath(pathname);
    if (!user && !isPublic) {
      router.replace("/login");
    } else if (user && pathname === "/login") {
      router.replace("/");
    }
  }, [user, loading, pathname, router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateUser,
      refreshUser,
      toast,
      toastMessage,
      clearToast,
    }),
    [user, loading, login, register, logout, updateUser, refreshUser, toast, toastMessage, clearToast]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
