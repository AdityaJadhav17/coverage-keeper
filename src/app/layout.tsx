import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Source_Serif_4 } from "next/font/google";
import type { ReactNode } from "react";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

// Designed for low-vision readers; fits users reading dense government letters.
const font = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
});

// Headings only: a warm serif that reads approachable (docs/design/2026-11-03-rebrand.md).
const serif = Source_Serif_4({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "Coverage Keeper",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Coverage Keeper",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1520" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={serif.variable}>
      <body className={font.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
