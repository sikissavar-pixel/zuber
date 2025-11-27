import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { PWAInitializer } from "@/components/PWAInitializer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zuber • VIP Araç Transfer",
  description: "İstanbul'da premium, rezervasyonlu VIP sürücü deneyimi.",
  manifest: "/manifest.json",
  themeColor: "#050505",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Zuber",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <html lang="tr">
      <body className={`${inter.variable} ${cinzel.variable} antialiased vip-radial text-foreground overflow-x-hidden overflow-y-auto bg-black min-h-screen w-full max-w-[100vw]`}>
        {googleMapsKey ? (
          <Script
            id="google-maps-api"
            strategy="beforeInteractive"
            src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}&libraries=places`}
          />
        ) : (
          <Script
            id="google-maps-missing"
            strategy="afterInteractive"
          >{`console.warn("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not configured; Google Maps may fail to render.");`}</Script>
        )}
        <Providers>
          <div className="transition-all duration-500 ease-in-out relative">
            <PWAInitializer />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
