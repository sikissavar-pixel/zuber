"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import api from "../../lib/api";
import { toast } from "sonner";
import { getErrorMessage } from "../../lib/utils";

export default function ProfileEditPage() {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [driverLicenseFile, setDriverLicenseFile] = useState<File | null>(null);
  const [vehicleImageFile, setVehicleImageFile] = useState<File | null>(null);
  const [previewProfile, setPreviewProfile] = useState<string | null>(null);
  const [previewLicense, setPreviewLicense] = useState<string | null>(null);
  const [previewVehicle, setPreviewVehicle] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const;
  const MAX_BYTES = 150 * 1024; // 150KB

  function validateEmail(val: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(val);
  }

  function formatTRPhone(input: string): { masked: string; digitsAfter: number } {
    const digits = input.replace(/\D/g, "");
    // Zorunlu +90 ön eki
    let after = digits.startsWith("90") ? digits.slice(2) : digits;
    after = after.slice(0, 10); // Türkiye numarası 10 hane
    const p1 = after.slice(0, 3);
    const p2 = after.slice(3, 6);
    const p3 = after.slice(6, 8);
    const p4 = after.slice(8, 10);
    const masked = `+90${p1 ? " " + p1 : ""}${p2 ? " " + p2 : ""}${p3 ? " " + p3 : ""}${p4 ? " " + p4 : ""}`;
    return { masked, digitsAfter: after.length };
  }

  function validateAndPreviewFile(file: File | null, which: "profile" | "license" | "vehicle") {
    if (!file) {
      if (which === "profile") setPreviewProfile(null);
      if (which === "license") setPreviewLicense(null);
      if (which === "vehicle") setPreviewVehicle(null);
      return null;
    }
    if (!ALLOWED_TYPES.includes(file.type as any)) {
      toast.error("⚠️ Desteklenmeyen dosya türü.");
      if (which === "profile") setPreviewProfile(null);
      if (which === "license") setPreviewLicense(null);
      if (which === "vehicle") setPreviewVehicle(null);
      return null;
    }
    if (file.size > MAX_BYTES) {
      toast.error("⚠️ Dosya boyutu 150 KB’tan büyük olamaz.");
      if (which === "profile") setPreviewProfile(null);
      if (which === "license") setPreviewLicense(null);
      if (which === "vehicle") setPreviewVehicle(null);
      return null;
    }
    const isImage = file.type.startsWith("image/");
    const url = isImage ? URL.createObjectURL(file) : null;
    if (which === "profile") setPreviewProfile(url);
    if (which === "license") setPreviewLicense(url);
    if (which === "vehicle") setPreviewVehicle(url);
    return file;
  }

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get("/api/users/me");
        setFullName(res.data.full_name || "");
        setEmail(res.data.email || "");
        setIdentityNumber(res.data.identity_number || "");
        setContactPhone(res.data.contact_phone || "");
        setVehiclePlate(res.data.vehicle_plate || "");
        setVehicleModel(res.data.vehicle_model || "");
      } catch (e) {
        // ignore
      }
    };
    run();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // İstemci doğrulamaları (Türkçe mesajlarla)
      if (!fullName.trim()) throw new Error("Lütfen ad soyad giriniz.");
      if (!validateEmail(email)) throw new Error("⚠️ Geçerli bir e-posta adresi giriniz.");
      const idDigits = identityNumber.replace(/\D/g, "");
      if (idDigits.length !== 11) throw new Error("⚠️ Geçerli bir T.C. Kimlik Numarası giriniz.");
      const phoneDigits = contactPhone.replace(/\D/g, "");
      const afterLen = phoneDigits.startsWith("90") ? phoneDigits.slice(2).length : phoneDigits.length;
      if (afterLen !== 10) throw new Error("Lütfen +90 ile başlayan geçerli bir iletişim numarası giriniz.");
      // Upload files if selected
      let uploaded: any = {};
      if (profileImageFile || driverLicenseFile || vehicleImageFile) {
        const fd = new FormData();
        if (profileImageFile) fd.append("profile_image", profileImageFile);
        if (driverLicenseFile) fd.append("driver_license", driverLicenseFile);
        if (vehicleImageFile) fd.append("vehicle_image", vehicleImageFile);
        const up = await api.post("/api/users/me/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploaded = up.data || {};
      }
      const payload = {
        full_name: fullName,
        email,
        identity_number: identityNumber,
        contact_phone: contactPhone,
        vehicle_plate: vehiclePlate,
        vehicle_model: vehicleModel,
        profile_image_url: uploaded.profile_image_url,
        driver_license_url: uploaded.driver_license_url,
        vehicle_image_url: uploaded.vehicle_image_url,
      };
      const res = await api.patch("/api/users/me", payload);
      const updated = res.data;
      const local = { id: updated.id, full_name: updated.full_name, role: updated.role, email: updated.email };
      localStorage.setItem("vip_user", JSON.stringify(local));
      toast.success("Profil güncellendi");
      // Go back to home since driver dashboard was removed
      window.location.href = "/";
  } catch (err: any) {
      toast.error(getErrorMessage(err));
  } finally {
    setLoading(false);
  }
  };

  return (
    <ProtectedRoute allowedRoles={["guest", "driver", "partner", "admin"]}>
      <Navbar />
      <main
        className="min-h-screen"
        style={{ background: "radial-gradient(ellipse at center, #0b0b0b, #000)" }}
      >
        <div className="mx-auto max-w-5xl px-6 py-12">
          <h1 className="font-cinzel text-4xl text-yellow-400 mb-8">Sürücü Profili Düzenleme</h1>

          <form onSubmit={onSubmit} className="space-y-8">
            {/* Kişisel Bilgiler */}
            <Card className="bg-black/40 backdrop-blur-lg border border-yellow-700/30 rounded-2xl shadow-[0_0_40px_rgba(199,160,64,0.2)] p-8">
              <CardHeader>
                <CardTitle className="font-cinzel text-yellow-400">Kişisel Bilgiler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-t border-yellow-700/30 mt-2 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input id="adsoyad" label="Ad Soyad" placeholder="Örn: Erdem Yaşar" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    <div>
                      <Input
                        id="eposta"
                        label="E-posta"
                        type="email"
                        placeholder="ornek@eposta.com"
                        value={email}
                        onChange={(e) => {
                          const v = e.target.value;
                          setEmail(v);
                          setEmailError(v && !validateEmail(v) ? "⚠️ Geçerli bir e-posta adresi giriniz." : null);
                        }}
                      />
                      {emailError ? <p className="text-xs text-yellow-300 mt-1">{emailError}</p> : null}
                    </div>
                    <div>
                      <Input
                        id="kimlik"
                        label="Kimlik Numarası"
                        placeholder="11 haneli TCKN"
                        value={identityNumber}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                          setIdentityNumber(digits);
                          setIdentityError(digits.length === 11 ? null : "⚠️ Geçerli bir T.C. Kimlik Numarası giriniz.");
                        }}
                      />
                      {identityError ? <p className="text-xs text-yellow-300 mt-1">{identityError}</p> : null}
                    </div>
                    <div>
                      <Input
                        id="telefon"
                        label="İletişim Numarası"
                        type="tel"
                        placeholder="+90 555 123 45 67"
                        value={contactPhone}
                        onChange={(e) => {
                          const { masked, digitsAfter } = formatTRPhone(e.target.value);
                          setContactPhone(masked);
                          setPhoneError(digitsAfter === 10 ? null : "Lütfen +90 ile başlayan geçerli bir iletişim numarası giriniz.");
                        }}
                      />
                      {phoneError ? <p className="text-xs text-yellow-300 mt-1">{phoneError}</p> : null}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Araç Bilgileri */}
            <Card className="bg-black/40 backdrop-blur-lg border border-yellow-700/30 rounded-2xl shadow-[0_0_40px_rgba(199,160,64,0.2)] p-8">
              <CardHeader>
                <CardTitle className="font-cinzel text-yellow-400">Araç Bilgileri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-t border-yellow-700/30 mt-2 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input id="plaka" label="Araç Plakası" placeholder="Örn: 34 ABC 123" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())} />
                    <Input id="model" label="Araç Modeli" placeholder="Örn: Mercedes Vito" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Belgeler */}
            <Card className="bg-black/40 backdrop-blur-lg border border-yellow-700/30 rounded-2xl shadow-[0_0_40px_rgba(199,160,64,0.2)] p-8">
              <CardHeader>
                <CardTitle className="font-cinzel text-yellow-400">Belgeler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-t border-yellow-700/30 mt-2 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Input
                        id="profilresmi"
                        label="Profil Resmi"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          const valid = validateAndPreviewFile(f, "profile");
                          setProfileImageFile(valid);
                        }}
                      />
                      {profileImageFile && profileImageFile.type === "application/pdf" ? (
                        <p className="mt-2 text-xs text-yellow-200/80">PDF yüklendi</p>
                      ) : previewProfile ? (
                        <img src={previewProfile} alt="Profil önizleme" className="mt-2 h-24 w-24 rounded-md object-cover border border-yellow-700/40" />
                      ) : null}
                    </div>
                    <div>
                      <Input
                        id="ehliyet"
                        label="Ehliyet Belgesi"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          const valid = validateAndPreviewFile(f, "license");
                          setDriverLicenseFile(valid);
                        }}
                      />
                      {driverLicenseFile && driverLicenseFile.type === "application/pdf" ? (
                        <p className="mt-2 text-xs text-yellow-200/80">PDF yüklendi</p>
                      ) : previewLicense ? (
                        <img src={previewLicense} alt="Ehliyet önizleme" className="mt-2 h-24 w-24 rounded-md object-cover border border-yellow-700/40" />
                      ) : null}
                    </div>
                    <div>
                      <Input
                        id="aracresmi"
                        label="Araç Resmi"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          const valid = validateAndPreviewFile(f, "vehicle");
                          setVehicleImageFile(valid);
                        }}
                      />
                      {vehicleImageFile && vehicleImageFile.type === "application/pdf" ? (
                        <p className="mt-2 text-xs text-yellow-200/80">PDF yüklendi</p>
                      ) : previewVehicle ? (
                        <img src={previewVehicle} alt="Araç önizleme" className="mt-2 h-24 w-24 rounded-md object-cover border border-yellow-700/40" />
                      ) : null}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-yellow-200/70">İpuçları: Yüklediğiniz dosyalar yalnızca profilinizde görüntülenir. Görseller için JPG/PNG önerilir, PDF de kabul edilir.</p>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="secondary" onClick={() => (window.location.href = "/driver?tab=profile")}>İptal</Button>
              {(() => {
                const requiredFilled = [fullName, email, identityNumber, contactPhone, vehiclePlate, vehicleModel].every((v) => v && v.trim());
                const emailOk = validateEmail(email);
                const idOk = identityNumber.replace(/\D/g, "").length === 11;
                const phoneOk = contactPhone.replace(/\D/g, "").startsWith("90")
                  ? contactPhone.replace(/\D/g, "").slice(2).length === 10
                  : contactPhone.replace(/\D/g, "").length === 10; // güvenli taraf
                const disable = loading || !requiredFilled || !emailOk || !idOk || !phoneOk;
                return <Button type="submit" loading={loading} disabled={disable}>Kaydet</Button>;
              })()}
            </div>
          </form>
        </div>
      </main>
    </ProtectedRoute>
  );
}