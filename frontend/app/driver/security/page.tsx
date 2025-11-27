"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { GlassCard } from "@/components/driver/ui";

export default function DriverSecurityPage() {
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.current_password || !form.new_password) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }
    if (form.new_password !== form.confirm) {
      toast.error("Yeni şifreler uyuşmuyor");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/users/change-password", { current_password: form.current_password, new_password: form.new_password });
      toast.success("Şifreniz başarıyla değiştirildi.");
      setForm({ current_password: "", new_password: "", confirm: "" });
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Şifre güncelleme başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard variant="default" className="max-w-lg p-6 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-[#ffcc33]">Güvenlik</p>
        <h1 className="font-cinzel text-2xl text-white">Şifre & koruma</h1>
      </div>
      <div className="space-y-3">
        <input
          value={form.current_password}
          onChange={(event) => setForm((prev) => ({ ...prev, current_password: event.target.value }))}
          placeholder="Mevcut şifre"
          type="password"
          className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-[#ffcc33]/20 text-white focus:border-[#ffcc33]/50"
        />
        <input
          value={form.new_password}
          onChange={(event) => setForm((prev) => ({ ...prev, new_password: event.target.value }))}
          placeholder="Yeni şifre"
          type="password"
          className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-[#ffcc33]/20 text-white focus:border-[#ffcc33]/50"
        />
        <input
          value={form.confirm}
          onChange={(event) => setForm((prev) => ({ ...prev, confirm: event.target.value }))}
          placeholder="Yeni şifre (tekrar)"
          type="password"
          className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-[#ffcc33]/20 text-white focus:border-[#ffcc33]/50"
        />
      </div>
      <button
        disabled={loading}
        onClick={submit}
        className="mt-2 w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffb400] to-[#ffcc33] text-black font-semibold disabled:opacity-60"
      >
        Güncelle
      </button>
    </GlassCard>
  );
}