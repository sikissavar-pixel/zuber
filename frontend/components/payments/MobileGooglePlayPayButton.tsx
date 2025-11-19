"use client";
import React, { useMemo, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Button } from "../ui/Button";
import api from "../../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { purchaseProduct } from "../../lib/googleplay";
import { getErrorMessage } from "../../lib/utils";

type Props = {
  reservation: {
    id: number;
    total_amount?: number | string;
    payment_status?: string;
  };
};

export const MobileGooglePlayPayButton: React.FC<Props> = ({ reservation }) => {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNative = useMemo(() => Capacitor.isNativePlatform(), []);

  if (!isNative) return null;
  if (reservation.payment_status === "paid") return null;

  const handlePay = async () => {
    setError(null);
    setLoading(true);
    try {
      const productId = process.env.NEXT_PUBLIC_GOOGLE_PRODUCT_ID || "vip_ride_001";
      const { purchaseToken } = await purchaseProduct(productId);

      const { data } = await api.post("/api/payments/googleplay/verify", {
        reservation_id: reservation.id,
        product_id: productId,
        purchase_token: purchaseToken,
      });
      if (data && data.ok) {
        // Refresh reservations lists (our hooks use keys: ["reservations","me"] and ["reservations","admin"]) 
        qc.invalidateQueries({ queryKey: ["reservations", "me"] });
        qc.invalidateQueries({ queryKey: ["reservations", "admin"] });
      }
    } catch (e: any) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button variant="primary" disabled={loading} onClick={handlePay}>
        {loading ? "İşleniyor..." : "Google Play ile Öde"}
      </Button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default MobileGooglePlayPayButton;