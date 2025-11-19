"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

type Props = {
  children: React.ReactNode;
  allowedRoles?: Array<"guest" | "driver" | "partner" | "admin">;
};

export const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { user, token, ready } = useAuth();
  const router = useRouter();
  const disableAuth = typeof process !== "undefined" && process.env.NEXT_PUBLIC_DISABLE_AUTH === "1";
  const isPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("preview") === "1";

  useEffect(() => {
    if (!ready) return; // wait for hydration
    if (disableAuth || isPreview) return; // dev bypass: allow rendering without redirects
    if (!token) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect to their own dashboard
      const map: Record<string, string> = {
        guest: "/",
        driver: "/",
        partner: "/partner/dashboard",
        admin: "/admin",
      };
      router.replace(map[user.role]);
    }
  }, [ready, token, user, allowedRoles, router]);

  if (!ready) return null;
  if (disableAuth || isPreview) return <>{children}</>;
  if (!token) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;
  return <>{children}</>;
};

export default ProtectedRoute;