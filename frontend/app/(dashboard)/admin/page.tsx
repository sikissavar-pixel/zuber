"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Navbar from "../../../components/Navbar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import MobileAppBridge from "../../../components/mobile/MobileAppBridge";
import MobileTabBar from "../../../components/mobile/MobileTabBar";
import { useDrivers, usePartners } from "../../../hooks/useReservations";
import {
  useAdminPartnerApplications,
  useAdminDriverApplications,
  useApprovePartner,
  useRejectPartner,
  useApproveDriver,
  useRejectDriver,
} from "../../../hooks/useApplications";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../../../lib/socket";
import { Loader2, CheckCircle2, XCircle, Search, Users, ShieldCheck, ShieldX } from "lucide-react";
import clsx from "clsx";

type ApplicationType = "driver" | "partner";
type BannerState = { type: "success" | "error"; message: string };
type TableRecord = {
  id: string | number;
  type: ApplicationType;
  name: string;
  email?: string | null;
  phone?: string | null;
  status: "approved" | "rejected";
  city?: string | null;
  created_at?: string | null;
};
type PendingCard = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  meta?: string | null;
  created_at?: string | null;
};

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
  const qc = useQueryClient();
  const { data: pendingPartnerApps = [], isLoading: pendingPartnerLoading } = useAdminPartnerApplications("pending");
  const { data: pendingDriverApps = [], isLoading: pendingDriverLoading } = useAdminDriverApplications("pending");
  const { data: rejectedPartnerApps = [], isLoading: rejectedPartnerLoading } = useAdminPartnerApplications("rejected");
  const { data: rejectedDriverApps = [], isLoading: rejectedDriverLoading } = useAdminDriverApplications("rejected");
  const { data: drivers = [], isLoading: driversLoading } = useDrivers();
  const { data: partners = [], isLoading: partnersLoading } = usePartners();
  const approvePartner = useApprovePartner();
  const approveDriver = useApproveDriver();
  const rejectPartner = useRejectPartner();
  const rejectDriver = useRejectDriver();

  const [banner, setBanner] = useState<BannerState | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "driver" | "partner">("all");

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 5000);
    return () => clearTimeout(timer);
  }, [banner]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("admin_join");
    const refreshApplications = () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["partners"] });
      qc.invalidateQueries({ queryKey: ["drivers"] });
    };
    socket.on("new_application", refreshApplications);
    socket.on("application_updated", refreshApplications);
    socket.on("application_approved", refreshApplications);
    socket.on("partners_updated", () => qc.invalidateQueries({ queryKey: ["partners"] }));
    socket.on("drivers_updated", () => qc.invalidateQueries({ queryKey: ["drivers"] }));
    return () => {
      socket.off("new_application", refreshApplications);
      socket.off("application_updated", refreshApplications);
      socket.off("application_approved", refreshApplications);
      socket.off("partners_updated");
      socket.off("drivers_updated");
    };
  }, [qc]);

  const resolveError = (err: any) =>
    err?.response?.data?.details ||
    err?.response?.data?.error ||
    err?.response?.data?.detail ||
    err?.message ||
    "İşlem tamamlanamadı";

  const handleApprove = async (type: ApplicationType, id: number) => {
    setActioning(`approve-${type}-${id}`);
    setBanner(null);
    try {
      const res = type === "driver" ? await approveDriver.mutateAsync(id) : await approvePartner.mutateAsync(id);
      if (res?.success) {
        setBanner({ type: "success", message: "Şifre kullanıcıya mail olarak gönderildi." });
      } else {
        setBanner({ type: "error", message: resolveError({ response: { data: res } }) });
      }
    } catch (err) {
      const backendMessage =
        err && typeof err === "object" && "response" in err ? resolveError(err) : null;
      setBanner({
        type: "error",
        message: backendMessage || "Sunucu hatası: mail gönderilemedi",
      });
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (type: ApplicationType, id: number) => {
    setActioning(`reject-${type}-${id}`);
    setBanner(null);
    try {
      type === "driver" ? await rejectDriver.mutateAsync(id) : await rejectPartner.mutateAsync(id);
      setBanner({ type: "success", message: "Başvuru reddedildi." });
    } catch (err) {
      setBanner({ type: "error", message: resolveError(err) });
    } finally {
      setActioning(null);
    }
  };

  const pendingDriverList: PendingCard[] = useMemo(() => pendingDriverApps.map((app: any) => ({
    id: app.id,
    name: app.full_name,
    email: app.email,
    phone: app.phone,
    meta: app.vehicle_plate || app.city || "-",
    created_at: app.created_at,
  })), [pendingDriverApps]);

  const pendingPartnerList: PendingCard[] = useMemo(() => pendingPartnerApps.map((app: any) => ({
    id: app.id,
    name: app.contact_full_name || app.name,
    email: app.contact_email,
    phone: app.contact_phone,
    meta: app.city || app.description || "-",
    created_at: app.created_at,
  })), [pendingPartnerApps]);

  const approvedUsers: TableRecord[] = useMemo(() => {
    const driverRecords = (drivers as any[]).map((driver) => ({
      id: `driver-${driver.id}`,
      type: "driver" as ApplicationType,
      name: driver.full_name,
      email: driver.email,
      phone: driver.contact_phone,
      status: "approved" as const,
      city: driver.vehicle_plate || (driver as any)?.city || "-",
      created_at: (driver as any)?.created_at || null,
    }));
    const partnerRecords = (partners as any[]).map((partner) => ({
      id: `partner-${partner.id}`,
      type: "partner" as ApplicationType,
      name: partner.name,
      email: partner.contact_email,
      phone: partner.contact_phone,
      status: "approved" as const,
      city: (partner as any)?.city || partner.description || partner.contact_phone || "-",
      created_at: (partner as any)?.created_at || null,
    }));
    return [...driverRecords, ...partnerRecords];
  }, [drivers, partners]);

  const rejectedUsers: TableRecord[] = useMemo(() => {
    const driverRecords = (rejectedDriverApps as any[]).map((app) => ({
      id: `driver-rejected-${app.id}`,
      type: "driver" as ApplicationType,
      name: app.full_name,
      email: app.email,
      phone: app.phone,
      status: "rejected" as const,
      city: app.city || app.vehicle_plate || "-",
      created_at: app.updated_at || app.created_at || null,
    }));
    const partnerRecords = (rejectedPartnerApps as any[]).map((app) => ({
      id: `partner-rejected-${app.id}`,
      type: "partner" as ApplicationType,
      name: app.contact_full_name || app.name,
      email: app.contact_email,
      phone: app.contact_phone,
      status: "rejected" as const,
      city: app.city || app.description || "-",
      created_at: app.updated_at || app.created_at || null,
    }));
    return [...driverRecords, ...partnerRecords];
  }, [rejectedDriverApps, rejectedPartnerApps]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const recordMatches = (record: TableRecord) => {
    if (roleFilter !== "all" && record.type !== roleFilter) return false;
    if (!normalizedSearch) return true;
    const haystack = [record.name, record.email, record.phone, record.city].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(normalizedSearch);
  };

  const filteredApproved = useMemo(() => approvedUsers.filter(recordMatches), [approvedUsers, normalizedSearch, roleFilter]);
  const filteredRejected = useMemo(() => rejectedUsers.filter(recordMatches), [rejectedUsers, normalizedSearch, roleFilter]);

  const pendingTotal = pendingDriverList.length + pendingPartnerList.length;
  const rejectedTotal = rejectedUsers.length;

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Navbar />
      <MobileAppBridge />
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-8 bg-black min-h-screen text-gray-200">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.5em] text-[#b4872b]">Zuber Control Room</p>
          <h1 className="font-cinzel text-3xl md:text-4xl text-[#f5d47d] drop-shadow-[0_10px_30px_rgba(250,204,21,0.25)]">Admin Paneli</h1>
          <p className="text-sm text-zinc-400 max-w-2xl">Başvuruları yönetin, gerçek zamanlı güncellemeleri takip edin ve kritik işlemleri tek bir premium panel üzerinden tamamlayın.</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Bekleyen Başvuru" value={pendingTotal} icon={Users} accent="gold" loading={pendingPartnerLoading || pendingDriverLoading} />
          <StatCard title="Onaylı Sürücü" value={drivers.length} icon={ShieldCheck} accent="emerald" loading={driversLoading} />
          <StatCard title="Onaylı Partner" value={partners.length} icon={ShieldCheck} accent="amber" loading={partnersLoading} />
          <StatCard title="Reddedilen" value={rejectedTotal} icon={ShieldX} accent="rose" loading={rejectedPartnerLoading || rejectedDriverLoading} />
        </section>

        {banner && (
          <div
            className={clsx(
              "rounded-2xl border px-4 py-3 flex items-center gap-3",
              banner.type === "success" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-rose-500/40 bg-rose-500/10 text-rose-200"
            )}
          >
            {banner.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <span className="text-sm">{banner.message}</span>
          </div>
        )}

        <section className="rounded-3xl border border-[#2a1c07] bg-[#050403]/80 backdrop-blur-xl px-5 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c79a3a]" />
            <input
              type="text"
              placeholder="Ad, mail veya telefon ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-[#3a2a0f] bg-transparent py-3 pl-11 pr-4 text-sm text-white placeholder:text-[#8b7442] focus:border-[#f5c76a] focus:outline-none"
            />
          </label>
          <div className="flex items-center gap-2">
            {[
              { key: "all", label: "Tümü" },
              { key: "driver", label: "Sürücü" },
              { key: "partner", label: "Partner" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setRoleFilter(item.key as any)}
                className={clsx(
                  "rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition",
                  roleFilter === item.key ? "bg-[#f5c76a]/90 text-black" : "bg-[#1a1305] text-[#b18a39] hover:bg-[#2a1c07]"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <PendingApplicationList
            title="Bekleyen Sürücü Başvuruları"
            apps={pendingDriverList}
            type="driver"
            loading={pendingDriverLoading}
            onApprove={(id) => handleApprove("driver", id)}
            onReject={(id) => handleReject("driver", id)}
            actioning={actioning}
          />
          <PendingApplicationList
            title="Bekleyen Partner Başvuruları"
            apps={pendingPartnerList}
            type="partner"
            loading={pendingPartnerLoading}
            onApprove={(id) => handleApprove("partner", id)}
            onReject={(id) => handleReject("partner", id)}
            actioning={actioning}
          />
        </section>

        <AdminTable
          title="Onaylanan Kullanıcılar"
          data={filteredApproved}
          loading={driversLoading || partnersLoading}
          emptyText="Onaylı kullanıcı bulunamadı."
        />

        <AdminTable
          title="Reddedilen Başvurular"
          data={filteredRejected}
          loading={rejectedPartnerLoading || rejectedDriverLoading}
          emptyText="Henüz reddedilen başvuru yok."
        />
      </main>
      <MobileTabBar />
    </ProtectedRoute>
  );
}

function PendingApplicationList({
  title,
  apps,
  type,
  loading,
  onApprove,
  onReject,
  actioning,
}: {
  title: string;
  apps: PendingCard[];
  type: ApplicationType;
  loading: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  actioning: string | null;
}) {
  return (
    <section className="rounded-3xl border border-[#3a2a0f] bg-[#050302]/80 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#b18a39]">{type === "driver" ? "Driver" : "Partner"}</p>
          <h3 className="font-cinzel text-xl text-[#f5d47d]">{title}</h3>
        </div>
        <span className="text-xs text-[#caa04a]">{apps.length} kayıt</span>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin text-[#f5c76a]" /> Veriler yükleniyor...
        </div>
      ) : apps.length === 0 ? (
        <p className="py-10 text-sm text-zinc-500">Bekleyen başvuru yok.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {apps.map((app) => {
            const approveKey = `approve-${type}-${app.id}`;
            const rejectKey = `reject-${type}-${app.id}`;
            const created = app.created_at ? new Date(app.created_at).toLocaleString("tr-TR") : "—";
            return (
              <div key={`${type}-${app.id}`} className="rounded-2xl border border-[#4a340f]/60 bg-black/40 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{app.name}</p>
                    <p className="text-sm text-zinc-400">{app.email}</p>
                    <p className="text-sm text-zinc-500">{app.phone || "Telefon yok"}</p>
                  </div>
                  <div className="text-xs text-right text-zinc-500">
                    <p>{app.meta}</p>
                    <p>{created}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => onApprove(app.id)}
                    disabled={actioning === approveKey}
                    className={clsx(
                      "flex-1 rounded-2xl border border-[#f5c76a]/60 bg-gradient-to-r from-[#fbd483] to-[#f3b94f] py-2 text-sm font-semibold text-black",
                      actioning === approveKey && "opacity-70"
                    )}
                  >
                    {actioning === approveKey ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> İşleniyor
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Onayla
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => onReject(app.id)}
                    disabled={actioning === rejectKey}
                    className={clsx(
                      "flex-1 rounded-2xl border border-[#5c1f1f]/70 bg-[#2b0e0e] py-2 text-sm font-semibold text-[#ffb4a2]",
                      actioning === rejectKey && "opacity-70"
                    )}
                  >
                    {actioning === rejectKey ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> İşleniyor
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <ShieldX className="h-4 w-4" /> Reddet
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function AdminTable({ title, data, loading, emptyText }: { title: string; data: TableRecord[]; loading: boolean; emptyText: string }) {
  return (
    <section className="rounded-3xl border border-[#3b2b0f] bg-[#050302]/80 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#b18a39]">Zuber Network</p>
          <h3 className="font-cinzel text-xl text-[#f5d47d]">{title}</h3>
        </div>
        <span className="text-xs text-[#caa04a]">{data.length} kayıt</span>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin text-[#f5c76a]" /> Veriler güncelleniyor...
        </div>
      ) : data.length === 0 ? (
        <p className="py-8 text-sm text-zinc-500">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#2b1d07] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.4em] text-[#8c6a29]">
                <th className="py-3 pr-4">Tür</th>
                <th className="py-3 pr-4">Ad Soyad</th>
                <th className="py-3 pr-4">İletişim</th>
                <th className="py-3 pr-4">Şehir / Not</th>
                <th className="py-3 pr-4">Oluşturma</th>
                <th className="py-3 text-right">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1405]">
              {data.map((record) => (
                <tr key={record.id} className="text-zinc-200">
                  <td className="py-3 pr-4 capitalize text-[#f5c76a]">{record.type}</td>
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-white">{record.name}</p>
                    <p className="text-xs text-zinc-500">{record.email || "—"}</p>
                  </td>
                  <td className="py-3 pr-4 text-sm text-zinc-400">{record.phone || "—"}</td>
                  <td className="py-3 pr-4 text-sm text-zinc-400">{record.city || "—"}</td>
                  <td className="py-3 pr-4 text-xs text-zinc-500">{record.created_at ? new Date(record.created_at).toLocaleString("tr-TR") : "—"}</td>
                  <td className="py-3 text-right">
                    <StatusPill status={record.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StatusPill({ status }: { status: "approved" | "rejected" }) {
  const normalized = status === "approved" ? "Onaylı" : "Reddedildi";
  const styles = status === "approved" ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30" : "bg-rose-500/15 text-rose-200 border border-rose-500/30";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>{normalized}</span>;
}

function StatCard({
  title,
  value,
  icon: Icon,
  accent,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: "gold" | "emerald" | "amber" | "rose";
  loading?: boolean;
}) {
  const palette: Record<"gold" | "emerald" | "amber" | "rose", string> = {
    gold: "from-[#fbd483] to-[#f3b94f]",
    emerald: "from-emerald-400/70 to-emerald-500/50",
    amber: "from-amber-300/70 to-amber-500/50",
    rose: "from-rose-400/70 to-rose-500/40",
  };
  return (
    <div className="rounded-3xl border border-[#3a2a0f] bg-[#050302]/80 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-[#b18a39]">
        <Icon className="h-4 w-4 text-[#f5c76a]" />
        {title}
      </div>
      <div className="mt-3 text-4xl font-cinzel text-white">
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-[#f5c76a]" /> : value}
      </div>
      <div className={`mt-3 h-1 w-full rounded-full bg-gradient-to-r ${palette[accent]}`} />
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="text-zinc-400 px-4 py-8">Yükleniyor...</div>}>
      <AdminDashboardInner />
    </Suspense>
  );
}
