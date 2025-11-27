"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Navbar from "../../components/Navbar";
import { useApplyPartner } from "@/hooks/useApplications";
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

function validateTaxNumber(tax: string): boolean {
  if (!tax || tax.length !== 10 || !/^\d+$/.test(tax) || tax[0] === '0') return false;
  const digits = tax.split('').map(Number);
  const sumAll = digits.slice(0, 9).reduce((a, b) => a + b, 0);
  const check = sumAll % 10;
  return check === digits[9];
}

function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-+]/g, '');
  if (cleaned.startsWith('90')) return cleaned.length === 12;
  if (cleaned.startsWith('0')) return cleaned.length === 11;
  return cleaned.length === 10 && /^\d+$/.test(cleaned);
}

export default function PartnerApplyPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useApplyPartner();
  const [form, setForm] = useState({
    company_name: "",
    tax_office: "",
    tax_number: "",
    company_type: "Ltd",
    contact_full_name: "",
    tc_no: "",
    contact_email: "",
    contact_phone: "",
    total_vehicles: 1,
    fleet_type: "Standard",
    kvkk_consent: false,
    commercial_contract_approved: false,
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
    if (!form.company_name) newErrors.company_name = "Firma adı gereklidir";
    if (!form.tax_office) newErrors.tax_office = "Vergi dairesi gereklidir";
    if (!validateTaxNumber(form.tax_number)) newErrors.tax_number = "Geçersiz vergi numarası";
    if (!form.contact_full_name) newErrors.contact_full_name = "Yetkili ad soyad gereklidir";
    if (!validateTC(form.tc_no)) newErrors.tc_no = "Geçersiz TC Kimlik No";
    if (!form.contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) newErrors.contact_email = "Geçerli bir e-posta adresi giriniz";
    if (!validatePhone(form.contact_phone)) newErrors.contact_phone = "Geçersiz telefon numarası formatı";
    if (form.total_vehicles < 1) newErrors.total_vehicles = "Araç sayısı en az 1 olmalıdır";
    if (!form.kvkk_consent) newErrors.kvkk_consent = "KVKK onayı zorunludur";
    if (!form.commercial_contract_approved) newErrors.commercial_contract_approved = "Ticari sözleşme onayı zorunludur";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;
    try {
      await mutateAsync({
        company_name: form.company_name,
        tax_office: form.tax_office,
        tax_number: form.tax_number,
        company_type: form.company_type,
        contact_full_name: form.contact_full_name,
        tc_no: form.tc_no,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        total_vehicles: form.total_vehicles,
        fleet_type: form.fleet_type,
        kvkk_consent: form.kvkk_consent,
        commercial_contract_approved: form.commercial_contract_approved,
        company_documents_image_url: "",
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
        <h1 className="font-[var(--font-display)] text-3xl md:text-4xl text-yellow-300 mb-6">Partner Başvurusu</h1>
        <form onSubmit={onSubmit} className="rounded-2xl gold-glass p-6 md:p-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Firma Adı *</label>
              <input className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="company_name" value={form.company_name} onChange={onChange} required />
              {errors.company_name && <p className="text-red-400 text-xs mt-1">{errors.company_name}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Vergi Dairesi *</label>
              <input className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="tax_office" value={form.tax_office} onChange={onChange} required />
              {errors.tax_office && <p className="text-red-400 text-xs mt-1">{errors.tax_office}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Vergi No *</label>
              <input className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="tax_number" maxLength={10} value={form.tax_number} onChange={onChange} required />
              {errors.tax_number && <p className="text-red-400 text-xs mt-1">{errors.tax_number}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Şirket Türü *</label>
              <select className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="company_type" value={form.company_type} onChange={onChange} required>
                <option value="Şahıs">Şahıs</option>
                <option value="Ltd">Ltd</option>
                <option value="AŞ">AŞ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Yetkili Ad Soyad *</label>
              <input className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="contact_full_name" value={form.contact_full_name} onChange={onChange} required />
              {errors.contact_full_name && <p className="text-red-400 text-xs mt-1">{errors.contact_full_name}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">TC Kimlik No *</label>
              <input className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="tc_no" maxLength={11} value={form.tc_no} onChange={onChange} required />
              {errors.tc_no && <p className="text-red-400 text-xs mt-1">{errors.tc_no}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">E-posta *</label>
              <input type="email" className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="contact_email" value={form.contact_email} onChange={onChange} required />
              {errors.contact_email && <p className="text-red-400 text-xs mt-1">{errors.contact_email}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Telefon *</label>
              <input className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="contact_phone" value={form.contact_phone} onChange={onChange} required />
              {errors.contact_phone && <p className="text-red-400 text-xs mt-1">{errors.contact_phone}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Toplam Araç Sayısı *</label>
              <input type="number" className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="total_vehicles" min={1} value={form.total_vehicles} onChange={onChange} required />
              {errors.total_vehicles && <p className="text-red-400 text-xs mt-1">{errors.total_vehicles}</p>}
            </div>
            <div>
              <label className="block text-sm text-yellow-200 mb-1">Filo Türü *</label>
              <select className="w-full rounded-lg bg-black/70 border soft-border px-3 py-2 text-yellow-100 gold-focus" name="fleet_type" value={form.fleet_type} onChange={onChange} required>
                <option value="VIP">VIP</option>
                <option value="Standard">Standard</option>
                <option value="Mixed">Karışık</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-yellow-200">
              <input type="checkbox" name="kvkk_consent" checked={form.kvkk_consent} onChange={onChange} className="rounded" required />
              <span>KVKK Aydınlatma Metni'ni okudum ve kabul ediyorum *</span>
            </label>
            {errors.kvkk_consent && <p className="text-red-400 text-xs">{errors.kvkk_consent}</p>}
            <label className="flex items-center gap-2 text-sm text-yellow-200">
              <input type="checkbox" name="commercial_contract_approved" checked={form.commercial_contract_approved} onChange={onChange} className="rounded" required />
              <span>Ticari sözleşmeyi okudum ve onaylıyorum *</span>
            </label>
            {errors.commercial_contract_approved && <p className="text-red-400 text-xs">{errors.commercial_contract_approved}</p>}
          </div>
          {errors.submit && <p className="text-red-400">{errors.submit}</p>}
          <div className="flex gap-3">
            <button type="submit" className="btn-shimmer text-black px-6 py-3 rounded-lg" disabled={isPending || !form.kvkk_consent || !form.commercial_contract_approved}>
              {isPending ? "Gönderiliyor..." : "Başvuruyu Gönder"}
            </button>
            <Link href="/"><button type="button" className="bg-zinc-900 text-yellow-300 px-6 py-3 rounded-lg border border-yellow-500/30">İptal</button></Link>
          </div>
        </form>
      </main>
    </div>
  );
}
