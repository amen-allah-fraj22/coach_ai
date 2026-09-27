import { getTranslations } from "next-intl/server";

import { SignupForm } from "@/components/auth/signup-form";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("auth");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4 border-b border-border pb-3 text-sm font-medium">
        <Link href="/login" className="text-muted-foreground hover:text-foreground">
          {t("loginTab")}
        </Link>
        <span className="text-primary">{t("signupTab")}</span>
      </div>

      <SignupForm locale={locale} />

      <p className="text-center text-sm text-muted-foreground">{t("hasInvite")}</p>
    </div>
  );
}
