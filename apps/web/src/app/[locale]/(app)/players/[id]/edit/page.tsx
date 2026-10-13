import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PlayerForm } from "@/components/players/player-form";
import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("common");

  const [player, teams] = await Promise.all([
    fetchAuthed(api.players.get, { id: id as Id<"players"> }),
    fetchAuthed(api.teams.list, {}),
  ]);

  if (!player) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="font-display text-headline-sm uppercase text-chalk">{t("edit")}</h1>
      <PlayerForm teams={(teams ?? []) as Doc<"teams">[]} player={player} />
    </div>
  );
}
