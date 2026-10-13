import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { OpponentForm } from "@/components/opponents/opponent-form";
import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export default async function EditOpponentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("common");

  const opponent = await fetchAuthed(api.opponents.get, {
    id: id as Id<"opponents">,
  });
  if (!opponent) notFound();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="font-display text-headline-sm uppercase text-chalk">{t("edit")}</h1>
      <OpponentForm opponent={opponent} />
    </div>
  );
}
