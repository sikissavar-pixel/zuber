"use client";

import React, { useState } from "react";
import { Settings as SettingsIcon, DollarSign, X, AlertTriangle, MapPin, Wrench } from "lucide-react";
import { toast } from "sonner";
import api from "../../../../lib/api";
import { Loader2 } from "lucide-react";

export default function AdminSettings() {
  const [loading, setLoading] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    commission_rate: "",
    min_ride_price: "",
    cancel_penalty: "",
    driver_radius: "",
    maintenance_mode: false,
  });

  const handleSave = async (key: string, value: any) => {
    setLoading(key);
    try {
      await api.patch("/api/system/settings", { [key]: value });
      toast.success("Ayar güncellendi.");
      setSettings((prev) => ({ ...prev, [key]: value }));
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Güncelleme başarısız.");
    } finally {
      setLoading(null);
    }
  };

  const settingGroups = [
    {
      title: "Finansal Ayarlar",
      icon: DollarSign,
      settings: [
        {
          key: "commission_rate",
          label: "Komisyon Oranı (%)",
          value: settings.commission_rate,
          type: "number",
          placeholder: "15",
        },
        {
          key: "min_ride_price",
          label: "Minimum Yolculuk Ücreti (₺)",
          value: settings.min_ride_price,
          type: "number",
          placeholder: "50",
        },
        {
          key: "cancel_penalty",
          label: "İptal Cezası (₺)",
          value: settings.cancel_penalty,
          type: "number",
          placeholder: "10",
        },
      ],
    },
    {
      title: "Operasyonel Ayarlar",
      icon: MapPin,
      settings: [
        {
          key: "driver_radius",
          label: "Sürücü Arama Yarıçapı (km)",
          value: settings.driver_radius,
          type: "number",
          placeholder: "10",
        },
      ],
    },
    {
      title: "Sistem Ayarları",
      icon: Wrench,
      settings: [
        {
          key: "maintenance_mode",
          label: "Bakım Modu",
          value: settings.maintenance_mode,
          type: "toggle",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl text-[#f5d47d] mb-2">Sistem Ayarları</h2>
        <p className="text-sm text-zinc-400">Platform ayarlarını yönetin</p>
      </div>

      {settingGroups.map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.title} className="rounded-3xl border border-[#3a2a0f] bg-[#050302]/80 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <Icon className="h-5 w-5 text-[#f5c76a]" />
              <h3 className="font-cinzel text-xl text-[#f5d47d]">{group.title}</h3>
            </div>
            <div className="space-y-4">
              {group.settings.map((setting) => (
                <div key={setting.key} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl border border-[#3a2a0f] bg-black/40">
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-white mb-1 block">{setting.label}</label>
                    {setting.type === "toggle" ? (
                      <p className="text-xs text-zinc-400">{setting.value ? "Aktif" : "Pasif"}</p>
                    ) : (
                      <input
                        type={setting.type}
                        value={setting.value}
                        onChange={(e) => setSettings((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                        placeholder={setting.placeholder}
                        className="w-full rounded-xl border border-[#3a2a0f] bg-transparent px-4 py-2 text-sm text-white placeholder:text-[#8b7442] focus:border-[#f5c76a] focus:outline-none"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (setting.type === "toggle") {
                        handleSave(setting.key, !setting.value);
                      } else {
                        handleSave(setting.key, setting.value);
                      }
                    }}
                    disabled={loading === setting.key}
                    className="rounded-xl border border-[#f5c76a]/60 bg-gradient-to-r from-[#fbd483] to-[#f3b94f] px-6 py-2 text-sm font-semibold text-black hover:from-[#f5c76a] hover:to-[#f3b94f] disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]"
                  >
                    {loading === setting.key ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Kaydediliyor
                      </>
                    ) : (
                      "Kaydet"
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

