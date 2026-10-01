"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";

import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";

interface ImportRow {
  matchDate: string;
  homeAway: "home" | "away";
  competition?: string;
  ourFormation?: string;
  opponentFormation?: string;
  scoreFor?: number;
  scoreAgainst?: number;
  possessionPct?: number;
  shots?: number;
  shotsOnTarget?: number;
  corners?: number;
  fouls?: number;
  yellowCards?: number;
  redCards?: number;
  coachNotes?: string;
}

// Accepted header -> field. Both snake_case and camelCase are matched, plus a
// few friendly aliases, so a coach's own export usually lines up.
const COLUMN_MAP: Record<string, keyof ImportRow> = {
  date: "matchDate",
  match_date: "matchDate",
  matchdate: "matchDate",
  venue: "homeAway",
  home_away: "homeAway",
  homeaway: "homeAway",
  competition: "competition",
  our_formation: "ourFormation",
  ourformation: "ourFormation",
  formation: "ourFormation",
  opponent_formation: "opponentFormation",
  opponentformation: "opponentFormation",
  score_for: "scoreFor",
  scorefor: "scoreFor",
  gf: "scoreFor",
  score_against: "scoreAgainst",
  scoreagainst: "scoreAgainst",
  ga: "scoreAgainst",
  possession: "possessionPct",
  possession_pct: "possessionPct",
  shots: "shots",
  shots_on_target: "shotsOnTarget",
  shotsontarget: "shotsOnTarget",
  corners: "corners",
  fouls: "fouls",
  yellow_cards: "yellowCards",
  yellowcards: "yellowCards",
  red_cards: "redCards",
  redcards: "redCards",
  notes: "coachNotes",
  coach_notes: "coachNotes",
};

const NUMERIC: (keyof ImportRow)[] = [
  "scoreFor", "scoreAgainst", "possessionPct", "shots", "shotsOnTarget",
  "corners", "fouls", "yellowCards", "redCards",
];

/** Minimal RFC-4180-ish CSV parser: handles quoted fields, embedded commas,
 *  escaped quotes ("") and both newline styles. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field); field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field); field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((c) => c.trim() !== "")) rows.push(row);
  }
  return rows;
}

function toRows(csv: string): ImportRow[] {
  const table = parseCsv(csv);
  if (table.length < 2) return [];
  const headers = table[0].map((h) => h.trim().toLowerCase());

  return table.slice(1).flatMap((cells): ImportRow[] => {
    const raw: Record<string, string> = {};
    headers.forEach((h, i) => {
      const field = COLUMN_MAP[h];
      if (field) raw[field] = (cells[i] ?? "").trim();
    });
    if (!raw.matchDate) return []; // a date is the one required field

    const row: ImportRow = {
      matchDate: raw.matchDate,
      homeAway: (raw.homeAway ?? "").toLowerCase().startsWith("a") ? "away" : "home",
    };
    const writable = row as unknown as Record<string, unknown>;
    for (const [field, value] of Object.entries(raw)) {
      if (field === "matchDate" || field === "homeAway" || !value) continue;
      if (NUMERIC.includes(field as keyof ImportRow)) {
        const n = Number(value);
        if (Number.isFinite(n)) writable[field] = n;
      } else {
        writable[field] = value;
      }
    }
    return [row];
  });
}

export function ImportMatches({ teams }: { teams: Doc<"teams">[] }) {
  const t = useTranslations("matches");
  const router = useRouter();
  const importRows = useMutation(api.matches.importRows);

  const [teamId, setTeamId] = useState<string>(teams[0]?._id ?? "");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onFile(file: File) {
    setError(null);
    try {
      const text = await file.text();
      const parsed = toRows(text);
      if (parsed.length === 0) {
        setError(t("noRows"));
        setRows([]);
        return;
      }
      setRows(parsed);
    } catch {
      setError(t("parseError"));
    }
  }

  async function onImport() {
    if (!teamId || rows.length === 0) return;
    setPending(true);
    try {
      await importRows({ teamId: teamId as Id<"teams">, rows });
      router.push("/matches");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPending(false);
    }
  }

  const columns = Object.keys(COLUMN_MAP)
    .filter((c) => c.includes("_") || ["date", "venue", "shots", "corners", "fouls", "notes", "competition", "formation"].includes(c))
    .join(", ");

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        {t("importIntro")}
        <br />
        <span className="font-mono text-xs">{columns}</span>
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="team">{t("team")}</Label>
        <SelectNative id="team" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.name}
            </option>
          ))}
        </SelectNative>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="csv">{t("chooseFile")}</Label>
        <input
          id="csv"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
          }}
          className="text-sm file:me-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm"
        />
      </div>

      {rows.length > 0 && (
        <p className="text-sm text-secondary">{t("rowsReady", { n: rows.length })}</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="button"
        onClick={onImport}
        disabled={pending || rows.length === 0 || !teamId}
        className="self-start"
      >
        {t("importCta")}
      </Button>
    </div>
  );
}
