import { getTranslations } from "next-intl/server";

import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function TeamsPage() {
  const t = await getTranslations("teams");
  const teams = (await fetchAuthed(api.teams.list, {})) ?? [];

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase tracking-tight">
          {t("title")}
        </h1>
        <Button asChild>
          <Link href="/teams/new">{t("addTeam")}</Link>
        </Button>
      </div>

      {teams.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {teams.map((team: Doc<"teams">) => (
            <li key={team._id}>
              <Link
                href={`/teams/${team._id}`}
                className="flex items-center justify-between rounded-md border border-border px-4 py-3 hover:border-primary"
              >
                <span className="font-medium">{team.name}</span>
                <span className="text-sm text-muted-foreground">
                  {[team.ageCategory, team.defaultFormation]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
