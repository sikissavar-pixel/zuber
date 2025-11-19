"use client";
import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function PartnerProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      <Inner />
    </ProtectedRoute>
  );
}

function Inner() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", contact_email: "", contact_phone: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.full_name || "", contact_email: user.email || "", contact_phone: "", city: "" });
  }, [user]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async () => {
    setLoading(true);
    try {
      const payload: any = { name: form.name, contact_email: form.contact_email, contact_phone: form.contact_phone };
      // city optional for now
      if (form.city) payload.city = form.city;
      await api.put("/api/partners/update", payload);
      toast.success("Bilgiler güncellendi.");
      setDisabled(true);
      setTimeout(() => setDisabled(false), 2000);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Güncelleme sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-yellow-400 mb-4">Profil Bilgilerim</h1>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="p-6 rounded-2xl border border-yellow-400/20 bg-neutral-950/70 backdrop-blur-md shadow-[0_0_30px_rgba(234,179,8,0.25)] max-w-3xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="İsim" value={form.name} onChange={(v) => set("name", v)} placeholder="İsminizi giriniz" disabled={disabled} />
          <Input label="E-posta" value={form.contact_email} onChange={(v) => set("contact_email", v)} placeholder="E-posta adresiniz" readOnly disabled={disabled} />
          <Input label="Telefon" value={form.contact_phone} onChange={(v) => set("contact_phone", v)} placeholder="Telefon numaranız" disabled={disabled} />
          <Input label="Şehir" value={form.city} onChange={(v) => set("city", v)} placeholder="Şehir" disabled={disabled} />
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={submit}
            disabled={loading || disabled}
            className="px-5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-yellow-400/30 hover:shadow-yellow-400/40 transition transform hover:scale-[1.02] disabled:opacity-50"
          >
            Bilgilerimi Güncelle
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, readOnly, disabled }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; readOnly?: boolean; disabled?: boolean }) {
  return (
    <label className="space-y-2">
      <span className="text-yellow-300 text-sm">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className="w-full px-4 py-2 rounded-xl bg-neutral-900/60 text-gray-100 placeholder-[#a3a3a3] border border-yellow-400/30 outline-none focus:ring-2 focus:ring-yellow-500/40"
      />
    </label>
  );
}