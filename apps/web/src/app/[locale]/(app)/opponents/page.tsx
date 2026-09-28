import { getTranslations } from "next-intl/server";

import { getCurrentCoach } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { Opponent } from "@/lib/types/database";

export default async function OpponentsPage() {
  const t = await getTranslations("opponents");

  const current = await getCurrentCoach();
  if (!current) return null;

  const supabase = await createClient();
  const { data: opponents } = await supabase
    .from("opponents")
    .select("*")
    .eq("club_id", current.club.id)
    .order("team_name", { ascending: true });

  const list = (opponents as Opponent[] | null) ?? [];

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
            <li key={opponent.id}>
              <Link
                href={`/opponents/${opponent.id}`}
                className="flex items-center justify-between rounded-md border border-border px-4 py-3 hover:border-primary"
              >
                <span className="font-medium">{opponent.team_name}</span>
                <span className="text-sm text-muted-foreground">
                  {opponent.usual_formation}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
