import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-context";
import { ThemeProvider, themeScript } from "@/components/theme-provider";
import { site } from "@/lib/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "A2 ghee",
    "bilona ghee",
    "raw honey",
    "herbal hair oil",
    "handmade soap",
    "organic products India",
    "Gaudham",
  ],
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: siteUrl,
    siteName: site.name,
    images: [{ url: "/assets/images/banner.jpg", width: 1800, height: 1200 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ["/assets/images/banner.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FFF8EF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh">
        <Script id="theme-init" strategy="beforeInteractive">{themeScript}</Script>
        <ThemeProvider>
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
