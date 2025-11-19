"use client";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext not found. Wrap with <AuthProvider>.");
  return ctx;
}