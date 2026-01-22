import type { Metadata } from "next";
import { Bodoni_Moda, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import GhostLayer from '@/components/GhostLayer';
import UrlMasker from '@/components/UrlMasker';
import { Suspense } from 'react';

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "BOŞLUK",
  description: "Karanlığa gir. Bilinmeyeni kucakla.",
  keywords: ["boşluk", "karanlık", "bilinmeyen", "inisyasyon"],
  authors: [{ name: "BOŞLUK" }],
  openGraph: {
    title: "BOŞLUK",
    description: "Karanlığa gir. Bilinmeyeni kucakla.",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${bodoniModa.variable} ${jetbrainsMono.variable} antialiased`}
        style={{
          fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
        }}
      >
        <GhostLayer />
        <Suspense fallback={null}>
          <UrlMasker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
