import { getTranslations } from "next-intl/server";

import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { AssistantChat } from "@/components/assistant/assistant-chat";

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ matchId?: string; question?: string }>;
}) {
  const { matchId, question } = await searchParams;
  const t = await getTranslations("assistant");
  const tMatches = await getTranslations("matches");

  const [matches, opponents, pastRecommendations] = await Promise.all([
    fetchAuthed(api.matches.list, {}),
    fetchAuthed(api.opponents.list, {}),
    fetchAuthed(api.ai.listRecommendations, {}),
  ]);

  const opponentNames = new Map(
    ((opponents ?? []) as Doc<"opponents">[]).map((o) => [o._id, o.teamName]),
  );

  const matchOptions = ((matches ?? []) as Doc<"matches">[])
    .slice(0, 20)
    .map((m) => ({
      id: m._id as string,
      label: `${m.matchDate} — ${
        m.opponentId
          ? opponentNames.get(m.opponentId) ?? tMatches("unknownOpponent")
          : tMatches("unknownOpponent")
      }`,
    }));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="font-display text-headline-sm uppercase text-chalk">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <AssistantChat
        matches={matchOptions}
        defaultMatchId={matchId}
        defaultQuestion={question}
        pastRecommendations={pastRecommendations ?? []}
      />
    </div>
  );
}
