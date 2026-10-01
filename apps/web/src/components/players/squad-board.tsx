"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import { useMutation, useQuery } from "convex/react";
import { useTranslations } from "next-intl";

import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { PlayerToken } from "@/components/players/player-token";
import { cn } from "@/lib/utils";

// Lanes always shown, so there's somewhere to drag into even when empty.
const DEFAULT_LANES = ["Starting XI", "Bench", "Reserves", "Squad"];

type Lanes = Record<string, Id<"players">[]>;

function laneOrder(groups: string[]): string[] {
  const extras = groups.filter((g) => !DEFAULT_LANES.includes(g)).sort();
  return [...DEFAULT_LANES, ...extras];
}

function SortablePlayer({ player }: { player: Doc<"players"> }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: player._id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("touch-none", isDragging && "opacity-40")}
      {...attributes}
      {...listeners}
    >
      <PlayerToken player={player} />
    </div>
  );
}

function Lane({
  group,
  playerIds,
  playersById,
  pulsing,
}: {
  group: string;
  playerIds: Id<"players">[];
  playersById: Map<Id<"players">, Doc<"players">>;
  pulsing: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: group });

  return (
    <div className="flex min-w-[15rem] flex-1 flex-col gap-2">
      <h3 className="font-display text-xs uppercase tracking-wide text-muted-foreground">
        {group}
        <span className="ms-2 text-muted-foreground/60">{playerIds.length}</span>
      </h3>
      <motion.div
        ref={setNodeRef}
        animate={
          pulsing
            ? { boxShadow: ["0 0 0 0px var(--color-primary)", "0 0 0 2px var(--color-primary)", "0 0 0 0px var(--color-primary)"] }
            : {}
        }
        transition={{ duration: 0.5 }}
        className={cn(
          "flex min-h-32 flex-col gap-2 rounded-lg border border-dashed p-3 transition-colors",
          "bg-accent/40",
          isOver ? "border-primary" : "border-border",
        )}
      >
        <SortableContext items={playerIds} strategy={verticalListSortingStrategy}>
          {playerIds.map((id) => {
            const player = playersById.get(id);
            return player ? <SortablePlayer key={id} player={player} /> : null;
          })}
        </SortableContext>
      </motion.div>
    </div>
  );
}

export function SquadBoard() {
  const t = useTranslations("players");
  const tCommon = useTranslations("common");
  const players = useQuery(api.players.list);
  const reorder = useMutation(api.players.reorder);

  const [lanes, setLanes] = useState<Lanes>({});
  const [activeId, setActiveId] = useState<Id<"players"> | null>(null);
  const [pulsingLane, setPulsingLane] = useState<string | null>(null);
  const dragging = useRef(false);

  const playersById = useMemo(() => {
    const map = new Map<Id<"players">, Doc<"players">>();
    (players ?? []).forEach((p) => map.set(p._id, p));
    return map;
  }, [players]);

  // Rebuild lanes from the live query, except mid-drag (local state wins then,
  // so a server echo can't yank a token out from under the pointer).
  useEffect(() => {
    if (dragging.current || !players) return;
    const grouped: Lanes = {};
    for (const lane of DEFAULT_LANES) grouped[lane] = [];
    const sorted = [...players].sort((a, b) => a.sortOrder - b.sortOrder);
    for (const p of sorted) {
      (grouped[p.squadGroup] ??= []).push(p._id);
    }
    setLanes(grouped);
  }, [players]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const laneNames = laneOrder(Object.keys(lanes));

  function containerOf(id: string): string | undefined {
    if (id in lanes) return id;
    return laneNames.find((lane) => lanes[lane]?.includes(id as Id<"players">));
  }

  function onDragStart(event: DragStartEvent) {
    dragging.current = true;
    setActiveId(event.active.id as Id<"players">);
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const from = containerOf(active.id as string);
    const to = containerOf(over.id as string);
    if (!from || !to || from === to) return;

    setLanes((prev) => {
      const activeItem = active.id as Id<"players">;
      const next: Lanes = { ...prev };
      next[from] = prev[from].filter((id) => id !== activeItem);
      const overItems = prev[to];
      const overIndex =
        (over.id as string) in prev
          ? overItems.length
          : Math.max(0, overItems.indexOf(over.id as Id<"players">));
      next[to] = [
        ...overItems.slice(0, overIndex),
        activeItem,
        ...overItems.slice(overIndex),
      ];
      return next;
    });
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    dragging.current = false;
    setActiveId(null);
    if (!over) return;

    const activeItem = active.id as Id<"players">;
    const lane = containerOf(over.id as string) ?? containerOf(active.id as string);
    if (!lane) return;

    // Reorder within the destination lane to the final position.
    setLanes((prev) => {
      const ids = prev[lane];
      const oldIndex = ids.indexOf(activeItem);
      const overIndex =
        (over.id as string) in prev ? ids.length - 1 : ids.indexOf(over.id as Id<"players">);
      if (oldIndex === -1 || overIndex === -1 || oldIndex === overIndex) return prev;
      const reordered = [...ids];
      reordered.splice(oldIndex, 1);
      reordered.splice(overIndex, 0, activeItem);
      return { ...prev, [lane]: reordered };
    });

    setPulsingLane(lane);
    setTimeout(() => setPulsingLane(null), 550);

    // Persist: move the player to this lane and renumber it.
    const finalIds = (laneAfter(lanes, lane, activeItem, over.id as string) ?? lanes[lane]) as Id<"players">[];
    await reorder({ id: activeItem, squadGroup: lane, orderedIds: finalIds });
  }

  if (players === undefined) {
    return <p className="text-muted-foreground">{tCommon("loading")}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{t("dragHint")}</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex flex-wrap gap-4">
          {laneNames.map((lane) => (
            <Lane
              key={lane}
              group={lane}
              playerIds={lanes[lane] ?? []}
              playersById={playersById}
              pulsing={pulsingLane === lane}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId && playersById.get(activeId) ? (
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.04, rotate: 3 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <PlayerToken player={playersById.get(activeId)!} dragging />
            </motion.div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

/** Pure helper: the destination lane's id list after placing activeItem. */
function laneAfter(
  lanes: Lanes,
  lane: string,
  activeItem: Id<"players">,
  overId: string,
): Id<"players">[] | null {
  const ids = lanes[lane];
  if (!ids) return null;
  const oldIndex = ids.indexOf(activeItem);
  const overIndex = overId in lanes ? ids.length - 1 : ids.indexOf(overId as Id<"players">);
  if (oldIndex === -1 || overIndex === -1 || oldIndex === overIndex) return ids;
  const out = [...ids];
  out.splice(oldIndex, 1);
  out.splice(overIndex, 0, activeItem);
  return out;
}
