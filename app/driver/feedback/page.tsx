"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";

type Feedback = { date: string; passenger: string; stars: number; comment: string };

const initial: Feedback[] = [
  { date: "07/11/2025", passenger: "Elif K.", stars: 5, comment: "Çok nazik sürücü, tertemiz araç." },
];

export default function DriverFeedbackPage() {
  const params = useSearchParams();
  const [list, setList] = useState<Feedback[]>(initial);
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");

  useEffect(() => {
    if (params.get("open") === "1") setOpen(true);
  }, [params]);

  const avg = useMemo(() => {
    const sum = list.reduce((acc, i) => acc + i.stars, 0);
    return (sum / (list.length || 1)).toFixed(1);
  }, [list]);

  const submit = async () => {
    try {
      await api.post("/api/driver/feedback", { reservation_id: Number(params.get("reservation_id")) || 1, rating: stars, comment: text, passenger_name: "Yolcu" });
      setList((prev) => [{ date: new Date().toLocaleDateString(), passenger: "Yolcu", stars, comment: text || "" }, ...prev]);
      toast.success("⭐ Teşekkürler! Değerlendirmeniz alındı.");
      setOpen(false);
      setStars(5);
      setText("");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Gönderim başarısız");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-between hover:shadow-[0_0_20px_#facc15]/20 transition-all duration-300">
        <div className="text-sm">📊 Ortalama Puan: {avg} / 5</div>
        <button onClick={()=>setOpen(true)} className="px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:scale-[1.02] hover:shadow-[0_0_20px_#facc15]/20 transition-all duration-300">Değerlendirme Ekle</button>
      </div>

      <div className="rounded-xl border border-yellow-500/30 bg-black/60 backdrop-blur-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-gray-300">
            <tr className="text-left">
              <th className="p-3">Tarih</th>
              <th className="p-3">Yolcu Adı</th>
              <th className="p-3">Yıldız</th>
              <th className="p-3">Yorum</th>
            </tr>
          </thead>
          <tbody>
            {list.map((f, i) => (
              <tr key={i} className="border-t border-yellow-500/10">
                <td className="p-3">{f.date}</td>
                <td className="p-3">{f.passenger}</td>
                <td className="p-3">{"⭐".repeat(f.stars)}</td>
                <td className="p-3">{f.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-lg bg-black/90 border border-yellow-500/30 text-gray-300 rounded-2xl p-6">
            <div className="text-xl mb-2">Sürüşünüzü Değerlendirin</div>
            <div className="flex gap-2 mb-3">
              {[1,2,3,4,5].map((s)=> (
                <button key={s} onClick={()=>setStars(s)} className={`px-3 py-2 rounded-xl border ${stars>=s?"bg-black/70 border-yellow-500/30":"bg-black/50 border-yellow-500/30"}`}>⭐</button>
              ))}
            </div>
            <textarea value={text} onChange={(e)=>setText(e.target.value)} className="w-full h-24 px-3 py-2 rounded-xl bg-black/70 border border-yellow-500/30 text-yellow-400" placeholder="Sürücü hakkında yorumunuzu yazın..." />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={()=>setOpen(false)} className="px-3 py-2 rounded-xl border border-yellow-500/30">İptal</button>
              <button onClick={submit} className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:scale-[1.02] hover:shadow-[0_0_20px_#facc15]/20 transition-all duration-300">Gönder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}