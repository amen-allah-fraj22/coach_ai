import { getTranslations } from "next-intl/server";

import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { OpponentsList } from "@/components/opponents/opponents-list";

export default async function OpponentsPage() {
  const t = await getTranslations("opponents");
  const opponents = ((await fetchAuthed(api.opponents.list, {})) ?? []) as Doc<"opponents">[];
  const list = [...opponents].sort((a, b) => a.teamName.localeCompare(b.teamName));

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="font-display text-headline-sm uppercase text-chalk">
        {t("opponentIntelligence")}
      </h1>

      {list.length === 0 && <p className="text-muted-foreground">{t("empty")}</p>}
      <OpponentsList opponents={list} />
    </div>
  );
}
