"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Elements, useElements, useStripe, CardElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "../ui/Button";
import { useCreateStripeIntent } from "../../hooks/usePayments";

type Props = {
  reservationId: number;
  amount: number; // in major units
  currency?: string; // default usd
  onClose: () => void;
  onSuccess: () => void;
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

const InnerCheckout: React.FC<Props> = ({ reservationId, amount, currency = "usd", onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const createIntent = useCreateStripeIntent();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    try {
      const { client_secret } = await createIntent.mutateAsync({ reservation_id: reservationId, amount, currency });
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("No card element");
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: { card },
      });
      if (result.error) {
        setError(result.error.message || "Ödeme başarısız");
      } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        onSuccess();
        onClose();
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="soft-border rounded-lg bg-zinc-900 w-full max-w-md p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--gold)]">Ödeme</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>
        <p className="text-sm text-zinc-300">Ödenecek Tutar: {amount.toFixed(2)} {currency.toUpperCase()}</p>
        <div className="soft-border rounded p-2">
          <CardElement options={{ hidePostalCode: true }} />
        </div>
        {error && <p className="text-rose-400 text-sm">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button onClick={onPay} disabled={loading || createIntent.isPending}>{loading ? "İşleniyor..." : "Şimdi Öde"}</Button>
          <Button variant="secondary" onClick={onClose}>İptal</Button>
        </div>
      </div>
    </div>
  );
};

export const StripeCheckoutModal: React.FC<Props> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <InnerCheckout {...props} />
    </Elements>
  );
};

export default StripeCheckoutModal;