"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Navbar from "../../components/Navbar";

export default function DriverApplyPage() {
  const router = useRouter();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Başvurunuz alınmıştır. Onay sonrası bilgilendirileceksiniz.");
    setTimeout(() => router.push("/"), 3000);
  };
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-[var(--font-display)] text-3xl md:text-4xl text-yellow-300 mb-6">Sürücü Başvurusu</h1>
        <form onSubmit={onSubmit} className="rounded-2xl gold-glass p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Ad Soyad</label>
              <input className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" required />
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">E-posta</label>
              <input type="email" className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" required />
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Telefon</label>
              <input className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" required />
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Şehir</label>
              <input className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-yellow-200 mb-1">Ek Not (opsiyonel)</label>
              <textarea rows={4} className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" className="btn-shimmer text-black px-6 py-3 rounded-lg">Başvuruyu Gönder</button>
            <Link href="/"><button type="button" className="bg-zinc-900 text-yellow-300 px-6 py-3 rounded-lg border border-yellow-500/30">İptal</button></Link>
          </div>
        </form>
      </main>
    </div>
  );
}