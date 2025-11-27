"use client";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import Navbar from "../../../components/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { getSocket, DriverLocation } from "../../../lib/socket";
import { Table, THead, TBody, TR, TH, TD } from "../../../components/ui/Table";
import { useAdminReservations, useAssignDriver, useDrivers, usePartners } from "../../../hooks/useReservations";
import { useAdminPartnerApplications, useAdminDriverApplications, useApprovePartner, useRejectPartner, useApproveDriver, useRejectDriver } from "../../../hooks/useApplications";
import { useQueryClient } from "@tanstack/react-query";
import { StatusBadge, PaymentBadge } from "../../../components/ui/Badge";
import api from "../../../lib/api";
import { Button } from "../../../components/ui/Button";
import { useSearchParams } from "next/navigation";
import MobileTabBar from "../../../components/mobile/MobileTabBar";
import { motion, AnimatePresence } from "framer-motion";
import MobileAppBridge from "../../../components/mobile/MobileAppBridge";
import ApplicationCard from "../../../components/admin/ApplicationCard";
import dynamic from "next/dynamic";
const AdminZuberMap = dynamic(
  () => import("@/components/maps").then((mod) => mod.ZuberMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] rounded-3xl border border-yellow-800/30 bg-black/40 flex items-center justify-center text-sm text-zinc-400">
        Harita yükleniyor...
      </div>
    ),
  }
);

import ProtectedRoute from "../../../components/ProtectedRoute";

function AdminDashboardInner() {
  const [authorized, setAuthorized] = useState(false);
  useEffect(() => {
    try {
      const flag = typeof window !== "undefined" ? localStorage.getItem("zuber_admin") : null;
      setAuthorized(flag === "true");
    } catch {}
  }, []);

  // Zuber Control Room görünürlüğü: sadece yetkili kullanıcılar
  if (!authorized) {
    return null; // veya minimal bir footer gösterilebilir
  }

  // Hook sayısı her render'da sabit kalsın diye içerik ayrı bir component'te
  return <AdminDashboardContent />;
}

function AdminDashboardContent() {
  const [locations, setLocations] = useState<Record<string, DriverLocation>>({});
  const [tempModal, setTempModal] = useState<{ open: boolean; password: string | null }>({ open: false, password: null });
  const { data: reservations } = useAdminReservations();
  const assign = useAssignDriver();
  const { data: drivers = [] } = useDrivers();
  const { data: partners = [] } = usePartners();
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") || "reservations") as "reservations" | "partners" | "drivers" | "reports" | "applications";
  const { data: partnerApps = [] } = useAdminPartnerApplications();
  const { data: driverApps = [] } = useAdminDriverApplications();
  const approvePartner = useApprovePartner();
  const rejectPartner = useRejectPartner();
  const approveDriver = useApproveDriver();
  const rejectDriver = useRejectDriver();

  // Delete reservation (admin)
  const handleDeleteReservation = async (id: number) => {
    if (!confirm(`Bu rezervasyon silinecek (#${id}). Emin misiniz?`)) return;
    try {
      await api.delete(`/api/admin/reservations/${id}`);
      await qc.invalidateQueries({ queryKey: ["reservations", "admin"] });
    } catch (e: any) {
      alert("Silme işlemi başarısız: " + (e?.response?.data?.detail || e?.message || "Hata"));
    }
  };

  // Simple sorting for reservations
  const [sortKey, setSortKey] = useState<"pickup_time" | "status" | "payment_status" | "id">("pickup_time");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const sortedReservations = useMemo(() => {
    const list = [...(reservations || [])];
    return list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av = sortKey === "pickup_time" ? new Date(a.pickup_time).getTime() : (a as any)[sortKey];
      const bv = sortKey === "pickup_time" ? new Date(b.pickup_time).getTime() : (b as any)[sortKey];
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }, [reservations, sortKey, sortDir]);

  // Partner onayını PATCH ile yap, temp şifreyi modalda göster ve cache'i tazele
  const approvePartnerPatch = async (app: any) => {
    try {
      const { data } = await api.patch(`/api/applications/partners/${app.id}/approve`);
      const temp = data?.temporary_password || data?.temp_password || "";
      setTempModal({ open: true, password: temp });
      await qc.invalidateQueries({ queryKey: ["applications", "partners"] });
      await qc.invalidateQueries({ queryKey: ["partners"] });
    } catch (err: any) {
      const msg = err?.response?.data?.detail ? String(err.response.data.detail) : "Onay işlemi başarısız. Backend bağlantısını kontrol et.";
      alert(`❌ ${msg}`);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    const locHandler = (loc: DriverLocation) => {
      const driverId = String(loc.driverId ?? loc.driver_id ?? "");
      if (!driverId) return;
      const normalized = {
        driverId,
        lat: loc.lat ?? loc.latitude ?? 0,
        lng: loc.lng ?? loc.longitude ?? 0,
        updatedAt: loc.updatedAt ?? loc.updated_at ?? new Date().toISOString(),
      };
      setLocations((prev) => ({ ...prev, [driverId]: normalized }));
    };
    socket.emit("admin_join");
    socket.on("driver_location_update", locHandler);
    socket.on("reservation_created", () => qc.invalidateQueries({ queryKey: ["reservations", "admin"] }));
    socket.on("reservation_updated", () => qc.invalidateQueries({ queryKey: ["reservations", "admin"] }));
    socket.on("reservation_assigned", () => qc.invalidateQueries({ queryKey: ["reservations", "admin"] }));
    socket.on("admin_update", (data: any) => {
      const t = data?.table;
      if (t === "reservations") qc.invalidateQueries({ queryKey: ["reservations", "admin"] });
      if (t === "partners") qc.invalidateQueries({ queryKey: ["partners"] });
      if (t === "drivers") {
        qc.invalidateQueries({ queryKey: ["drivers"] });
        qc.invalidateQueries({ queryKey: ["reservations", "admin"] });
      }
    });
    socket.on("new_application", (data: any) => {
      if (data?.type === "partner") {
        qc.invalidateQueries({ queryKey: ["applications", "partners"] });
      } else if (data?.type === "driver") {
        qc.invalidateQueries({ queryKey: ["applications", "drivers"] });
      }
    });
    socket.on("application_updated", () => {
      qc.invalidateQueries({ queryKey: ["applications", "partners"] });
      qc.invalidateQueries({ queryKey: ["applications", "drivers"] });
    });
    socket.on("application_approved", () => {
      qc.invalidateQueries({ queryKey: ["applications", "partners"] });
      qc.invalidateQueries({ queryKey: ["applications", "drivers"] });
      qc.invalidateQueries({ queryKey: ["partners"] });
      qc.invalidateQueries({ queryKey: ["drivers"] });
    });
    socket.on("partners_updated", () => qc.invalidateQueries({ queryKey: ["partners"] }));
    socket.on("drivers_updated", () => qc.invalidateQueries({ queryKey: ["drivers"] }));
    socket.on("admin_reset", () => {
      qc.invalidateQueries({ queryKey: ["partners"] });
      qc.invalidateQueries({ queryKey: ["drivers"] });
      qc.invalidateQueries({ queryKey: ["applications", "partners"] });
      qc.invalidateQueries({ queryKey: ["applications", "drivers"] });
    });
    return () => {
      socket.off("driver_location_update", locHandler);
      socket.off("reservation_created");
      socket.off("reservation_updated");
      socket.off("reservation_assigned");
      socket.off("admin_update");
      socket.off("new_application");
      socket.off("application_updated");
      socket.off("application_approved");
      socket.off("partners_updated");
      socket.off("drivers_updated");
      socket.off("admin_reset");
    };
  }, []);

  const driverMarkers = useMemo(() => {
    const makeId = () => {
      if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
      }
      return `driver-${Math.random().toString(36).slice(2, 9)}`;
    };
    return Object.values(locations).map((loc) => ({
      id: loc.driverId ?? loc.driver_id ?? makeId(),
      lat: Number(loc.lat ?? loc.latitude ?? 0),
      lng: Number(loc.lng ?? loc.longitude ?? 0),
      heading: loc.heading ?? null,
      status: "Çevrimiçi sürücü",
    }));
  }, [locations]);

  // Sürücü ve partnerler artık React Query ile çekiliyor; periyodik refetch ve cache sağlandı

  // Raporlar için basit metrikler
  const total = (reservations || []).length;
  const completed = (reservations || []).filter((r) => r.status === "completed").length;
  const cancelled = (reservations || []).filter((r) => r.status === "cancelled").length;
  const assigned = (reservations || []).filter((r) => r.status === "assigned").length;
  const unpaid = (reservations || []).filter((r) => r.payment_status === "unpaid").length;
  const paid = (reservations || []).filter((r) => r.payment_status === "paid").length;

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Navbar />
      <MobileAppBridge />
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8 bg-black min-h-screen text-gray-200 font-inter">
        <h1 className="font-[var(--font-display)] text-3xl md:text-4xl text-[var(--gold)] title-glow">Zuber Control Room</h1>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-yellow-800/30 pb-2">
          {[
            { key: "reservations", label: "🗓️ Rezervasyonlar" },
            { key: "partners", label: "🏨 Partnerler" },
            { key: "drivers", label: "🚘 Sürücüler" },
            { key: "applications", label: "📨 Başvurular" },
            { key: "reports", label: "📊 Raporlar" },
          ].map((t) => (
            <a
              key={t.key}
              href={`/admin?tab=${t.key}`}
              className={`text-sm px-3 py-2 rounded-2xl ${tab === (t.key as any) ? "bg-yellow-900/20 text-yellow-400" : "text-zinc-400 hover:text-yellow-300"}`}
            >
              {t.label}
            </a>
          ))}
        </div>

        {/* Rezervasyonlar */}
        {tab === "reservations" && (
          <motion.div initial={{ opacity: 0, y: 8, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.35 }}>
          <Card className="bg-black/40 backdrop-blur-lg border border-yellow-800/30 rounded-2xl">
            <CardHeader>
              <CardTitle className="font-cinzel text-yellow-400">Rezervasyonlar</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="w-full bg-black/70 border border-yellow-500/30 rounded-xl shadow-[0_0_25px_#facc15]/20">
                <THead className="bg-yellow-500/10 text-yellow-400 uppercase text-sm">
                  <TR>
                    <TH className="p-3">#</TH>
                    <TH className="p-3">Misafir</TH>
                    <TH className="p-3">Rota</TH>
                    <TH className="p-3 cursor-pointer" onClick={() => { setSortKey("pickup_time"); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}>Alış Zamanı</TH>
                    <TH className="p-3 cursor-pointer" onClick={() => { setSortKey("status"); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}>Durum</TH>
                    <TH className="p-3 cursor-pointer" onClick={() => { setSortKey("payment_status"); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}>Ödeme</TH>
                    <TH className="p-3">Şoför</TH>
                    <TH className="p-3">Aksiyon</TH>
                  </TR>
                </THead>
                <TBody>
                  {sortedReservations.map((r, i) => (
                    <TR key={r.id} className="hover:bg-yellow-500/10 transition-all duration-300">
                      <TD className="p-3 text-yellow-300">#{i + 1}</TD>
                      <TD className="p-3">{r.guest_name || r.guest_id || "-"}</TD>
                      <TD className="p-3">{r.pickup_location} → {r.dropoff_location}</TD>
                      <TD className="p-3">{new Date(r.pickup_time).toLocaleString()}</TD>
                      <TD className="p-3"><StatusBadge status={r.status} /></TD>
                      <TD className="p-3">
                        <div className="flex items-center gap-2">
                          <PaymentBadge payment_status={r.payment_status as any} />
                          <span className="text-xs text-zinc-400">{r.total_amount ? Number(r.total_amount).toFixed(2) : "0.00"}</span>
                        </div>
                      </TD>
                      <TD className="p-3">{r.driver_id || "-"}</TD>
                      <TD className="p-3">
                        <div className="flex gap-2 items-center">
                          <select className="bg-zinc-900 soft-border rounded px-2 py-1" defaultValue={r.driver_id || ""} onChange={(e) => assign.mutate({ id: r.id, driver_id: Number(e.target.value) })}>
                            <option value="">Otomatik</option>
                            {drivers.map((d) => (
                              <option key={d.id} value={d.id}>{d.full_name}</option>
                            ))}
                          </select>
                          <Button variant="secondary" onClick={() => assign.mutate({ id: r.id })}>Ata</Button>
                          <button onClick={() => handleDeleteReservation(r.id)} className="bg-red-700/50 text-yellow-200 px-3 py-1 rounded-md hover:bg-red-600/70 transition-all duration-200">Sil</button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </CardContent>
          </Card>
          </motion.div>
        )}

        {/* Başvurular: Partner + Sürücü */}
        {tab === "applications" && (
          <motion.div initial={{ opacity: 0, y: 8, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.35 }} className="space-y-4">
             <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="font-cinzel text-2xl text-yellow-400">Bekleyen Başvurular</h2>
                <div className="text-sm text-zinc-400 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
                   Toplam: {partnerApps.length + driverApps.length}
                </div>
             </div>
             
             {partnerApps.length === 0 && driverApps.length === 0 && (
                <div className="text-center py-16 text-zinc-500 bg-zinc-900/20 rounded-xl border border-zinc-800 border-dashed backdrop-blur-sm">
                   Bekleyen başvuru bulunmamaktadır.
                </div>
             )}

             <div className="grid gap-1">
                {partnerApps.map((p: any) => (
                   <ApplicationCard 
                      key={`partner-${p.id}`} 
                      data={p} 
                      type="partner" 
                      isApplication={true}
                      onApprove={async (id) => {
                          try {
                              const res: any = await approvePartner.mutateAsync(id);
                              if (res?.temporary_password) {
                                  setTempModal({ open: true, password: res.temporary_password });
                              }
                          } catch (e) {}
                      }}
                      onReject={(id) => rejectPartner.mutate(id)}
                   />
                ))}
                {driverApps.map((d: any) => (
                   <ApplicationCard 
                      key={`driver-${d.id}`} 
                      data={d} 
                      type="driver" 
                      isApplication={true}
                      onApprove={async (id) => {
                          try {
                              const res: any = await approveDriver.mutateAsync(id);
                              if (res?.temporary_password) {
                                  setTempModal({ open: true, password: res.temporary_password });
                              }
                          } catch (e) {}
                      }}
                      onReject={(id) => rejectDriver.mutate(id)}
                   />
                ))}
             </div>
          </motion.div>
        )}

        

        {/* Partnerler */}
        {tab === "partners" && (
          <motion.div initial={{ opacity: 0, y: 8, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.35 }} className="space-y-4">
             <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="font-cinzel text-2xl text-yellow-400">Aktif Partnerler</h2>
                <div className="text-sm text-zinc-400 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
                   Toplam: {partners.length}
                </div>
             </div>

             {partners.length === 0 && (
                <div className="text-center py-16 text-zinc-500 bg-zinc-900/20 rounded-xl border border-zinc-800 border-dashed backdrop-blur-sm">
                   Aktif partner bulunmamaktadır.
                </div>
             )}

             <div className="grid gap-1">
                {partners.map((p: any) => (
                   <ApplicationCard 
                      key={`active-partner-${p.id}`} 
                      data={p} 
                      type="partner" 
                      isApplication={false}
                      onDelete={async (id) => {
                          if (!confirm(`Bu partner silinecek: ${p.name}. Emin misiniz?`)) return;
                          try {
                              await api.delete(`/api/partners/${id}`);
                              await qc.invalidateQueries({ queryKey: ["partners"] });
                          } catch (e: any) {
                              alert("Silme işlemi başarısız: " + (e?.response?.data?.detail || e?.message || "Hata"));
                          }
                      }}
                   />
                ))}
             </div>
          </motion.div>
        )}

        {/* Sürücüler */}
        {tab === "drivers" && (
          <motion.div className="space-y-6" initial={{ opacity: 0, y: 8, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.35 }}>
            <Card className="bg-black/40 backdrop-blur-lg border border-yellow-800/30 rounded-2xl">
              <CardHeader>
                <CardTitle className="font-cinzel text-yellow-400">Canlı Sürücü Haritası</CardTitle>
              </CardHeader>
              <CardContent>
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                  <AdminZuberMap drivers={driverMarkers} height={500} />
                ) : (
                  <p className="text-sm text-zinc-400">Google Maps API anahtarı eksik veya geçersiz.</p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
               <div className="flex items-center justify-between mb-4 px-2">
                  <h2 className="font-cinzel text-2xl text-yellow-400">Aktif Sürücüler</h2>
                  <div className="text-sm text-zinc-400 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
                     Toplam: {drivers.length}
                  </div>
               </div>

               <div className="grid gap-1">
                  {drivers.map((d: any) => (
                     <ApplicationCard 
                        key={`active-driver-${d.id}`} 
                        data={d} 
                        type="driver" 
                        isApplication={false}
                        onDelete={async (id) => {
                            if (!confirm(`Bu sürücü silinecek: ${d.full_name}. Emin misiniz?`)) return;
                            try {
                                await api.delete(`/api/admin/drivers/${id}`);
                                await qc.invalidateQueries({ queryKey: ["drivers"] });
                                await qc.invalidateQueries({ queryKey: ["reservations", "admin"] });
                            } catch (e: any) {
                                alert("Silme işlemi başarısız: " + (e?.response?.data?.detail || e?.message || "Hata"));
                            }
                        }}
                     />
                  ))}
               </div>
            </div>
          </motion.div>
        )}

        {/* Raporlar */}
        {tab === "reports" && (
          <Card className="bg-black/40 backdrop-blur-lg border border-yellow-800/30 rounded-2xl">
            <CardHeader>
              <CardTitle className="font-cinzel text-yellow-400">Finansal ve Operasyonel Özet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card gold-glass p-6 rounded-2xl">
                  <div className="text-zinc-400 text-sm">Toplam Rezervasyon</div>
                  <div className="text-3xl text-yellow-400 font-cinzel">{total}</div>
                </div>
                <div className="card gold-glass p-6 rounded-2xl">
                  <div className="text-zinc-400 text-sm">Atanmış</div>
                  <div className="text-3xl text-yellow-400 font-cinzel">{assigned}</div>
                </div>
                <div className="card gold-glass p-6 rounded-2xl">
                  <div className="text-zinc-400 text-sm">Tamamlanan</div>
                  <div className="text-3xl text-yellow-400 font-cinzel">{completed}</div>
                </div>
                <div className="card gold-glass p-6 rounded-2xl">
                  <div className="text-zinc-400 text-sm">İptal</div>
                  <div className="text-3xl text-yellow-400 font-cinzel">{cancelled}</div>
                </div>
                <div className="card gold-glass p-6 rounded-2xl">
                  <div className="text-zinc-400 text-sm">Ödenen</div>
                  <div className="text-3xl text-yellow-400 font-cinzel">{paid}</div>
                </div>
                <div className="card gold-glass p-6 rounded-2xl">
                  <div className="text-zinc-400 text-sm">Bekleyen Ödeme</div>
                  <div className="text-3xl text-yellow-400 font-cinzel">{unpaid}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      {/* Temp password modal */}
      <AnimatePresence>
        {tempModal.open && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.25 }} className="gold-glass rounded-2xl p-6 max-w-md w-full">
              <h3 className="font-cinzel text-xl text-[var(--gold)]">Partner onaylandı</h3>
              <p className="mt-2 text-sm text-zinc-200">Geçici şifre aşağıdadır. Güvenlik gereği yalnızca bu anda görüntülenir.</p>
              <div className="mt-4 px-3 py-2 rounded soft-border bg-black/40 text-yellow-300 font-mono tracking-wider select-all">{tempModal.password}</div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setTempModal({ open: false, password: null })}>Kapat</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <MobileTabBar />
    </ProtectedRoute>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="text-zinc-300 px-4 py-8">Yükleniyor...</div>}>
      <AdminDashboardInner />
    </Suspense>
  );
}