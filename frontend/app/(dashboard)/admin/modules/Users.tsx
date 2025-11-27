"use client";

import React, { useMemo, useState } from "react";
import { useAllUsers, useActivateUser, useDeactivateUser, useForceLogout, useResetPassword } from "../../../../hooks/useAdmin";
import { Loader2, Search, Power, PowerOff, LogOut, Key, Users as UsersIcon, Shield, Building2, Car, User } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";

type UserRole = "admin" | "driver" | "partner" | "customer" | "all";

export default function AdminUsers() {
  const { data: users = [], isLoading } = useAllUsers();
  const [roleFilter, setRoleFilter] = useState<UserRole>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [actioning, setActioning] = useState<string | null>(null);

  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const forceLogout = useForceLogout();
  const resetPassword = useResetPassword();

  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (roleFilter !== "all") {
      filtered = filtered.filter((u: any) => u.role === roleFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((u: any) => {
        return [u.full_name, u.email, u.contact_phone].some((v) => v?.toLowerCase().includes(term));
      });
    }
    return filtered;
  }, [users, roleFilter, searchTerm]);

  const handleActivate = async (id: number) => {
    setActioning(`activate-${id}`);
    try {
      await activateUser.mutateAsync(id);
      toast.success("Kullanıcı aktif edildi.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "İşlem başarısız.");
    } finally {
      setActioning(null);
    }
  };

  const handleDeactivate = async (id: number) => {
    setActioning(`deactivate-${id}`);
    try {
      await deactivateUser.mutateAsync(id);
      toast.success("Kullanıcı deaktif edildi.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "İşlem başarısız.");
    } finally {
      setActioning(null);
    }
  };

  const handleForceLogout = async (id: number) => {
    setActioning(`logout-${id}`);
    try {
      await forceLogout.mutateAsync(id);
      toast.success("Kullanıcı oturumu kapatıldı.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "İşlem başarısız.");
    } finally {
      setActioning(null);
    }
  };

  const handleResetPassword = async (id: number) => {
    setActioning(`reset-${id}`);
    try {
      await resetPassword.mutateAsync(id);
      toast.success("Şifre sıfırlandı. Yeni şifre kullanıcıya mail olarak gönderildi.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "İşlem başarısız.");
    } finally {
      setActioning(null);
    }
  };

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((u: any) => {
      counts[u.role || "customer"] = (counts[u.role || "customer"] || 0) + 1;
    });
    return counts;
  }, [users]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl text-[#f5d47d] mb-2">Kullanıcı Yönetimi</h2>
        <p className="text-sm text-zinc-400">Tüm kullanıcıları görüntüleyin ve yönetin</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <Shield className="h-4 w-4 text-[#f5c76a]" />
            Admin
          </div>
          <div className="text-2xl font-cinzel text-white">{roleCounts.admin || 0}</div>
        </div>
        <div className="rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <Car className="h-4 w-4 text-[#f5c76a]" />
            Sürücü
          </div>
          <div className="text-2xl font-cinzel text-white">{roleCounts.driver || 0}</div>
        </div>
        <div className="rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <Building2 className="h-4 w-4 text-[#f5c76a]" />
            Partner
          </div>
          <div className="text-2xl font-cinzel text-white">{roleCounts.partner || 0}</div>
        </div>
        <div className="rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <User className="h-4 w-4 text-[#f5c76a]" />
            Müşteri
          </div>
          <div className="text-2xl font-cinzel text-white">{roleCounts.customer || 0}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 rounded-2xl border border-[#3a2a0f] bg-[#050302]/80 p-2 backdrop-blur-xl">
          {(["all", "admin", "driver", "partner", "customer"] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={clsx(
                "px-4 py-2 rounded-xl text-sm font-semibold transition capitalize",
                roleFilter === role ? "bg-[#f5c76a]/90 text-black" : "text-[#b18a39]"
              )}
            >
              {role === "all" ? "Tümü" : role === "admin" ? "Admin" : role === "driver" ? "Sürücü" : role === "partner" ? "Partner" : "Müşteri"}
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
        ) : filteredUsers.length === 0 ? (
          <p className="text-center py-20 text-zinc-500">Kullanıcı bulunamadı.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#2b1d07] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.4em] text-[#8c6a29]">
                  <th className="py-3 pr-4">Rol</th>
                  <th className="py-3 pr-4">Ad Soyad</th>
                  <th className="py-3 pr-4">E-posta</th>
                  <th className="py-3 pr-4">Telefon</th>
                  <th className="py-3 pr-4">Durum</th>
                  <th className="py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1405]">
                {filteredUsers.map((user: any) => {
                  const isActive = user.is_active !== false;
                  return (
                    <tr key={user.id} className="text-zinc-200">
                      <td className="py-3 pr-4 capitalize text-[#f5c76a]">{user.role || "customer"}</td>
                      <td className="py-3 pr-4 font-semibold text-white">{user.full_name || "—"}</td>
                      <td className="py-3 pr-4 text-zinc-400">{user.email || "—"}</td>
                      <td className="py-3 pr-4 text-zinc-400">{user.contact_phone || "—"}</td>
                      <td className="py-3 pr-4">
                        <span className={clsx("inline-flex rounded-full px-3 py-1 text-xs font-semibold", isActive ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30" : "bg-rose-500/15 text-rose-200 border border-rose-500/30")}>
                          {isActive ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isActive ? (
                            <button
                              onClick={() => handleDeactivate(user.id)}
                              disabled={actioning === `deactivate-${user.id}`}
                              className="rounded-lg border border-[#5c1f1f]/70 bg-[#2b0e0e] p-2 text-[#ffb4a2] hover:bg-[#3b1e1e] disabled:opacity-50"
                              title="Deaktif Et"
                            >
                              {actioning === `deactivate-${user.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <PowerOff className="h-4 w-4" />}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user.id)}
                              disabled={actioning === `activate-${user.id}`}
                              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-50"
                              title="Aktif Et"
                            >
                              {actioning === `activate-${user.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
                            </button>
                          )}
                          <button
                            onClick={() => handleForceLogout(user.id)}
                            disabled={actioning === `logout-${user.id}`}
                            className="rounded-lg border border-[#3a2a0f] bg-[#1a1305] p-2 text-[#f5c76a] hover:bg-[#2a1c07] disabled:opacity-50"
                            title="Oturumu Kapat"
                          >
                            {actioning === `logout-${user.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleResetPassword(user.id)}
                            disabled={actioning === `reset-${user.id}`}
                            className="rounded-lg border border-[#3a2a0f] bg-[#1a1305] p-2 text-[#f5c76a] hover:bg-[#2a1c07] disabled:opacity-50"
                            title="Şifre Sıfırla"
                          >
                            {actioning === `reset-${user.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

