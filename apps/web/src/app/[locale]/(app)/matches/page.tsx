import { getTranslations } from "next-intl/server";

import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";
import { MatchesLedger } from "@/components/matches/matches-ledger";

export default async function MatchesPage() {
  const t = await getTranslations("matches");

  const [matches, teams, opponents] = await Promise.all([
    fetchAuthed(api.matches.list, {}),
    fetchAuthed(api.teams.list, {}),
    fetchAuthed(api.opponents.list, {}),
  ]);

  const list = (matches ?? []) as Doc<"matches">[];
  const teamList = (teams ?? []) as Doc<"teams">[];
  const opponentNames = new Map(
    ((opponents ?? []) as Doc<"opponents">[]).map((o) => [o._id, o.teamName]),
  );

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="font-display text-headline-sm uppercase text-chalk">{t("title")}</h1>

      {teamList.length === 0 ? (
        <p className="text-muted-foreground">{t("emptyNeedsTeam")}</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/matches/new"
              className="flex items-center gap-3 border border-hairline-16 bg-slate-grass p-4 hover:border-chalk"
            >
              <Icon name="stadium" size={28} className="text-pitch-green" />
              <div>
                <p className="font-display uppercase text-chalk">{t("recordFixture")}</p>
                <p className="text-xs text-muted-foreground">{t("addMatch")}</p>
              </div>
            </Link>
            <Link
              href="/matches/import"
              className="flex items-center gap-3 border border-dashed border-hairline-16 p-4 hover:border-chalk"
            >
              <Icon name="upload_file" size={28} className="text-muted-foreground" />
              <div>
                <p className="font-display uppercase text-chalk">{t("batchImport")}</p>
                <p className="text-xs text-muted-foreground">{t("importMatch")}</p>
              </div>
            </Link>
          </div>

          {list.length === 0 ? (
            <p className="text-muted-foreground">{t("empty")}</p>
          ) : (
            <MatchesLedger matches={list} opponentNames={opponentNames} />
          )}
        </>
      )}
    </div>
  );
}
