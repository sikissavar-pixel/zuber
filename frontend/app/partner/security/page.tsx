"use client";
import React, { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function PartnerSecurityPage() {
  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <Inner />
    </ProtectedRoute>
  );
}

function Inner() {
  const router = useRouter();
  const { logout } = useAuth();
  const [current_password, setCurrent] = useState("");
  const [new_password, setNew] = useState("");
  const [confirm_password, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (new_password !== confirm_password) {
      setError("Mevcut şifre hatalı veya uyuşmuyor.");
      toast.error("Yeni şifreler uyuşmuyor");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/partners/change-password", { current_password, new_password });
      toast.success("Şifren başarıyla değiştirildi.");
      setTimeout(() => {
        try { logout(); } catch {}
        router.push("/login");
      }, 3000);
    } catch (e: any) {
      setError("Mevcut şifre hatalı veya uyuşmuyor.");
      toast.error(e?.response?.data?.detail || "Şifre değiştirme sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-yellow-400 mb-2">Şifre & Güvenlik Ayarları</h1>
      <p className="text-sm text-zinc-300 mb-4">Tek kullanımlık şifreyle giriş yaptıysanız lütfen yeni şifre oluşturun.</p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="p-6 rounded-2xl border border-yellow-400/20 bg-neutral-950/70 backdrop-blur-md shadow-[0_0_30px_rgba(234,179,8,0.25)] max-w-xl space-y-4"
      >
        <Input label="Mevcut Şifre" type="password" value={current_password} onChange={setCurrent} placeholder="Mevcut şifreniz" />
        <Input label="Yeni Şifre" type="password" value={new_password} onChange={setNew} placeholder="Yeni şifre" />
        <Input label="Yeni Şifre (Tekrar)" type="password" value={confirm_password} onChange={setConfirm} placeholder="Yeni şifreyi tekrar girin" />
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <div className="flex flex-col gap-2">
          <button
            onClick={submit}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-yellow-400/30 hover:shadow-yellow-400/40 transition transform hover:scale-[1.02] disabled:opacity-50"
          >
            Şifreyi Güncelle
          </button>
          <p className="text-xs text-zinc-400">⚠️ Güvenliğiniz için güçlü bir şifre belirleyin (en az 8 karakter, harf + sayı).</p>
        </div>
      </motion.div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="space-y-2">
      <span className="text-yellow-300 text-sm">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-xl bg-neutral-900/60 text-gray-100 placeholder-[#a3a3a3] border border-yellow-400/30 outline-none focus:ring-2 focus:ring-yellow-500/40"
      />
    </label>
  );
}