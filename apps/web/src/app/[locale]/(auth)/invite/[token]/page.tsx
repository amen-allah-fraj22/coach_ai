import { getTranslations } from "next-intl/server";

import { InviteAcceptForm } from "@/components/auth/invite-accept-form";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/routing";

interface InviteInfo {
  club_name: string;
  email: string;
  status: "pending" | "accepted" | "expired" | "revoked";
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ locale: Locale; token: string }>;
}) {
  const { locale, token } = await params;
  const t = await getTranslations("auth");

  const supabase = await createClient();
  const { data } = await supabase
    .rpc("get_invite_info", { invite_token: token })
    .maybeSingle<InviteInfo>();

  if (!data || data.status !== "pending") {
    return <p className="text-sm text-destructive">{t("inviteExpired")}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl uppercase tracking-tight">
        {t("inviteTitle", { club: data.club_name })}
      </h1>

      <InviteAcceptForm locale={locale} token={token} email={data.email} />
    </div>
  );
}
