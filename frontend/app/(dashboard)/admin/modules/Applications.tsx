"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../../../../lib/socket";
import {
  useAdminPartnerApplications,
  useAdminDriverApplications,
  useApprovePartner,
  useRejectPartner,
  useApproveDriver,
  useRejectDriver,
} from "../../../../hooks/useApplications";
import { Loader2, ShieldCheck, ShieldX, Eye, Search } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";

type ApplicationStatus = "pending" | "approved" | "rejected";
type ApplicationType = "driver" | "partner";

export default function AdminApplications() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"drivers" | "partners">("drivers");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [actioning, setActioning] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  const { data: pendingDrivers = [], isLoading: pendingDriversLoading } = useAdminDriverApplications("pending");
  const { data: approvedDrivers = [], isLoading: approvedDriversLoading } = useAdminDriverApplications("approved");
  const { data: rejectedDrivers = [], isLoading: rejectedDriversLoading } = useAdminDriverApplications("rejected");
  const { data: pendingPartners = [], isLoading: pendingPartnersLoading } = useAdminPartnerApplications("pending");
  const { data: approvedPartners = [], isLoading: approvedPartnersLoading } = useAdminPartnerApplications("approved");
  const { data: rejectedPartners = [], isLoading: rejectedPartnersLoading } = useAdminPartnerApplications("rejected");

  const approvePartner = useApprovePartner();
  const rejectPartner = useRejectPartner();
  const approveDriver = useApproveDriver();
  const rejectDriver = useRejectDriver();

  useEffect(() => {
    const socket = getSocket();
    socket.emit("admin_join");
    const refresh = () => {
      qc.invalidateQueries({ queryKey: ["applications"] });
    };
    socket.on("new_application", refresh);
    socket.on("application_updated", refresh);
    socket.on("application_approved", refresh);
    return () => {
      socket.off("new_application", refresh);
      socket.off("application_updated", refresh);
      socket.off("application_approved", refresh);
    };
  }, [qc]);

  const resolveError = (err: any) =>
    err?.response?.data?.details || err?.response?.data?.error || err?.response?.data?.detail || err?.message || "İşlem tamamlanamadı";

  const handleApprove = async (type: ApplicationType, id: number) => {
    setActioning(`approve-${type}-${id}`);
    try {
      const res = type === "driver" ? await approveDriver.mutateAsync(id) : await approvePartner.mutateAsync(id);
      if (res?.success) {
        toast.success("Şifre kullanıcıya mail olarak gönderildi.");
      } else {
        toast.error(resolveError({ response: { data: res } }));
      }
    } catch (err: any) {
      const msg = err && typeof err === "object" && "response" in err ? resolveError(err) : "Sunucu hatası: mail gönderilemedi";
      toast.error(msg);
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (type: ApplicationType, id: number) => {
    setActioning(`reject-${type}-${id}`);
    try {
      type === "driver" ? await rejectDriver.mutateAsync(id) : await rejectPartner.mutateAsync(id);
      toast.success("Başvuru reddedildi.");
    } catch (err: any) {
      toast.error(resolveError(err));
    } finally {
      setActioning(null);
    }
  };

  const currentList = useMemo(() => {
    if (activeTab === "drivers") {
      if (statusFilter === "pending") return pendingDrivers;
      if (statusFilter === "approved") return approvedDrivers;
      return rejectedDrivers;
    } else {
      if (statusFilter === "pending") return pendingPartners;
      if (statusFilter === "approved") return approvedPartners;
      return rejectedPartners;
    }
  }, [activeTab, statusFilter, pendingDrivers, approvedDrivers, rejectedDrivers, pendingPartners, approvedPartners, rejectedPartners]);

  const isLoading = useMemo(() => {
    if (activeTab === "drivers") {
      if (statusFilter === "pending") return pendingDriversLoading;
      if (statusFilter === "approved") return approvedDriversLoading;
      return rejectedDriversLoading;
    } else {
      if (statusFilter === "pending") return pendingPartnersLoading;
      if (statusFilter === "approved") return approvedPartnersLoading;
      return rejectedPartnersLoading;
    }
  }, [activeTab, statusFilter, pendingDriversLoading, approvedDriversLoading, rejectedDriversLoading, pendingPartnersLoading, approvedPartnersLoading, rejectedPartnersLoading]);

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return currentList;
    const term = searchTerm.toLowerCase();
    return currentList.filter((app: any) => {
      const name = activeTab === "driver" ? app.full_name : app.contact_full_name || app.name;
      const email = activeTab === "driver" ? app.email : app.contact_email;
      const phone = activeTab === "driver" ? app.phone : app.contact_phone;
      return [name, email, phone].some((v) => v?.toLowerCase().includes(term));
    });
  }, [currentList, searchTerm, activeTab]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl text-[#f5d47d] mb-2">Başvuru Yönetimi</h2>
        <p className="text-sm text-zinc-400">Sürücü ve partner başvurularını yönetin</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-2 backdrop-blur-xl">
          <button
            onClick={() => setActiveTab("drivers")}
            className={clsx("px-4 py-2 rounded-xl text-sm font-semibold transition", activeTab === "drivers" ? "bg-[#f5c76a]/90 text-black" : "text-[#b18a39]")}
          >
            Sürücüler
          </button>
          <button
            onClick={() => setActiveTab("partners")}
            className={clsx("px-4 py-2 rounded-xl text-sm font-semibold transition", activeTab === "partners" ? "bg-[#f5c76a]/90 text-black" : "text-[#b18a39]")}
          >
            Partnerler
          </button>
        </div>

        <div className="flex gap-2 rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-2 backdrop-blur-xl">
          {(["pending", "approved", "rejected"] as ApplicationStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={clsx(
                "px-4 py-2 rounded-xl text-sm font-semibold transition capitalize",
                statusFilter === status ? "bg-[#f5c76a]/90 text-black" : "text-[#b18a39]"
              )}
            >
              {status === "pending" ? "Bekleyen" : status === "approved" ? "Onaylı" : "Reddedilen"}
            </button>
          ))}
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c79a3a]" />
          <input
            type="text"
            placeholder="Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-[#3a2a0f] bg-transparent py-2 pl-11 pr-4 text-sm text-white placeholder:text-[#8b7442] focus:border-[#f5c76a] focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-[#3a2a0f] bg-[#050302]/80 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#f5c76a]" />
          </div>
        ) : filteredList.length === 0 ? (
          <p className="text-center py-20 text-zinc-500">Başvuru bulunamadı.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredList.map((app: any) => {
              const type = activeTab === "drivers" ? "driver" : "partner";
              const approveKey = `approve-${type}-${app.id}`;
              const rejectKey = `reject-${type}-${app.id}`;
              const name = activeTab === "drivers" ? app.full_name : app.contact_full_name || app.name;
              const email = activeTab === "drivers" ? app.email : app.contact_email;
              const phone = activeTab === "drivers" ? app.phone : app.contact_phone;
              const meta = activeTab === "drivers" ? app.vehicle_plate || app.city : app.city || app.description;

              return (
                <div key={app.id} className="rounded-2xl border border-[#4a340f]/60 bg-black/40 p-4">
                  <div className="mb-4">
                    <p className="text-lg font-semibold text-white mb-1">{name}</p>
                    <p className="text-sm text-zinc-400">{email}</p>
                    <p className="text-sm text-zinc-500">{phone || "Telefon yok"}</p>
                    {meta && <p className="text-xs text-zinc-600 mt-1">{meta}</p>}
                  </div>
                  {statusFilter === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(type, app.id)}
                        disabled={actioning === approveKey}
                        className={clsx(
                          "flex-1 rounded-xl border border-[#f5c76a]/60 bg-gradient-to-r from-[#fbd483] to-[#f3b94f] py-2 text-sm font-semibold text-black flex items-center justify-center gap-2",
                          actioning === approveKey && "opacity-70"
                        )}
                      >
                        {actioning === approveKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                        Onayla
                      </button>
                      <button
                        onClick={() => handleReject(type, app.id)}
                        disabled={actioning === rejectKey}
                        className={clsx(
                          "flex-1 rounded-xl border border-[#5c1f1f]/70 bg-[#2b0e0e] py-2 text-sm font-semibold text-[#ffb4a2] flex items-center justify-center gap-2",
                          actioning === rejectKey && "opacity-70"
                        )}
                      >
                        {actioning === rejectKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldX className="h-4 w-4" />}
                        Reddet
                      </button>
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="rounded-xl border border-[#3a2a0f] bg-[#1a1305] p-2 text-[#f5c76a] hover:bg-[#2a1c07]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedApp(null)}>
          <div className="rounded-3xl border border-[#3a2a0f] bg-[#050302] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-cinzel text-xl text-[#f5d47d] mb-4">Başvuru Detayları</h3>
            <pre className="text-xs text-zinc-400 whitespace-pre-wrap">{JSON.stringify(selectedApp, null, 2)}</pre>
            <button
              onClick={() => setSelectedApp(null)}
              className="mt-4 w-full rounded-xl bg-[#f5c76a] text-black py-2 font-semibold hover:bg-[#fbd483]"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

