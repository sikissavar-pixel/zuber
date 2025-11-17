"use client";
import React from "react";

type StatusProps = {
  status:
    | "pending"
    | "assigned"
    | "in_progress"
    | "in_progress_verified"
    | "completed_unpaid"
    | "completed_paid"
    | "completed"
    | "cancelled";
};

const colorMap: Record<StatusProps["status"], string> = {
  pending: "bg-yellow-600/20 text-yellow-400",
  assigned: "bg-blue-600/20 text-blue-400",
  in_progress: "bg-emerald-600/20 text-emerald-400",
  in_progress_verified: "bg-indigo-600/20 text-indigo-400",
  completed_unpaid: "bg-yellow-800/20 text-yellow-300",
  completed_paid: "bg-zinc-600/20 text-zinc-300",
  completed: "bg-zinc-600/20 text-zinc-300",
  cancelled: "bg-rose-600/20 text-rose-400",
};

export const StatusBadge: React.FC<StatusProps> = ({ status }) => {
  const labelMap: Record<StatusProps["status"], string> = {
    pending: "Beklemede",
    assigned: "Atandı",
    in_progress: "Devam ediyor",
    in_progress_verified: "QR Onaylı",
    completed_unpaid: "Tamamlandı (Ödeme Bek.)",
    completed_paid: "Tamamlandı (Ödendi)",
    completed: "Tamamlandı",
    cancelled: "İptal edildi",
  };
  return <span className={`inline-block px-2 py-1 text-xs rounded ${colorMap[status]} soft-border`}>{labelMap[status]}</span>;
};

type PaymentProps = { payment_status: "unpaid" | "paid" };
const paymentColorMap: Record<PaymentProps["payment_status"], string> = {
  unpaid: "bg-rose-600/20 text-rose-400",
  paid: "bg-emerald-600/20 text-emerald-400",
};

export const PaymentBadge: React.FC<PaymentProps> = ({ payment_status }) => {
  const label = payment_status === "paid" ? "Ödendi" : "Ödenmedi";
  return <span className={`inline-block px-2 py-1 text-xs rounded ${paymentColorMap[payment_status]} soft-border`}>{label}</span>;
};

export default StatusBadge;