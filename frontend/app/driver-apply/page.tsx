"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Navbar from "../../components/Navbar";
import { useApplyDriver } from "@/hooks/useApplications";
import { useState } from "react";

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
  const router = useRouter();
  const { mutateAsync, isPending } = useApplyDriver();
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

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
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
    if (form.full_name.length < 3) newErrors.full_name = "Ad soyad en az 3 karakter olmalıdır";
    if (!validateTC(form.tc_no)) newErrors.tc_no = "Geçersiz TC Kimlik No";
    const currentYear = new Date().getFullYear();
    if (form.birth_year < 1955 || form.birth_year > 2005) newErrors.birth_year = "Doğum yılı 1955-2005 arasında olmalıdır";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Geçerli bir e-posta adresi giriniz";
    if (!validatePhone(form.phone)) newErrors.phone = "Geçersiz telefon numarası formatı";
    if (!form.city) newErrors.city = "Şehir gereklidir";
    if (form.driver_license_year > currentYear) newErrors.driver_license_year = "Ehliyet yılı gelecekte olamaz";
    if (form.vehicle_year < 2008) newErrors.vehicle_year = "Araç yılı 2008 veya sonrası olmalıdır";
    if (!validatePlate(form.plate_number)) newErrors.plate_number = "Geçersiz plaka formatı";
    if (!form.kvkk_consent) newErrors.kvkk_consent = "KVKK onayı zorunludur";
    if (!form.data_processing_consent) newErrors.data_processing_consent = "Veri işleme onayı zorunludur";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;
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
        driver_license_image_url: "",
        vehicle_registration_image_url: "",
      });
      toast.success("Başvurunuz alınmıştır. Onay sonrası bilgilendirileceksiniz.");
      setTimeout(() => router.push("/"), 3000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.response?.data?.error || err?.message || "Gönderim başarısız oldu";
      toast.error(errorMsg);
      setErrors({ submit: errorMsg });
    }
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="font-[var(--font-display)] text-3xl md:text-4xl text-yellow-300 mb-6">Sürücü Başvurusu</h1>
        <form onSubmit={onSubmit} className="rounded-2xl gold-glass p-6 md:p-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Ad Soyad *</label>
              <input className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="full_name" value={form.full_name} onChange={onChange} required />
              {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">TC Kimlik No *</label>
              <input className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="tc_no" maxLength={11} value={form.tc_no} onChange={onChange} required />
              {errors.tc_no && <p className="text-red-400 text-xs mt-1">{errors.tc_no}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Doğum Yılı *</label>
              <input type="number" className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="birth_year" min={1955} max={2005} value={form.birth_year} onChange={onChange} required />
              {errors.birth_year && <p className="text-red-400 text-xs mt-1">{errors.birth_year}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">E-posta *</label>
              <input type="email" className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="email" value={form.email} onChange={onChange} required />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Telefon *</label>
              <input className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="phone" value={form.phone} onChange={onChange} required />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Şehir *</label>
              <input className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="city" value={form.city} onChange={onChange} required />
              {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Ehliyet Sınıfı *</label>
              <select className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="driver_license_class" value={form.driver_license_class} onChange={onChange} required>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Ehliyet Yılı *</label>
              <input type="number" className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="driver_license_year" max={new Date().getFullYear()} value={form.driver_license_year} onChange={onChange} required />
              {errors.driver_license_year && <p className="text-red-400 text-xs mt-1">{errors.driver_license_year}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Araç Markası *</label>
              <input className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="vehicle_brand" value={form.vehicle_brand} onChange={onChange} required />
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Araç Modeli *</label>
              <input className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="vehicle_model" value={form.vehicle_model} onChange={onChange} required />
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Araç Yılı *</label>
              <input type="number" className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="vehicle_year" min={2008} max={new Date().getFullYear()} value={form.vehicle_year} onChange={onChange} required />
              {errors.vehicle_year && <p className="text-red-400 text-xs mt-1">{errors.vehicle_year}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Plaka *</label>
              <input className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus uppercase" name="plate_number" value={form.plate_number} onChange={onChange} required />
              {errors.plate_number && <p className="text-red-400 text-xs mt-1">{errors.plate_number}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Yakıt Türü *</label>
              <select className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="fuel_type" value={form.fuel_type} onChange={onChange} required>
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
          <div className="flex gap-3">
            <button type="submit" className="btn-shimmer text-black px-6 py-3 rounded-lg" disabled={isPending || !form.kvkk_consent || !form.data_processing_consent}>
              {isPending ? "Gönderiliyor..." : "Başvuruyu Gönder"}
            </button>
            <Link href="/"><button type="button" className="bg-zinc-900 text-yellow-300 px-6 py-3 rounded-lg border border-yellow-500/30">İptal</button></Link>
          </div>
        </form>
      </main>
    </div>
  );
}
