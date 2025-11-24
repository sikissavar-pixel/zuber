"use client";
import { useEffect, useState } from "react";
import { useApplyPartner } from "@/hooks/useApplications";
import { motion } from "framer-motion";

export default function PartnerApplyPage() {
  const { mutateAsync, isPending, isSuccess } = useApplyPartner();
  const [form, setForm] = useState({
    name: "",
    contact_full_name: "",
    contact_email: "",
    contact_phone: "",
    city: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await mutateAsync(form);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Gönderim başarısız oldu");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setConfetti(true);
      const t = setTimeout(() => setConfetti(false), 2500);
      return () => clearTimeout(t);
    }
  }, [isSuccess]);

  return (
    <div className="min-h-screen text-[#FFD54F] flex items-center justify-center p-6 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      <motion.div className="w-full max-w-2xl rounded-2xl p-8 bg-black/70 border border-yellow-500/30 shadow-[0_0_40px_rgba(199,160,64,0.15)]"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-yellow-400">Zuber Partner Program</h1>
          <div className="text-xl tracking-wide" style={{ textShadow: "0 0 18px rgba(255,213,79,0.3)" }}>Zuber</div>
        </div>
        <p className="text-sm text-zinc-300 mb-6 text-center">Zuber Partner Ağı’na katılarak misafirlerinize VIP transfer ayrıcalığı sunun.</p>

        {isSuccess ? (
          <div className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="w-24 h-24 rounded-full border-2 border-yellow-400 flex items-center justify-center shadow-[0_0_28px_#FFD54F66]">
              <span className="text-4xl">✓</span>
            </div>
            <h2 className="text-xl">Başvuru alındı 🎉</h2>
            <p className="text-zinc-200">Başvurunuz başarıyla alındı. Zuber ekibimiz kısa süre içinde sizinle iletişime geçecektir.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="name" placeholder="Otel / Rezidans Adı" value={form.name} onChange={onChange} required />
            <input className="rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="contact_full_name" placeholder="Yetkili Ad Soyad" value={form.contact_full_name} onChange={onChange} required />
            <input className="rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="contact_email" type="email" placeholder="E-posta" value={form.contact_email} onChange={onChange} required />
            <input className="rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="contact_phone" placeholder="Telefon" value={form.contact_phone} onChange={onChange} required />
            <input className="rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="city" placeholder="Şehir" value={form.city} onChange={onChange} required />
            <textarea className="rounded p-3 md:col-span-2 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="description" placeholder="Adres" value={form.description} onChange={onChange} />
            {error && <p className="md:col-span-2 text-red-400">{error}</p>}
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="px-6 py-3 rounded font-semibold bg-yellow-500 hover:bg-yellow-400 text-black border border-yellow-600/40 transition" disabled={isPending}>
                {isPending ? "Gönderiliyor..." : "Başvuruyu Gönder"}
              </button>
            </div>
          </form>
        )}
      </motion.div>

      {confetti && (
        <div className="pointer-events-none fixed inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <span key={i} style={{ position: "absolute", left: `${(i * 3.3) % 100}%`, top: 0, width: 8, height: 14, background: i % 3 === 0 ? "#FFE27A" : i % 3 === 1 ? "#FFD54F" : "#FFC233" }} />
          ))}
        </div>
      )}
    </div>
  );
}