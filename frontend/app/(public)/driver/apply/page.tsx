"use client";
import { useEffect, useState } from "react";
import { useApplyDriver } from "@/hooks/useApplications";
import { motion } from "framer-motion";
import { toast } from "sonner";

function validateTC(tc: string): boolean {
  if (!tc || tc.length !== 11 || !/^\d+$/.test(tc) || tc[0] === '0') return false;
  const digits = tc.split('').map(Number);
  const sumOdd = digits.slice(0, 9).filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
  const sumEven = digits.slice(1, 8).filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
  const check1 = (sumOdd * 7 - sumEven) % 10;
  if (check1 !== digits[9]) return false;
  const check2 = (sumOdd + sumEven + digits[9]) % 10;
  return check2 === digits[10];
}

function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-+]/g, '');
  if (cleaned.startsWith('90')) return cleaned.length === 12;
  if (cleaned.startsWith('0')) return cleaned.length === 11;
  return cleaned.length === 10 && /^\d+$/.test(cleaned);
}

function validatePlate(plate: string): boolean {
  return /^[0-9]{2}[A-Z]{1,3}[0-9]{2,4}$/i.test(plate);
}

export default function DriverApplyPage() {
  const { mutateAsync, isPending, isSuccess } = useApplyDriver();
  const [form, setForm] = useState({
    full_name: "",
    tc_no: "",
    birth_year: new Date().getFullYear() - 30,
    email: "",
    phone: "",
    city: "",
    driver_license_class: "B",
    driver_license_year: new Date().getFullYear(),
    criminal_record_confirmed: false,
    kvkk_consent: false,
    data_processing_consent: false,
    vehicle_brand: "",
    vehicle_model: "",
    vehicle_year: new Date().getFullYear(),
    plate_number: "",
    fuel_type: "diesel",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confetti, setConfetti] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) {
      setErrors((e) => {
        const newE = { ...e };
        delete newE[name];
        return newE;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (form.full_name.length < 3) {
      newErrors.full_name = "Ad soyad en az 3 karakter olmalıdır";
    }
    
    if (!validateTC(form.tc_no)) {
      newErrors.tc_no = "Geçersiz TC Kimlik No";
    }
    
    const currentYear = new Date().getFullYear();
    if (form.birth_year < 1955 || form.birth_year > 2005) {
      newErrors.birth_year = "Doğum yılı 1955-2005 arasında olmalıdır";
    }
    
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }
    
    if (!validatePhone(form.phone)) {
      newErrors.phone = "Geçersiz telefon numarası formatı";
    }
    
    if (!form.city) {
      newErrors.city = "Şehir gereklidir";
    }
    
    if (form.driver_license_year > currentYear) {
      newErrors.driver_license_year = "Ehliyet yılı gelecekte olamaz";
    }
    
    if (form.vehicle_year < 2008) {
      newErrors.vehicle_year = "Araç yılı 2008 veya sonrası olmalıdır";
    }
    
    if (!validatePlate(form.plate_number)) {
      newErrors.plate_number = "Geçersiz plaka formatı (örn: 34ABC123)";
    }
    
    if (!form.kvkk_consent) {
      newErrors.kvkk_consent = "KVKK onayı zorunludur";
    }
    
    if (!form.data_processing_consent) {
      newErrors.data_processing_consent = "Veri işleme onayı zorunludur";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await mutateAsync({
        full_name: form.full_name,
        tc_no: form.tc_no,
        birth_year: form.birth_year,
        email: form.email,
        phone: form.phone,
        city: form.city,
        driver_license_class: form.driver_license_class,
        driver_license_year: form.driver_license_year,
        criminal_record_confirmed: form.criminal_record_confirmed,
        kvkk_consent: form.kvkk_consent,
        data_processing_consent: form.data_processing_consent,
        vehicle_brand: form.vehicle_brand,
        vehicle_model: form.vehicle_model,
        vehicle_year: form.vehicle_year,
        plate_number: form.plate_number.toUpperCase(),
        fuel_type: form.fuel_type,
      });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Gönderim başarısız oldu";
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
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
      <motion.div className="w-full max-w-3xl rounded-2xl p-8 bg-black/70 border border-yellow-500/30 shadow-[0_0_40px_rgba(199,160,64,0.15)]"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-yellow-400">Zuber Sürücü Başvurusu</h1>
          <div className="text-xl tracking-wide" style={{ textShadow: "0 0 18px rgba(255,213,79,0.3)" }}>Zuber</div>
        </div>
        <p className="text-sm text-zinc-300 mb-6 text-center">Zuber sürücü ağına katılarak VIP transfer ayrıcalığı sunun.</p>

        {isSuccess ? (
          <div className="flex flex-col items-center gap-5 py-10 text-center">
            <div className="w-24 h-24 rounded-full border-2 border-yellow-400 flex items-center justify-center shadow-[0_0_28px_#FFD54F66]">
              <span className="text-4xl">✓</span>
            </div>
            <h2 className="text-xl">Başvuru alındı 🎉</h2>
            <p className="text-zinc-200">Başvurunuz başarıyla alındı. Zuber ekibimiz kısa süre içinde sizinle iletişime geçecektir.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Ad Soyad *</label>
                <input className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="full_name" value={form.full_name} onChange={onChange} required />
                {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">TC Kimlik No *</label>
                <input className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="tc_no" maxLength={11} value={form.tc_no} onChange={onChange} required />
                {errors.tc_no && <p className="text-red-400 text-xs mt-1">{errors.tc_no}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Doğum Yılı *</label>
                <input type="number" className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="birth_year" min={1955} max={2005} value={form.birth_year} onChange={onChange} required />
                {errors.birth_year && <p className="text-red-400 text-xs mt-1">{errors.birth_year}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">E-posta *</label>
                <input type="email" className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="email" value={form.email} onChange={onChange} required />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Telefon *</label>
                <input className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="phone" placeholder="+90 555 123 4567" value={form.phone} onChange={onChange} required />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Şehir *</label>
                <input className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="city" value={form.city} onChange={onChange} required />
                {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Ehliyet Sınıfı *</label>
                <select className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="driver_license_class" value={form.driver_license_class} onChange={onChange} required>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Ehliyet Yılı *</label>
                <input type="number" className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="driver_license_year" max={new Date().getFullYear()} value={form.driver_license_year} onChange={onChange} required />
                {errors.driver_license_year && <p className="text-red-400 text-xs mt-1">{errors.driver_license_year}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Araç Markası *</label>
                <input className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="vehicle_brand" value={form.vehicle_brand} onChange={onChange} required />
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Araç Modeli *</label>
                <input className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="vehicle_model" value={form.vehicle_model} onChange={onChange} required />
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Araç Yılı *</label>
                <input type="number" className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="vehicle_year" min={2008} max={new Date().getFullYear()} value={form.vehicle_year} onChange={onChange} required />
                {errors.vehicle_year && <p className="text-red-400 text-xs mt-1">{errors.vehicle_year}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Plaka *</label>
                <input className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300 uppercase" name="plate_number" placeholder="34ABC123" value={form.plate_number} onChange={onChange} required />
                {errors.plate_number && <p className="text-red-400 text-xs mt-1">{errors.plate_number}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Yakıt Türü *</label>
                <select className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="fuel_type" value={form.fuel_type} onChange={onChange} required>
                  <option value="diesel">Dizel</option>
                  <option value="gasoline">Benzin</option>
                  <option value="hybrid">Hibrit</option>
                  <option value="electric">Elektrik</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-yellow-200">
                <input type="checkbox" name="criminal_record_confirmed" checked={form.criminal_record_confirmed} onChange={onChange} className="rounded" />
                <span>Adli sicil kaydı temiz</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-yellow-200">
                <input type="checkbox" name="kvkk_consent" checked={form.kvkk_consent} onChange={onChange} className="rounded" required />
                <span>KVKK Aydınlatma Metni'ni okudum ve kabul ediyorum *</span>
              </label>
              {errors.kvkk_consent && <p className="text-red-400 text-xs">{errors.kvkk_consent}</p>}
              <label className="flex items-center gap-2 text-sm text-yellow-200">
                <input type="checkbox" name="data_processing_consent" checked={form.data_processing_consent} onChange={onChange} className="rounded" required />
                <span>Kişisel verilerimin işlenmesine izin veriyorum *</span>
              </label>
              {errors.data_processing_consent && <p className="text-red-400 text-xs">{errors.data_processing_consent}</p>}
            </div>
            {errors.submit && <p className="text-red-400">{errors.submit}</p>}
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-3 rounded font-semibold bg-yellow-500 hover:bg-yellow-400 text-black border border-yellow-600/40 transition" disabled={isPending || !form.kvkk_consent || !form.data_processing_consent}>
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
