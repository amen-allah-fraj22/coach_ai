import { getTranslations } from "next-intl/server";

import type { Doc } from "@convex/_generated/dataModel";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Monogram } from "@/components/dashboard/monogram";

export async function OpponentDossier({ opponent }: { opponent: Doc<"opponents"> }) {
  const t = await getTranslations("opponents");
  const tCommon = await getTranslations("common");

  const styleLines = [
    opponent.playingStyle,
    opponent.pressingStyle,
    opponent.buildUpStyle,
    opponent.defensiveStyle,
  ].filter(Boolean);

  const sections = [
    { key: "style", title: t("sectionStyle"), tint: "bg-chalk text-night-pitch", body: styleLines.join(" · ") || null },
    { key: "strengths", title: t("sectionStrengths"), tint: "bg-wash-green text-chalk", body: opponent.strengths, mark: "✓" },
    { key: "weaknesses", title: t("sectionWeaknesses"), tint: "bg-wash-red text-chalk", body: opponent.weaknesses, mark: "✕" },
    { key: "setPieces", title: t("sectionSetPieces"), tint: "bg-slate-grass text-chalk", body: opponent.setPieceNotes },
  ];

  const askQuestion = encodeURIComponent(`How do we beat ${opponent.teamName}?`);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/opponents" className="text-sm text-muted-foreground hover:text-chalk">
        ← {t("title")}
      </Link>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Monogram name={opponent.teamName} />
          <div>
            <h1 className="font-display text-headline-md uppercase text-chalk">
              {opponent.teamName}
            </h1>
            <p className="text-sm text-muted-foreground">{opponent.usualFormation ?? "—"}</p>
          </div>
        </div>
        <Link href={`/opponents/${opponent._id}/edit`} className="text-sm text-muted-foreground hover:text-chalk">
          {tCommon("edit")}
        </Link>
      </div>

      <Button asChild variant="primary">
        <Link href={`/assistant?question=${askQuestion}`}>{t("deployCounterTactics")}</Link>
      </Button>

      {/* Mobile: accordion sections */}
      <div className="flex flex-col gap-2 md:hidden">
        {sections.map((section) => (
          <details key={section.key} className={`border border-hairline-08 p-4 ${section.tint}`}>
            <summary className="cursor-pointer font-display uppercase">{section.title}</summary>
            <p className="mt-2 whitespace-pre-line text-sm">
              {section.body ? `${section.mark ? section.mark + " " : ""}${section.body}` : t("noneRecorded")}
            </p>
          </details>
        ))}
      </div>

      {/* Desktop: 2-column sticky notes, always visible */}
      <div className="hidden gap-4 md:grid md:grid-cols-2">
        {sections.map((section) => (
          <div key={section.key} className={`border border-hairline-08 p-4 ${section.tint}`}>
            <h2 className="font-display uppercase">{section.title}</h2>
            <p className="mt-2 whitespace-pre-line text-sm">
              {section.body ? `${section.mark ? section.mark + " " : ""}${section.body}` : t("noneRecorded")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
