"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useTranslations } from "next-intl";

import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";

const EVENT_TYPES = [
  "goal",
  "assist",
  "substitution",
  "yellow_card",
  "red_card",
  "injury",
  "tactical_change",
] as const;
const SIDES = ["us", "them"] as const;

export function MatchEventLog({
  matchId,
  players,
}: {
  matchId: Id<"matches">;
  players: Doc<"players">[];
}) {
  const t = useTranslations("events");
  const tCommon = useTranslations("common");

  // Live: the list updates as any of the club's coaches log events.
  const events = useQuery(api.matchEvents.listByMatch, { matchId });
  const addEvent = useMutation(api.matchEvents.add);
  const removeEvent = useMutation(api.matchEvents.remove);

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const playerNames = new Map(players.map((p) => [p._id, p.name]));

  async function onAdd(formData: FormData) {
    setError(null);
    const minute = Number(String(formData.get("minute") ?? ""));
    if (!Number.isFinite(minute) || minute < 0 || minute > 130) {
      setError("Minute must be between 0 and 130.");
      return;
    }
    setPending(true);
    const playerId = String(formData.get("playerId") ?? "");
    try {
      await addEvent({
        matchId,
        minute,
        eventType: String(formData.get("eventType") ?? "goal") as
          (typeof EVENT_TYPES)[number],
        side: String(formData.get("side") ?? "us") as "us" | "them",
        playerId: (playerId || undefined) as Id<"players"> | undefined,
        description: String(formData.get("description") ?? "").trim() || undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-lg uppercase tracking-tight">{t("title")}</h2>

      {events === undefined ? (
        <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {events.map((event) => (
            <li
              key={event._id}
              className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm"
            >
              <span className="font-display w-10 shrink-0 tabular-nums">
                {event.minute}&apos;
              </span>
              <span className={event.side === "us" ? "font-medium text-secondary" : "font-medium text-destructive"}>
                {t(`types.${event.eventType}`)}
              </span>
              <span className="text-muted-foreground">{t(`sides.${event.side}`)}</span>
              {event.playerId && <span>{playerNames.get(event.playerId)}</span>}
              {event.description && (
                <span className="text-muted-foreground">{event.description}</span>
              )}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="ms-auto"
                onClick={() => removeEvent({ id: event._id })}
              >
                {tCommon("delete")}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form action={onAdd} className="flex flex-col gap-3 rounded-md border border-border p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="minute" className="text-xs">
              {t("minute")}
            </Label>
            <Input id="minute" name="minute" type="number" min={0} max={130} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="eventType" className="text-xs">
              {t("type")}
            </Label>
            <SelectNative id="eventType" name="eventType" defaultValue="goal">
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`types.${type}`)}
                </option>
              ))}
            </SelectNative>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="side" className="text-xs">
              {t("side")}
            </Label>
            <SelectNative id="side" name="side" defaultValue="us">
              {SIDES.map((side) => (
                <option key={side} value={side}>
                  {t(`sides.${side}`)}
                </option>
              ))}
            </SelectNative>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="playerId" className="text-xs">
              {t("player")}
            </Label>
            <SelectNative id="playerId" name="playerId" defaultValue="">
              <option value="">{tCommon("none")}</option>
              {players.map((player) => (
                <option key={player._id} value={player._id}>
                  {player.name}
                </option>
              ))}
            </SelectNative>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description" className="text-xs">
            {t("description")}
          </Label>
          <Input id="description" name="description" />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={pending} size="sm" className="self-start">
          {t("addEvent")}
        </Button>
      </form>
    </section>
  );
}
