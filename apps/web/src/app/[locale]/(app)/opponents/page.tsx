import { getTranslations } from "next-intl/server";

import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function OpponentsPage() {
  const t = await getTranslations("opponents");
  const opponents = ((await fetchAuthed(api.opponents.list, {})) ?? []) as Doc<"opponents">[];
  const list = [...opponents].sort((a, b) => a.teamName.localeCompare(b.teamName));

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase tracking-tight">
          {t("title")}
        </h1>
        <Button asChild>
          <Link href="/opponents/new">{t("addOpponent")}</Link>
        </Button>
      </div>

      {list.length === 0 ? (
        <p className="text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((opponent) => (
            <li key={opponent._id}>
              <Link
                href={`/opponents/${opponent._id}`}
                className="flex items-center justify-between rounded-md border border-border px-4 py-3 hover:border-primary"
              >
                <span className="font-medium">{opponent.teamName}</span>
                <span className="text-sm text-muted-foreground">
                  {opponent.usualFormation}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
