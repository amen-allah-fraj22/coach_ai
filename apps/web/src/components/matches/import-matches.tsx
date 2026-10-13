"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";

import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Icon } from "@/components/ui/icon";
import { marchingAntsClassName, stampPress } from "@/lib/motion";

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

function toRows(csv: string): { headers: string[]; rows: ImportRow[] } {
  const table = parseCsv(csv);
  if (table.length < 2) return { headers: [], rows: [] };
  const headers = table[0].map((h) => h.trim().toLowerCase());

  const rows = table.slice(1).flatMap((cells): ImportRow[] => {
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
  return { headers, rows };
}

export function ImportMatches({ teams }: { teams: Doc<"teams">[] }) {
  const t = useTranslations("matches");
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;
  const importRows = useMutation(api.matches.importRows);

  const [teamId, setTeamId] = useState<string>(teams[0]?._id ?? "");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [committed, setCommitted] = useState<number | null>(null);
  const [draggingOver, setDraggingOver] = useState(false);

  async function onFile(file: File) {
    setError(null);
    try {
      const text = await file.text();
      const { headers, rows } = toRows(text);
      if (rows.length === 0) {
        setError(t("noRows"));
        setRows([]);
        return;
      }
      setHeaders(headers.filter((h) => COLUMN_MAP[h]));
      setRows(rows);
    } catch {
      setError(t("parseError"));
    }
  }

  async function onImport() {
    if (!teamId || rows.length === 0) return;
    setPending(true);
    try {
      await importRows({ teamId: teamId as Id<"teams">, rows });
      setCommitted(rows.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPending(false);
    }
  }

  function restart() {
    setRows([]);
    setHeaders([]);
    setCommitted(null);
    setError(null);
  }

  if (committed !== null) {
    return (
      <div className="flex flex-col items-center gap-4 border border-hairline-08 bg-slate-grass p-8 text-center">
        <Icon name="check_circle" size={32} className="text-pitch-green" />
        <p className="font-display text-headline-sm uppercase text-chalk">
          {t("nMatchesCommitted", { n: committed })}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={restart}>
            {t("importAnother")}
          </Button>
          <Button type="button" onClick={() => router.push("/matches")}>
            {t("title")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
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

      {rows.length === 0 ? (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDraggingOver(true);
          }}
          onDragLeave={() => setDraggingOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDraggingOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void onFile(f);
          }}
          className={`relative flex cursor-pointer flex-col items-center gap-3 p-10 text-center ${
            draggingOver ? "bg-wash-green" : ""
          }`}
        >
          <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
            <rect
              x="2"
              y="2"
              width="calc(100% - 4px)"
              height="calc(100% - 4px)"
              fill="none"
              stroke={draggingOver ? "var(--pitch-green)" : "var(--hairline-16)"}
              strokeWidth="2"
              strokeDasharray="8 6"
              className={draggingOver && !reduced ? marchingAntsClassName : ""}
            />
          </svg>
          <Icon
            name={draggingOver ? "check_circle" : "upload_file"}
            size={32}
            className={draggingOver ? "text-pitch-green" : "text-muted-foreground"}
          />
          <p className="font-display uppercase text-chalk">{t("dropSpreadsheetHere")}</p>
          <span className="text-sm text-muted-foreground underline">{t("selectLedgerFile")}</span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
          />
        </label>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-label-tactical text-muted-foreground">{t("columnMappingSheet")}</p>
          <ul className="border-t border-hairline-08">
            {headers.map((h, i) => (
              <motion.li
                key={h}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between border-b border-hairline-08 py-2 text-sm"
              >
                <span className="text-muted-foreground">{h}</span>
                <Icon name="arrow_forward" size={14} className="text-muted-foreground" />
                <span className="text-chalk">{COLUMN_MAP[h]}</span>
              </motion.li>
            ))}
          </ul>
          <p className="text-sm text-pitch-green">{t("rowsReady", { n: rows.length })}</p>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        {rows.length > 0 && (
          <Button type="button" variant="secondary" onClick={restart}>
            {t("discardRestart")}
          </Button>
        )}
        <motion.div whileTap={stampPress(reduced)} className="flex-1">
          <Button
            type="button"
            onClick={onImport}
            disabled={pending || rows.length === 0 || !teamId}
            className="w-full"
          >
            {t("importNMatches", { n: rows.length })}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
