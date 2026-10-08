import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { TeamForm } from "@/components/teams/team-form";
import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("common");

  const team = await fetchAuthed(api.teams.get, { id: id as Id<"teams"> });
  if (!team) notFound();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="font-display text-headline-sm uppercase text-chalk">{t("edit")}</h1>
      <TeamForm team={team} />
    </div>
  );
}
