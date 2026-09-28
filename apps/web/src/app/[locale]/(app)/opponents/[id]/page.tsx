import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { OpponentForm } from "@/components/opponents/opponent-form";
import { createClient } from "@/lib/supabase/server";
import type { Opponent } from "@/lib/types/database";

export default async function EditOpponentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("common");

  const supabase = await createClient();
  const { data: opponent } = await supabase
    .from("opponents")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!opponent) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="font-display text-2xl uppercase tracking-tight">
        {t("edit")}
      </h1>
      <OpponentForm locale={locale} opponent={opponent as Opponent} />
    </div>
  );
}
