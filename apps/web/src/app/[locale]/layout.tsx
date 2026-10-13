import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic, Anton, Noto_Kufi_Arabic } from "next/font/google";

import { routing, rtlLocales, type Locale } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import "material-symbols/outlined.css";
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

// Anton has no Arabic glyphs, so Arabic locales get Noto Kufi Arabic at a
// heavy weight as the display-font substitute (design-implementation-plan
// §2, "Fonts"). Both write to the same --font-display variable, chosen per
// locale below, mirroring how the body fonts already do this.
const displayLatin = Anton({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const displayArabic = Noto_Kufi_Arabic({
  variable: "--font-display",
  subsets: ["arabic"],
  weight: ["800", "900"],
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
  const isArabic = locale === "ar";
  const bodyFont = isArabic ? bodyArabic : bodyLatin;
  const displayFont = isArabic ? displayArabic : displayLatin;

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
