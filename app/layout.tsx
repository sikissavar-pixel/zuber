import type { Metadata } from "next";
import { Inter, Cinzel, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zuber • VIP Araç Transfer",
  description: "İstanbul'da premium, rezervasyonlu VIP sürücü deneyimi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} ${cinzel.variable} ${jetbrains.variable} antialiased vip-radial text-foreground overflow-x-hidden overflow-y-auto bg-black min-h-screen w-full max-w-[100vw]`}>
        <Providers>
          <div className="transition-all duration-500 ease-in-out relative">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
