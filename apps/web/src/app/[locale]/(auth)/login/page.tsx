import { getTranslations } from "next-intl/server";

import { LoginForm } from "@/components/auth/login-form";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("auth");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4 border-b border-border pb-3 text-sm font-medium">
        <span className="text-primary">{t("loginTab")}</span>
        <Link href="/signup" className="text-muted-foreground hover:text-foreground">
          {t("signupTab")}
        </Link>
      </div>

      <LoginForm locale={locale} />
    </div>
  );
}
