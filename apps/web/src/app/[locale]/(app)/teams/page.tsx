import { getTranslations } from "next-intl/server";

import { getCurrentCoach } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { Team } from "@/lib/types/database";

export default async function TeamsPage() {
  const t = await getTranslations("teams");

  const current = await getCurrentCoach();
  if (!current) return null;

  const supabase = await createClient();
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .eq("club_id", current.club.id)
    .order("created_at", { ascending: true });

  const list = (teams as Team[] | null) ?? [];

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

      {list.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((team) => (
            <li key={team.id}>
              <Link
                href={`/teams/${team.id}`}
                className="flex items-center justify-between rounded-md border border-border px-4 py-3 hover:border-primary"
              >
                <span className="font-medium">{team.name}</span>
                <span className="text-sm text-muted-foreground">
                  {[team.age_category, team.default_formation]
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
