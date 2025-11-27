"use client";

import React, { Suspense, useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import MobileAppBridge from "../../../components/mobile/MobileAppBridge";
import MobileTabBar from "../../../components/mobile/MobileTabBar";
import { LayoutDashboard, Map, FileText, Users, Calendar, DollarSign, Shield, Settings, Loader2 } from "lucide-react";
import clsx from "clsx";
import AdminDashboard from "./modules/Dashboard";
import AdminLiveMap from "./modules/LiveMap";
import AdminApplications from "./modules/Applications";
import AdminUsers from "./modules/Users";
import AdminReservations from "./modules/Reservations";
import AdminFinance from "./modules/Finance";
import AdminSecurity from "./modules/Security";
import AdminSettings from "./modules/Settings";

type AdminTab = "dashboard" | "map" | "applications" | "users" | "reservations" | "finance" | "security" | "settings";

const TABS: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Genel Durum", icon: LayoutDashboard },
  { id: "map", label: "Canlı Harita", icon: Map },
  { id: "applications", label: "Başvurular", icon: FileText },
  { id: "users", label: "Kullanıcılar", icon: Users },
  { id: "reservations", label: "Rezervasyonlar", icon: Calendar },
  { id: "finance", label: "Finans", icon: DollarSign },
  { id: "security", label: "Güvenlik", icon: Shield },
  { id: "settings", label: "Ayarlar", icon: Settings },
];

function AdminDashboardInner() {
  const [authorized, setAuthorized] = useState(false);
  useEffect(() => {
    try {
      const flag = typeof window !== "undefined" ? localStorage.getItem("zuber_admin") : null;
      setAuthorized(flag === "true");
    } catch {}
  }, []);
  if (!authorized) {
    return null;
  }
  return <AdminDashboardContent />;
}

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Navbar />
      <MobileAppBridge />
      <main className="min-h-screen bg-black text-gray-200">
        <div className="mx-auto max-w-[1920px]">
          <header className="border-b border-[#3a2a0f] bg-[#050302]/80 backdrop-blur-xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-[#b4872b]">Zuber Control Room</p>
                <h1 className="font-cinzel text-3xl md:text-4xl text-[#f5d47d] drop-shadow-[0_10px_30px_rgba(250,204,21,0.25)]">Admin Paneli</h1>
              </div>
            </div>
          </header>

          <div className="flex flex-col lg:flex-row">
            <aside className="w-full border-b border-[#3a2a0f] bg-[#050302]/60 backdrop-blur-xl lg:w-64 lg:border-b-0 lg:border-r">
              <nav className="p-4 space-y-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={clsx(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-[#fbd483] to-[#f3b94f] text-black shadow-lg shadow-[#f5c76a]/20"
                          : "text-[#b18a39] hover:bg-[#1a1305] hover:text-[#f5c76a]"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div className="flex-1 p-6">
              <Suspense fallback={<LoadingState />}>
                {activeTab === "dashboard" && <AdminDashboard />}
                {activeTab === "map" && <AdminLiveMap />}
                {activeTab === "applications" && <AdminApplications />}
                {activeTab === "users" && <AdminUsers />}
                {activeTab === "reservations" && <AdminReservations />}
                {activeTab === "finance" && <AdminFinance />}
                {activeTab === "security" && <AdminSecurity />}
                {activeTab === "settings" && <AdminSettings />}
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <MobileTabBar />
    </ProtectedRoute>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#f5c76a]" />
        <p className="text-sm text-zinc-400">Yükleniyor...</p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AdminDashboardInner />
    </Suspense>
  );
}
