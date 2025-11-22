"use client";
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "../lib/api";
import { toast } from "sonner";

export type Role = "guest" | "driver" | "partner" | "admin";
export type AuthUser = { id: number; full_name: string; email?: string; role: Role; must_change_password?: boolean } | null;

type AuthContextType = {
  user: AuthUser;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string, role?: Role) => Promise<void>;
  register: (full_name: string, email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("vip_token") : null;
    const u = typeof window !== "undefined" ? localStorage.getItem("vip_user") : null;
    if (t) {
      setToken(t);
      setAuthToken(t);
      document.cookie = `token=${t}; path=/`;
    }
    if (u) {
      try { setUser(JSON.parse(u)); } catch {}
    }
    setReady(true);
  }, []);

  const roleRedirect = (role: Role) => {
    const map: Record<Role, string> = {
      guest: "/",
      driver: "/dashboard/driver",
      partner: "/dashboard/partner",
      admin: "/dashboard/admin",
    };
    window.location.href = map[role];
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post("/api/users/login", { email, password });
    const { access_token, full_name, role, id, must_change_password } = res.data;
    const authUser = { id, full_name, role, must_change_password } as AuthUser;
    setUser(authUser);
    setToken(access_token);
    setAuthToken(access_token);
    localStorage.setItem("vip_token", access_token);
    localStorage.setItem("vip_user", JSON.stringify(authUser));
    document.cookie = `role=${role}; path=/`;
    document.cookie = `token=${access_token}; path=/`;
    toast.success(`Hoş geldiniz, ${full_name}`);
    if (must_change_password && role === "partner") {
      window.location.href = "/change-password";
    } else {
      roleRedirect(role);
    }
  }, []);

  const register = useCallback(async (full_name: string, email: string, password: string, role: Role) => {
    await api.post("/api/users/register", { name: full_name, email, password, role });
    toast.success("Hesap oluşturuldu. Şimdi giriş yapabilirsiniz.");
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem("vip_token");
    localStorage.removeItem("vip_user");
    document.cookie = "role=; Max-Age=0; path=/";
    document.cookie = "token=; Max-Age=0; path=/";
    window.location.href = "/";
  }, []);

  const value = useMemo(() => ({ user, token, ready, login, register, logout }), [user, token, ready, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};