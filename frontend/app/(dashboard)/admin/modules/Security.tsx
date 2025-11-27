"use client";

import React, { useMemo, useState } from "react";
import { useSecurityLoginAttempts, useSecuritySessions, useSecurityBlockedIPs } from "../../../../hooks/useAdmin";
import { Loader2, Search, Shield, AlertTriangle, Ban, Clock, MapPin, User, CheckCircle, XCircle } from "lucide-react";
import clsx from "clsx";

export default function AdminSecurity() {
  const { data: loginAttempts = [], isLoading: attemptsLoading } = useSecurityLoginAttempts();
  const { data: sessions = {}, isLoading: sessionsLoading } = useSecuritySessions();
  const { data: blockedIPs = [], isLoading: blockedLoading } = useSecurityBlockedIPs();
  const [activeTab, setActiveTab] = useState<"attempts" | "sessions" | "blocked">("attempts");
  const [searchTerm, setSearchTerm] = useState("");

  const safeLoginAttempts = Array.isArray(loginAttempts) ? loginAttempts : [];
  const safeSessions = Array.isArray(sessions?.items) ? sessions.items : [];
  const safeBlockedIPs = Array.isArray(blockedIPs) ? blockedIPs : [];

  const currentData = activeTab === "attempts" ? safeLoginAttempts : activeTab === "sessions" ? safeSessions : safeBlockedIPs;
  const isLoading = activeTab === "attempts" ? attemptsLoading : activeTab === "sessions" ? sessionsLoading : blockedLoading;

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return currentData;
    const term = searchTerm.toLowerCase();
    return (Array.isArray(currentData) ? currentData : []).filter((item: any) => {
      return [item.ip, item.email, item.user_id?.toString(), item.device, item.user_agent].some((v) => v?.toLowerCase().includes(term));
    });
  }, [currentData, searchTerm]);

  const failedAttempts = useMemo(() => safeLoginAttempts.filter((a: any) => a.success === false).length, [safeLoginAttempts]);
  const activeSessions = useMemo(() => (sessions?.active || safeSessions.filter((s: any) => s.active !== false).length), [sessions, safeSessions]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl text-[#f5d47d] mb-2">Güvenlik Paneli</h2>
        <p className="text-sm text-zinc-400">Giriş denemeleri, oturumlar ve engellenen IP'ler</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            Başarısız Giriş
          </div>
          <div className="text-2xl font-cinzel text-white">{failedAttempts}</div>
        </div>
        <div className="rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <Clock className="h-4 w-4 text-emerald-400" />
            Aktif Oturum
          </div>
          <div className="text-2xl font-cinzel text-white">{activeSessions}</div>
        </div>
        <div className="rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <Ban className="h-4 w-4 text-amber-400" />
            Engellenen IP
          </div>
          <div className="text-2xl font-cinzel text-white">{blockedIPs.length}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-2 backdrop-blur-xl">
          <button
            onClick={() => setActiveTab("attempts")}
            className={clsx("px-4 py-2 rounded-xl text-sm font-semibold transition", activeTab === "attempts" ? "bg-[#f5c76a]/90 text-black" : "text-[#b18a39]")}
          >
            Giriş Denemeleri
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={clsx("px-4 py-2 rounded-xl text-sm font-semibold transition", activeTab === "sessions" ? "bg-[#f5c76a]/90 text-black" : "text-[#b18a39]")}
          >
            Oturumlar
          </button>
          <button
            onClick={() => setActiveTab("blocked")}
            className={clsx("px-4 py-2 rounded-xl text-sm font-semibold transition", activeTab === "blocked" ? "bg-[#f5c76a]/90 text-black" : "text-[#b18a39]")}
          >
            Engellenen IP'ler
          </button>
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
        ) : filteredData.length === 0 ? (
          <p className="text-center py-20 text-zinc-500">Kayıt bulunamadı.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#2b1d07] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.4em] text-[#8c6a29]">
                  {activeTab === "attempts" && (
                    <>
                      <th className="py-3 pr-4">Tarih</th>
                      <th className="py-3 pr-4">E-posta</th>
                      <th className="py-3 pr-4">IP</th>
                      <th className="py-3 pr-4">Cihaz</th>
                      <th className="py-3 text-right">Durum</th>
                    </>
                  )}
                  {activeTab === "sessions" && (
                    <>
                      <th className="py-3 pr-4">Kullanıcı</th>
                      <th className="py-3 pr-4">IP</th>
                      <th className="py-3 pr-4">Cihaz</th>
                      <th className="py-3 pr-4">Başlangıç</th>
                      <th className="py-3 text-right">Durum</th>
                    </>
                  )}
                  {activeTab === "blocked" && (
                    <>
                      <th className="py-3 pr-4">IP Adresi</th>
                      <th className="py-3 pr-4">Sebep</th>
                      <th className="py-3 pr-4">Engelleme Tarihi</th>
                      <th className="py-3 text-right">İşlem</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1405]">
                {filteredData.map((item: any, idx: number) => (
                  <tr key={item.id || idx} className="text-zinc-200">
                    {activeTab === "attempts" && (
                      <>
                        <td className="py-3 pr-4 text-zinc-400 text-xs">{item.timestamp ? new Date(item.timestamp).toLocaleString("tr-TR") : "—"}</td>
                        <td className="py-3 pr-4 text-white">{item.email || "—"}</td>
                        <td className="py-3 pr-4 text-zinc-400">{item.ip || "—"}</td>
                        <td className="py-3 pr-4 text-zinc-500 text-xs">{item.device || item.user_agent || "—"}</td>
                        <td className="py-3 text-right">
                          {item.success ? (
                            <CheckCircle className="h-5 w-5 text-emerald-400 inline" />
                          ) : (
                            <XCircle className="h-5 w-5 text-rose-400 inline" />
                          )}
                        </td>
                      </>
                    )}
                    {activeTab === "sessions" && (
                      <>
                        <td className="py-3 pr-4 text-white">{item.user_email || `Kullanıcı #${item.user_id}` || "—"}</td>
                        <td className="py-3 pr-4 text-zinc-400">{item.ip || "—"}</td>
                        <td className="py-3 pr-4 text-zinc-500 text-xs">{item.device || item.user_agent || "—"}</td>
                        <td className="py-3 pr-4 text-zinc-400 text-xs">{item.created_at ? new Date(item.created_at).toLocaleString("tr-TR") : "—"}</td>
                        <td className="py-3 text-right">
                          <span className={clsx("inline-flex rounded-full px-3 py-1 text-xs font-semibold border", item.active !== false ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/30" : "bg-zinc-500/15 text-zinc-200 border-zinc-500/30")}>
                            {item.active !== false ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                      </>
                    )}
                    {activeTab === "blocked" && (
                      <>
                        <td className="py-3 pr-4 text-white font-mono">{item.ip || "—"}</td>
                        <td className="py-3 pr-4 text-zinc-400">{item.reason || "—"}</td>
                        <td className="py-3 pr-4 text-zinc-400 text-xs">{item.blocked_at ? new Date(item.blocked_at).toLocaleString("tr-TR") : "—"}</td>
                        <td className="py-3 text-right">
                          <button className="rounded-lg border border-[#3a2a0f] bg-[#1a1305] px-3 py-1.5 text-xs text-[#f5c76a] hover:bg-[#2a1c07]">
                            Kaldır
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

