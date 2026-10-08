import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ImportMatches } from "@/components/matches/import-matches";
import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";

export default async function ImportMatchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("matches");

  const teams = ((await fetchAuthed(api.teams.list, {})) ?? []) as Doc<"teams">[];
  if (teams.length === 0) {
    redirect(`/${locale}/teams/new`);
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="font-display text-headline-sm uppercase text-chalk">
        {t("importTitle")}
      </h1>
      <ImportMatches teams={teams} />
    </div>
  );
}
