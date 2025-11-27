"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { GlassCard } from "@/components/driver/ui";
import {
  Award,
  CalendarDays,
  Car,
  FileCheck2,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";

type DriverProfile = {
  id: number;
  full_name: string;
  email: string;
  identity_number?: string;
  contact_phone?: string;
  vehicle_plate?: string;
  vehicle_model?: string;
  profile_image_url?: string;
  driver_license_url?: string;
  vehicle_image_url?: string;
  created_at: string;
};

export default function DriverProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchProfile() {
      try {
        const res = await api.get("/api/users/me");
        if (mounted) setProfile(res.data);
      } catch {
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const membership = useMemo(() => {
    if (!profile?.created_at) return null;
    const created = new Date(profile.created_at);
    const diffDays = Math.max(0, Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)));
    const years = (diffDays / 365).toFixed(1);
    return { created, years };
  }, [profile?.created_at]);

  return (
    <div className="space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <GlassCard variant="premium" className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffcc33]/60 to-[#ff8c00]/40 border border-[#ffcc33]/50 text-[#050301]">
            <User className="h-8 w-8" />
            <div className="absolute inset-0 rounded-2xl border border-white/10" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#ffcc33]/80">Sürücü Profili</p>
            <h1 className="font-cinzel text-2xl text-white">{profile?.full_name || user?.full_name || "Sürücü"}</h1>
            <p className="text-sm text-[#c3b27a]">
              VIP Filosu · {membership ? `${membership.years}+ yıl` : "Yeni üye"}
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-wrap gap-4 lg:justify-end">
          <div className="rounded-2xl border border-[#ffcc33]/30 bg-[#0b0b0b]/60 px-4 py-2 text-sm text-[#f1d59f] flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#ffcc33]" />
            Yetkili sürücü
          </div>
          <div className="rounded-2xl border border-[#ffcc33]/30 bg-[#0b0b0b]/60 px-4 py-2 text-sm text-[#f1d59f] flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#ffcc33]" />
            {membership ? `Kayıt: ${membership.created.toLocaleDateString("tr-TR")}` : "Bekleniyor"}
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard variant="default" className="lg:col-span-2">
          <div className="flex items-center justify-between pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[#ffcc33]/70">Kişisel bilgiler</p>
              <h2 className="text-xl font-semibold text-white">İletişim & Kimlik</h2>
            </div>
            <Link
              href="/profile"
              className="rounded-xl border border-[#ffcc33]/40 px-4 py-2 text-sm text-[#ffcc33] hover:bg-[#ffcc33]/10"
            >
              Profili güncelle
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoRow icon={Mail} label="E-posta" value={profile?.email || "—"} />
            <InfoRow icon={Phone} label="Telefon" value={profile?.contact_phone || "—"} />
            <InfoRow icon={IdCard} label="Kimlik No" value={profile?.identity_number || "—"} />
            <InfoRow icon={MapPin} label="Merkez" value="İstanbul, Türkiye" />
          </div>
        </GlassCard>

        <GlassCard variant="highlight">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-[#ffcc33]/70">Hızlı aksiyonlar</p>
            <ActionButton href="/driver/security" label="Güvenlik ayarları" icon={Shield} />
            <ActionButton href="/driver/qr-verification" label="QR doğrula" icon={FileCheck2} />
            <ActionButton href="/driver/open-reservations" label="Açık rezervasyonlar" icon={Award} />
          </div>
        </GlassCard>
      </div>

      <GlassCard variant="default">
        <div className="flex items-center justify-between pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#ffcc33]/70">Araç & belgeler</p>
            <h2 className="text-xl font-semibold text-white">VIP araç bilgileri</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <InfoTile icon={Car} title="Araç Modeli" value={profile?.vehicle_model || "Tanımlı değil"} />
          <InfoTile icon={IdCard} title="Plaka" value={profile?.vehicle_plate || "Tanımlı değil"} />
          <InfoTile icon={FileCheck2} title="Ehliyet & belgeler" value={profile?.driver_license_url ? "Yüklendi" : "Bekliyor"} />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <DocumentPreview title="Profil Fotoğrafı" url={profile?.profile_image_url} />
          <DocumentPreview title="Ehliyet" url={profile?.driver_license_url} />
          <DocumentPreview title="Araç Görseli" url={profile?.vehicle_image_url} />
        </div>
      </GlassCard>

      <GlassCard variant="warning" className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#ffcc33]/80">Durum</p>
          <h3 className="text-lg font-semibold text-white">Bilgilerinizi güncel tutun</h3>
          <p className="text-sm text-[#f5dca8]">
            Rezervasyon eşleşmelerinde öncelik almak için iletişim ve araç evraklarınızı eksiksiz doldurun.
          </p>
        </div>
        <Link
          href="/profile"
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#ffb400] to-[#ffcc33] px-5 py-3 text-sm font-semibold text-black"
        >
          Profili düzenle
        </Link>
      </GlassCard>

      {loading && (
        <div className="text-center text-sm text-[#b59d5a]">Profil bilgileriniz yükleniyor...</div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/20 px-4 py-3 flex items-center gap-3">
      <div className="rounded-xl bg-[#ffcc33]/15 p-2">
        <Icon className="h-4 w-4 text-[#ffcc33]" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-[#a68a3a]">{label}</p>
        <p className="text-sm text-white">{value}</p>
      </div>
    </div>
  );
}

function ActionButton({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Shield }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-[#ffcc33]/25 bg-[#0b0b0b]/50 px-4 py-3 text-sm text-[#f1d59f] hover:border-[#ffcc33]/60"
    >
      <Icon className="h-4 w-4 text-[#ffcc33]" />
      {label}
    </Link>
  );
}

function InfoTile({ icon: Icon, title, value }: { icon: typeof Car; title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#ffcc33]/15 bg-black/30 px-4 py-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[#ffcc33]">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-widest">{title}</span>
      </div>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}

function DocumentPreview({ title, url }: { title: string; url?: string }) {
  return (
    <div className="rounded-2xl border border-[#ffcc33]/15 bg-black/30 p-4">
      <p className="text-xs uppercase tracking-[0.4em] text-[#ffcc33]/70">{title}</p>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm text-[#ffcc33] underline">
          Görüntüle
        </a>
      ) : (
        <p className="mt-3 text-sm text-[#cfcfcf]">Henüz yüklenmedi</p>
      )}
    </div>
  );
}

