import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PlayerForm } from "@/components/players/player-form";
import { getCurrentCoach } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Player, Team } from "@/lib/types/database";

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("common");

  const current = await getCurrentCoach();
  if (!current) return null;

  const supabase = await createClient();
  const [{ data: player }, { data: teams }] = await Promise.all([
    supabase.from("players").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("teams")
      .select("*")
      .eq("club_id", current.club.id)
      .order("created_at", { ascending: true }),
  ]);

  if (!player) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="font-display text-2xl uppercase tracking-tight">
        {t("edit")}
      </h1>
      <PlayerForm
        locale={locale}
        teams={(teams as Team[] | null) ?? []}
        player={player as Player}
      />
    </div>
  );
}
