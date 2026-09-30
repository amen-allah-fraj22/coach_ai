import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PlayerForm } from "@/components/players/player-form";
import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";

export default async function NewPlayerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("players");

  const teams = ((await fetchAuthed(api.teams.list, {})) ?? []) as Doc<"teams">[];
  if (teams.length === 0) {
    redirect(`/${locale}/teams/new`);
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="font-display text-2xl uppercase tracking-tight">
        {t("addPlayer")}
      </h1>
      <PlayerForm teams={teams} />
    </div>
  );
}
