import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import type { Locale } from "@/i18n/routing";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <AuthSplitLayout locale={locale as Locale}>{children}</AuthSplitLayout>;
}
