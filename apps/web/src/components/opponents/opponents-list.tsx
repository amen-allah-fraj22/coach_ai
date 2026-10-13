"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";

import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { useRouter, Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Monogram } from "@/components/dashboard/monogram";

export function OpponentsList({ opponents }: { opponents: Doc<"opponents">[] }) {
  const t = useTranslations("opponents");
  const router = useRouter();
  const create = useMutation(api.opponents.create);

  const [search, setSearch] = useState("");
  const [formation, setFormation] = useState<string | null>(null);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [pending, setPending] = useState(false);

  const formations = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of opponents) {
      if (!o.usualFormation) continue;
      counts.set(o.usualFormation, (counts.get(o.usualFormation) ?? 0) + 1);
    }
    return [...counts.entries()];
  }, [opponents]);

  const filtered = opponents.filter((o) => {
    if (formation && o.usualFormation !== formation) return false;
    const q = search.trim().toLowerCase();
    if (q && !o.teamName.toLowerCase().includes(q) && !(o.usualFormation ?? "").toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });

  async function onInitialize() {
    if (!newName.trim()) return;
    setPending(true);
    try {
      const id = await create({ teamName: newName.trim(), alternativeFormations: [] });
      router.push(`/opponents/${id}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="max-w-xs"
      />

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setFormation(null)}>
          <Chip status={formation === null ? "green" : undefined}>
            {t("allFormations")} ({opponents.length})
          </Chip>
        </button>
        {formations.map(([f, count]) => (
          <button key={f} type="button" onClick={() => setFormation(f)}>
            <Chip status={formation === f ? "green" : undefined}>
              {f} ({count})
            </Chip>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((opponent) => (
          <motion.div key={opponent._id} whileHover={{ y: -4 }}>
            <Link
              href={`/opponents/${opponent._id}`}
              className="flex items-center gap-3 border border-hairline-08 bg-slate-grass p-4"
            >
              <Monogram name={opponent.teamName} />
              <div className="flex-1">
                <p className="font-medium text-chalk">{opponent.teamName}</p>
                <p className="text-xs text-muted-foreground">{opponent.usualFormation ?? "—"}</p>
              </div>
              <span className="text-xs text-muted-foreground">{t("openFullDossier")}</span>
            </Link>
          </motion.div>
        ))}

        <button
          type="button"
          onClick={() => setQuickCreateOpen(true)}
          className="flex items-center justify-center border border-dashed border-hairline-16 p-4 text-sm text-muted-foreground hover:border-chalk hover:text-chalk"
        >
          {t("scoutNewOpponent")}
        </button>
      </div>

      <BottomSheet
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        title={t("scoutNewOpponent")}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newOpponentName">{t("teamName")}</Label>
            <Input
              id="newOpponentName"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setQuickCreateOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="button" disabled={pending || !newName.trim()} onClick={onInitialize} className="flex-1">
              {t("initializeDossier")}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
