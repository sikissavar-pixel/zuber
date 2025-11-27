"use client";
import { useEffect, useState } from "react";
import { useApplyPartner } from "@/hooks/useApplications";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api, { setAuthToken } from "@/lib/api";

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
  const { mutateAsync, isPending, isSuccess } = useApplyPartner();
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
  const [confetti, setConfetti] = useState(false);
  const [companyDocumentsFile, setCompanyDocumentsFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [companyDocumentsUrl, setCompanyDocumentsUrl] = useState<string>("");

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
    
    if (!form.company_name) {
      newErrors.company_name = "Firma adı gereklidir";
    }
    
    if (!form.tax_office) {
      newErrors.tax_office = "Vergi dairesi gereklidir";
    }
    
    if (!validateTaxNumber(form.tax_number)) {
      newErrors.tax_number = "Geçersiz vergi numarası";
    }
    
    if (!form.contact_full_name) {
      newErrors.contact_full_name = "Yetkili ad soyad gereklidir";
    }
    
    if (!validateTC(form.tc_no)) {
      newErrors.tc_no = "Geçersiz TC Kimlik No";
    }
    
    if (!form.contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
      newErrors.contact_email = "Geçerli bir e-posta adresi giriniz";
    }
    
    if (!validatePhone(form.contact_phone)) {
      newErrors.contact_phone = "Geçersiz telefon numarası formatı";
    }
    
    if (form.total_vehicles < 1) {
      newErrors.total_vehicles = "Araç sayısı en az 1 olmalıdır";
    }
    
    if (!form.kvkk_consent) {
      newErrors.kvkk_consent = "KVKK onayı zorunludur";
    }
    
    if (!form.commercial_contract_approved) {
      newErrors.commercial_contract_approved = "Ticari sözleşme onayı zorunludur";
    }
    
    if (!companyDocumentsUrl) {
      newErrors.company_documents_image_url = "Firma belgesi gereklidir";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return "Dosya formatı geçersiz. JPG, PNG veya PDF yükleyiniz.";
    }
    if (file.size > 5 * 1024 * 1024) {
      return "Dosya boyutu 5MB'dan büyük olamaz.";
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<string> => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setAuthToken(token);
    }
    
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await api.post("/api/uploads/document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    if (response.data.success && response.data.url) {
      return response.data.url;
    }
    throw new Error("Upload failed");
  };

  const handleCompanyDocumentsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    
    setCompanyDocumentsFile(file);
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setCompanyDocumentsUrl(url);
      toast.success("Firma belgesi yüklendi");
    } catch (err: any) {
      toast.error("Yükleme başarısız: " + (err?.response?.data?.detail || err?.message));
      setCompanyDocumentsFile(null);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
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
        company_documents_image_url: companyDocumentsUrl,
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
          <h1 className="text-2xl font-bold text-yellow-400">Zuber Partner Program</h1>
          <div className="text-xl tracking-wide" style={{ textShadow: "0 0 18px rgba(255,213,79,0.3)" }}>Zuber</div>
        </div>
        <p className="text-sm text-zinc-300 mb-6 text-center">Zuber Partner Ağı'na katılarak misafirlerinize VIP transfer ayrıcalığı sunun.</p>

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
                <label className="block text-sm text-yellow-200 mb-1">Firma Adı *</label>
                <input className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="company_name" value={form.company_name} onChange={onChange} required />
                {errors.company_name && <p className="text-red-400 text-xs mt-1">{errors.company_name}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Vergi Dairesi *</label>
                <input className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="tax_office" value={form.tax_office} onChange={onChange} required />
                {errors.tax_office && <p className="text-red-400 text-xs mt-1">{errors.tax_office}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Vergi No *</label>
                <input className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="tax_number" maxLength={10} value={form.tax_number} onChange={onChange} required />
                {errors.tax_number && <p className="text-red-400 text-xs mt-1">{errors.tax_number}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Şirket Türü *</label>
                <select className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="company_type" value={form.company_type} onChange={onChange} required>
                  <option value="Şahıs">Şahıs</option>
                  <option value="Ltd">Ltd</option>
                  <option value="AŞ">AŞ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Yetkili Ad Soyad *</label>
                <input className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="contact_full_name" value={form.contact_full_name} onChange={onChange} required />
                {errors.contact_full_name && <p className="text-red-400 text-xs mt-1">{errors.contact_full_name}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">TC Kimlik No *</label>
                <input className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="tc_no" maxLength={11} value={form.tc_no} onChange={onChange} required />
                {errors.tc_no && <p className="text-red-400 text-xs mt-1">{errors.tc_no}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">E-posta *</label>
                <input type="email" className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="contact_email" value={form.contact_email} onChange={onChange} required />
                {errors.contact_email && <p className="text-red-400 text-xs mt-1">{errors.contact_email}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Telefon *</label>
                <input className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="contact_phone" placeholder="+90 555 123 4567" value={form.contact_phone} onChange={onChange} required />
                {errors.contact_phone && <p className="text-red-400 text-xs mt-1">{errors.contact_phone}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Toplam Araç Sayısı *</label>
                <input type="number" className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="total_vehicles" min={1} value={form.total_vehicles} onChange={onChange} required />
                {errors.total_vehicles && <p className="text-red-400 text-xs mt-1">{errors.total_vehicles}</p>}
              </div>
              <div>
                <label className="block text-sm text-yellow-200 mb-1">Filo Türü *</label>
                <select className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" name="fleet_type" value={form.fleet_type} onChange={onChange} required>
                  <option value="VIP">VIP</option>
                  <option value="Standard">Standard</option>
                  <option value="Mixed">Karışık</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-yellow-200 mb-1">Firma Belgesi Yükle *</label>
                <input type="file" accept="image/jpeg,image/jpg,image/png,application/pdf" onChange={handleCompanyDocumentsChange} disabled={uploading} className="w-full rounded p-3 bg-[#0f0f0f] border border-yellow-500/30 text-yellow-300" required />
                {companyDocumentsUrl && <p className="text-green-400 text-xs mt-1">✓ Yüklendi</p>}
                {errors.company_documents_image_url && <p className="text-red-400 text-xs mt-1">{errors.company_documents_image_url}</p>}
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
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-3 rounded font-semibold bg-yellow-500 hover:bg-yellow-400 text-black border border-yellow-600/40 transition" disabled={isPending || uploading || !form.kvkk_consent || !form.commercial_contract_approved || !companyDocumentsUrl}>
                {isPending ? "Gönderiliyor..." : uploading ? "Yükleniyor..." : "Başvuruyu Gönder"}
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
