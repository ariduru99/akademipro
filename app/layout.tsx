import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSiteOrigin } from "@/lib/siteUrl";

const SITE_URL = getSiteOrigin();
const SITE_NAME = "Akademi Pro";
const DESCRIPTION =
  "Akademi Pro: Eğitmenler, öğrenciler ve veliler için ders programı, ödeme takibi, mesajlaşma ve canlı sınıf yönetimi. Tek platformda eğitim merkezi.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Özel Ders & LMS Platformu`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Akademi Pro",
    "özel ders",
    "online ders",
    "eğitim platformu",
    "LMS",
    "öğretmen",
    "veli iletişim",
    "ders programı",
    "öğrenci yönetimi",
    "ödeme takibi",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Eğitim Sürecinizi Tek Merkezden Yönetin`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Özel Ders & LMS Platformu`,
    description: DESCRIPTION,
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon-180.svg" }],
  },
  manifest: "/manifest.webmanifest",
  formatDetection: {
    email: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4f46e5",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
