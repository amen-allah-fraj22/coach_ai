import { notFound } from "next/navigation";

import { OpponentDossier } from "@/components/opponents/opponent-dossier";
import { fetchAuthed } from "@/lib/convex/server";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

export default async function OpponentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const opponent = await fetchAuthed(api.opponents.get, { id: id as Id<"opponents"> });
  if (!opponent) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <OpponentDossier opponent={opponent} />
    </div>
  );
}
