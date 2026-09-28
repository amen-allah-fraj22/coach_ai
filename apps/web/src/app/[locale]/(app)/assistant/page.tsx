import { getTranslations } from "next-intl/server";

import { getCurrentCoach } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AssistantChat } from "@/components/assistant/assistant-chat";
import type { Match, Opponent } from "@/lib/types/database";

export default async function AssistantPage() {
  const t = await getTranslations("assistant");
  const tMatches = await getTranslations("matches");

  const current = await getCurrentCoach();
  if (!current) return null;

  const supabase = await createClient();
  const [{ data: matches }, { data: opponents }] = await Promise.all([
    supabase
      .from("matches")
      .select("id, match_date, opponent_id")
      .eq("club_id", current.club.id)
      .order("match_date", { ascending: false })
      .limit(20),
    supabase.from("opponents").select("id, team_name").eq("club_id", current.club.id),
  ]);

  const opponentNames = new Map(
    ((opponents as Pick<Opponent, "id" | "team_name">[] | null) ?? []).map((o) => [
      o.id,
      o.team_name,
    ]),
  );

  const matchOptions = (
    (matches as Pick<Match, "id" | "match_date" | "opponent_id">[] | null) ?? []
  ).map((m) => ({
    id: m.id,
    label: `${m.match_date} — ${
      m.opponent_id
        ? opponentNames.get(m.opponent_id) ?? tMatches("unknownOpponent")
        : tMatches("unknownOpponent")
    }`,
  }));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <AssistantChat matches={matchOptions} />
    </div>
  );
}
