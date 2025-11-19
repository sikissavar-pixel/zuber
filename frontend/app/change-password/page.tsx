"use client";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import api from "../../lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
    }
  }, [user]);

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
      toast.success("Şifreniz güncellendi");
      // Redirect based on role
      const role = user?.role || "guest";
      const map: Record<string, string> = { guest: "/", driver: "/driver", partner: "/partner", admin: "/admin" };
      window.location.href = map[role];
    } catch (e: any) {
      const msg = e?.response?.data?.detail || "Şifre güncelleme başarısız";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="gold-glass rounded-2xl p-8">
          <h1 className="font-[var(--font-display)] text-3xl md:text-4xl text-[var(--gold)] title-glow">Şifre Değiştir</h1>
          <p className="mt-3 text-zinc-200">Güvenlik gereği geçici şifre ile giriş yaptığınız için yeni şifre belirleyin.</p>
          <div className="mt-6 grid gap-4">
            <input className="bg-zinc-900 soft-border rounded px-3 py-2 text-sm" type="password" placeholder="Mevcut şifre" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} />
            <input className="bg-zinc-900 soft-border rounded px-3 py-2 text-sm" type="password" placeholder="Yeni şifre" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} />
            <input className="bg-zinc-900 soft-border rounded px-3 py-2 text-sm" type="password" placeholder="Yeni şifre (tekrar)" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </div>
          <div className="mt-6">
            <Button className="btn-shimmer" onClick={submit} disabled={loading}>{loading ? "Kaydediliyor..." : "Kaydet"}</Button>
          </div>
        </motion.section>
      </main>
    </div>
  );
}