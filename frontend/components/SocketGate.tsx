"use client";
import React, { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { useSocketConnection } from "@/hooks/useSocketConnection";
import { reconnectSocket } from "@/lib/socket";

type Props = React.PropsWithChildren<{}>;

const SocketGate: React.FC<Props> = ({ children }) => {
  const { status, error } = useSocketConnection(true);
  const [isNative] = useState(() => (typeof window === "undefined" ? false : Capacitor.isNativePlatform()));
  const [allowFallback, setAllowFallback] = useState(false);

  useEffect(() => {
    if (status === "connected") {
      setAllowFallback(false);
    }
  }, [status]);

  const shouldWaitForSocket = isNative && !allowFallback && (status === "idle" || status === "connecting");
  const shouldShowError = isNative && !allowFallback && status === "error";

  if (!isNative) {
    return <>{children}</>;
  }

  if (shouldWaitForSocket) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-yellow-100">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-yellow-500/60 border-t-transparent" />
        <p className="mt-4 text-sm text-yellow-200/80">Canlı bağlantı hazırlanıyor...</p>
      </div>
    );
  }

  if (shouldShowError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-yellow-100">
        <p className="text-lg font-semibold">Socket bağlantısı kurulamadı</p>
        <p className="mt-2 text-sm text-yellow-200/70">{error || "Anlık güncellemeler şu anda erişilemiyor."}</p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
          <button
            onClick={() => reconnectSocket()}
            className="rounded-xl border border-yellow-500/60 bg-yellow-500/20 px-4 py-2 text-yellow-50 transition hover:bg-yellow-500/30"
          >
            Tekrar dene
          </button>
          <button
            onClick={() => setAllowFallback(true)}
            className="rounded-xl border border-zinc-700 bg-transparent px-4 py-2 text-zinc-200 transition hover:text-white"
          >
            Socket olmadan devam et
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {allowFallback && status !== "connected" && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-yellow-500/40 bg-black/80 px-4 py-3 text-sm text-yellow-100 shadow-xl">
          Canlı socket bağlantısı kurulamadı. Veriler otomatik güncellenmeyecek.
        </div>
      )}
      {children}
    </>
  );
};

export default SocketGate;
