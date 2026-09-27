import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic, Archivo_Black } from "next/font/google";

import { routing, rtlLocales, type Locale } from "@/i18n/routing";
import "../globals.css";

const bodyLatin = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-body",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const display = Archivo_Black({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });
  return {
    title: t("name"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const dir = rtlLocales.includes(locale as Locale) ? "rtl" : "ltr";
  const bodyFont = locale === "ar" ? bodyArabic : bodyLatin;

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${bodyFont.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
