"use client";
import React, { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function DriverSecurityPage() {
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!form.current_password || !form.new_password) { toast.error("Lütfen tüm alanları doldurun"); return; }
    if (form.new_password !== form.confirm) { toast.error("Yeni şifreler uyuşmuyor"); return; }
    setLoading(true);
    try {
      await api.post("/api/users/change-password", { current_password: form.current_password, new_password: form.new_password });
      toast.success("✅ Şifreniz başarıyla değiştirildi.");
      setForm({ current_password: "", new_password: "", confirm: "" });
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Şifre güncelleme başarısız");
    } finally { setLoading(false); }
  };
  return (
    <div className="max-w-lg rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm p-6 hover:shadow-[0_0_20px_#facc15]/20 transition-all duration-300">
      <div className="text-xl mb-4">Şifre & Güvenlik</div>
      <div className="space-y-3">
        <input value={form.current_password} onChange={(e)=>setForm(p=>({ ...p, current_password: e.target.value }))} placeholder="Mevcut Şifre" type="password" className="w-full px-3 py-2 rounded-xl bg-black/50 border border-yellow-500/30 text-yellow-400" />
        <input value={form.new_password} onChange={(e)=>setForm(p=>({ ...p, new_password: e.target.value }))} placeholder="Yeni Şifre" type="password" className="w-full px-3 py-2 rounded-xl bg-black/50 border border-yellow-500/30 text-yellow-400" />
        <input value={form.confirm} onChange={(e)=>setForm(p=>({ ...p, confirm: e.target.value }))} placeholder="Yeni Şifre (Tekrar)" type="password" className="w-full px-3 py-2 rounded-xl bg-black/50 border border-yellow-500/30 text-yellow-400" />
      </div>
      <button disabled={loading} onClick={submit} className="mt-4 w-full px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:scale-[1.02] hover:shadow-[0_0_20px_#facc15]/20 transition-all duration-300">Güncelle</button>
    </div>
  );
}