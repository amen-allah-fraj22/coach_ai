"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectNative } from "@/components/ui/select-native";
import { Chip } from "@/components/ui/chip";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { tickerIn, stampPress } from "@/lib/motion";

const EVENT_TYPES = [
  "goal",
  "assist",
  "substitution",
  "yellow_card",
  "red_card",
  "injury",
  "tactical_change",
] as const;
type EventType = (typeof EVENT_TYPES)[number];

const QUICK_TYPES: EventType[] = ["goal", "yellow_card", "red_card", "substitution", "tactical_change"];

const FILTER_GROUPS: { key: string; types: EventType[] }[] = [
  { key: "goals", types: ["goal", "assist"] },
  { key: "cards", types: ["yellow_card", "red_card"] },
  { key: "subs", types: ["substitution"] },
  { key: "tacticalShifts", types: ["tactical_change", "injury"] },
];

export function MatchEventLog({
  matchId,
  players,
}: {
  matchId: Id<"matches">;
  players: Doc<"players">[];
}) {
  const t = useTranslations("events");
  const tMatches = useTranslations("matches");
  const tCommon = useTranslations("common");
  const reduced = useReducedMotion() ?? false;

  const events = useQuery(api.matchEvents.listByMatch, { matchId });
  const addEvent = useMutation(api.matchEvents.add);
  const removeEvent = useMutation(api.matchEvents.remove);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [eventType, setEventType] = useState<EventType>("goal");
  const [side, setSide] = useState<"us" | "them">("us");
  const [playerId, setPlayerId] = useState<string>("");
  const [minute, setMinute] = useState(1);

  const playerNames = new Map(players.map((p) => [p._id, p.name]));

  const filtered = useMemo(() => {
    if (!events) return [];
    if (!filter) return events;
    const group = FILTER_GROUPS.find((g) => g.key === filter);
    return group ? events.filter((e) => group.types.includes(e.eventType)) : events;
  }, [events, filter]);

  async function onAdd() {
    setError(null);
    if (minute < 0 || minute > 130) {
      setError("Minute must be between 0 and 130.");
      return;
    }
    setPending(true);
    try {
      await addEvent({
        matchId,
        minute,
        eventType,
        side,
        playerId: (playerId || undefined) as Id<"players"> | undefined,
      });
      setAdding(false);
      setMinute(1);
      setPlayerId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-headline-sm uppercase text-chalk">{t("title")}</h2>
        {!adding && (
          <Button type="button" size="sm" onClick={() => setAdding(true)}>
            {tMatches("logTacticalEvent")}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setFilter(null)}>
          <Chip status={filter === null ? "green" : undefined}>
            {tMatches("allEvents")} ({events?.length ?? 0})
          </Chip>
        </button>
        {FILTER_GROUPS.map((group) => (
          <button key={group.key} type="button" onClick={() => setFilter(group.key)}>
            <Chip status={filter === group.key ? "green" : undefined}>{tMatches(group.key)}</Chip>
          </button>
        ))}
      </div>

      {events === undefined ? (
        <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col border-s border-hairline-16">
          <AnimatePresence initial={false}>
            {filtered.map((event, i) => (
              <motion.li
                key={event._id}
                variants={tickerIn({ index: i })}
                initial="hidden"
                animate="show"
                className={`flex items-center gap-3 border-b border-hairline-08 py-2 ps-4 text-sm ${
                  event.side === "them" ? "flex-row-reverse text-end" : ""
                }`}
              >
                <span className="font-display w-10 shrink-0 tabular-nums text-chalk">
                  {event.minute}&apos;
                </span>
                <span className={event.side === "us" ? "font-medium text-pitch-green" : "font-medium text-touchline-red"}>
                  {t(`types.${event.eventType}`)}
                </span>
                {event.playerId && <span className="text-chalk">{playerNames.get(event.playerId)}</span>}
                <ConfirmButton
                  onConfirm={() => removeEvent({ id: event._id })}
                  confirmLabel={tCommon("confirm")}
                  className="ms-auto text-xs text-muted-foreground hover:text-touchline-red"
                >
                  {tCommon("delete")}
                </ConfirmButton>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {adding && (
        <div className="flex flex-col gap-4 border border-hairline-08 bg-slate-grass p-4">
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.filter((type) => QUICK_TYPES.includes(type)).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setEventType(type)}
                className={`border px-2 py-1 text-xs uppercase ${
                  eventType === type ? "border-chalk bg-chalk text-night-pitch" : "border-hairline-16 text-muted-foreground"
                }`}
              >
                {t(`types.${type}`)}
              </button>
            ))}
            <SelectNative
              value={EVENT_TYPES.includes(eventType) && !QUICK_TYPES.includes(eventType) ? eventType : ""}
              onChange={(e) => e.target.value && setEventType(e.target.value as EventType)}
              className="h-auto w-auto border px-2 py-1 text-xs uppercase"
            >
              <option value="">{tMatches("other")}</option>
              {EVENT_TYPES.filter((type) => !QUICK_TYPES.includes(type)).map((type) => (
                <option key={type} value={type}>
                  {t(`types.${type}`)}
                </option>
              ))}
            </SelectNative>
          </div>

          <div className="flex gap-2">
            {(["us", "them"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={`flex-1 border px-2 py-1 text-xs uppercase ${
                  side === s ? "border-pitch-green bg-wash-green text-chalk" : "border-hairline-16 text-muted-foreground"
                }`}
              >
                {t(`sides.${s}`)}
              </button>
            ))}
          </div>

          {side === "us" && (
            <div className="flex flex-wrap gap-1.5">
              {players.map((p) => (
                <button key={p._id} type="button" onClick={() => setPlayerId(p._id)}>
                  <Chip status={playerId === p._id ? "green" : undefined}>
                    {p.jerseyNumber ?? "–"} {p.name}
                  </Chip>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("minute")}</span>
            <Button type="button" variant="secondary" size="icon" onClick={() => setMinute((m) => Math.max(0, m - 1))}>
              −
            </Button>
            <Input
              type="number"
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="w-16 text-center"
            />
            <Button type="button" variant="secondary" size="icon" onClick={() => setMinute((m) => Math.min(130, m + 1))}>
              +
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setAdding(false)}>
              {tMatches("cancel")}
            </Button>
            <motion.div whileTap={stampPress(reduced)} className="flex-1">
              <Button type="button" disabled={pending} onClick={onAdd} className="w-full">
                {tMatches("stampEvent")}
              </Button>
            </motion.div>
          </div>
        </div>
      )}
    </section>
  );
}
