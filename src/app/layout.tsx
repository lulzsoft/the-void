import type { Metadata } from "next";
import { Bodoni_Moda, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import GhostLayer from '@/components/GhostLayer';
import UrlMasker from '@/components/UrlMasker';
import NotificationCenter from '@/components/NotificationCenter';
import GlobalHUD from '@/components/ui/GlobalHUD';
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
  metadataBase: new URL('https://bosluk.vercel.app'),
  title: {
    default: "BOŞLUK - Elite Professional Network",
    template: "%s |BOŞLUK"
  },
  description: "Elite profesyonel network. Güçlü squad'lar oluştur, büyük mission'lara katıl. Bireysel yetenek + Kolektif güç = Başarı.",
  keywords: ["professional network", "freelance", "squad", "mission", "elite network", "collaboration", "remote work", "boşluk"],
  authors: [{ name: "BOŞLUK" }],
  creator: "BOŞLUK",
  publisher: "BOŞLUK",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://bosluk.vercel.app",
    title: "BOŞLUK - Elite Professional Network",
    description: "Elite profesyonel network. Squad'lar oluştur, mission'lara katıl.",
    siteName: "BOŞLUK",
  },
  twitter: {
    card: "summary_large_image",
    title: "BOŞLUK - Elite Professional Network",
    description: "Elite profesyonel network. Squad'lar oluştur, mission'lara katıl.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
          <NotificationCenter />
          <UrlMasker />
        </Suspense>
        <GlobalHUD>
          {children}
        </GlobalHUD>
      </body>
    </html>
  );
}
