import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { DemoBanner } from "@/components/shared/demo-banner";
import { NewsTicker } from "@/components/shared/news-feed";
import "../globals.css";

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1E3A8A", /* --color-primary */
};

export const metadata: Metadata = {
  title: "Lebanon Relief — Humanitarian Coordination",
  description:
    "Connecting displaced people with volunteers and organizations who can help.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://lebanon-crises.vercel.app"
  ),
  openGraph: {
    title: "Lebanon Relief — Humanitarian Coordination",
    description:
      "Connecting displaced people with volunteers and organizations who can help.",
    siteName: "Lebanon Relief",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lebanon Relief — Humanitarian Coordination",
    description:
      "Connecting displaced people with volunteers and organizations who can help.",
    images: ["/opengraph-image"],
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        {recaptchaSiteKey && (
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
            strategy="lazyOnload"
          />
        )}
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <DemoBanner />
          {children}
          <NewsTicker />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
