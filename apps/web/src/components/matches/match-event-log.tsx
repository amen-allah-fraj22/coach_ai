"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import {
  createMatchEvent,
  deleteMatchEvent,
  type MatchEventActionState,
} from "@/app/[locale]/(app)/matches/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import type {
  MatchEvent,
  MatchEventSide,
  MatchEventType,
  Player,
} from "@/lib/types/database";

const initialState: MatchEventActionState = { error: null };

const EVENT_TYPES: MatchEventType[] = [
  "goal",
  "assist",
  "substitution",
  "yellow_card",
  "red_card",
  "injury",
  "tactical_change",
];
const SIDES: MatchEventSide[] = ["us", "them"];

export function MatchEventLog({
  locale,
  matchId,
  events,
  players,
}: {
  locale: string;
  matchId: string;
  events: MatchEvent[];
  players: Player[];
}) {
  const t = useTranslations("events");
  const tCommon = useTranslations("common");
  const [state, formAction, pending] = useActionState(
    createMatchEvent.bind(null, matchId),
    initialState,
  );

  const playerNames = new Map(players.map((player) => [player.id, player.name]));

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-lg uppercase tracking-tight">
        {t("title")}
      </h2>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm"
            >
              <span className="font-display w-10 shrink-0 tabular-nums">
                {event.minute}&apos;
              </span>
              <span
                className={
                  event.side === "us"
                    ? "font-medium text-secondary"
                    : "font-medium text-primary"
                }
              >
                {t(`types.${event.event_type}`)}
              </span>
              <span className="text-muted-foreground">
                {t(`sides.${event.side}`)}
              </span>
              {event.player_id && (
                <span>{playerNames.get(event.player_id)}</span>
              )}
              {event.description && (
                <span className="text-muted-foreground">{event.description}</span>
              )}
              <form action={deleteMatchEvent} className="ms-auto">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="matchId" value={matchId} />
                <input type="hidden" name="eventId" value={event.id} />
                <Button type="submit" variant="ghost" size="sm">
                  {tCommon("delete")}
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form
        action={formAction}
        className="flex flex-col gap-3 rounded-md border border-border p-4"
      >
        <input type="hidden" name="locale" value={locale} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="minute" className="text-xs">
              {t("minute")}
            </Label>
            <Input
              id="minute"
              name="minute"
              type="number"
              min={0}
              max={130}
              required
            />
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
                <option key={player.id} value={player.id}>
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

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}

        <Button type="submit" disabled={pending} size="sm" className="self-start">
          {t("addEvent")}
        </Button>
      </form>
    </section>
  );
}
