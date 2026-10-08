"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
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
import { motion, useReducedMotion } from "motion/react";
import { useMutation, useQuery } from "convex/react";
import { useTranslations } from "next-intl";

import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { PlayerToken } from "@/components/players/player-token";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import { tokenLift, dropSettle, dropSettleLanePulse } from "@/lib/motion";

// Lanes always shown, so there's somewhere to drag into even when empty.
const DEFAULT_LANES = ["Starting XI", "Bench", "Reserves", "Squad"];

type Lanes = Record<string, Id<"players">[]>;

function laneOrder(groups: string[]): string[] {
  const extras = groups.filter((g) => !DEFAULT_LANES.includes(g)).sort();
  return [...DEFAULT_LANES, ...extras];
}

function SortablePlayer({ player, editable }: { player: Doc<"players">; editable: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: player._id,
    disabled: !editable,
  });
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div
      ref={setNodeRef}
      layout
      style={{ transform: CSS.Transform.toString(transform), transition }}
      animate={isDragging ? tokenLift(reduced) : { scale: 1, rotate: 0 }}
      className={cn("touch-none", isDragging && "opacity-40")}
      {...attributes}
      {...(editable ? listeners : {})}
    >
      <PlayerToken player={player} />
    </motion.div>
  );
}

function Lane({
  group,
  playerIds,
  playersById,
  pulsing,
  editable,
  t,
}: {
  group: string;
  playerIds: Id<"players">[];
  playersById: Map<Id<"players">, Doc<"players">>;
  pulsing: boolean;
  editable: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: group });

  return (
    <div className="flex min-w-[15rem] flex-1 flex-col gap-2">
      <h3 className="text-label-tactical text-muted-foreground">
        {group}
        <span className="ms-2 text-muted-foreground/60">{playerIds.length}</span>
      </h3>
      <motion.div
        ref={setNodeRef}
        variants={dropSettleLanePulse}
        animate={pulsing ? "pulse" : "idle"}
        className={cn(
          "flex min-h-32 flex-col gap-2 border border-dashed bg-slate-grass/40 p-3 transition-colors",
          isOver ? "border-chalk" : "border-hairline-16",
        )}
      >
        <SortableContext items={playerIds} strategy={verticalListSortingStrategy}>
          {playerIds.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">{t("dropTokenHere")}</p>
          ) : (
            playerIds.map((id) => {
              const player = playersById.get(id);
              return player ? (
                <SortablePlayer key={id} player={player} editable={editable} />
              ) : null;
            })
          )}
        </SortableContext>
      </motion.div>
    </div>
  );
}

export function SquadBoard() {
  const t = useTranslations("players");
  const tCommon = useTranslations("common");
  const players = useQuery(api.players.list);
  const teams = useQuery(api.teams.list);
  const reorder = useMutation(api.players.reorder);
  const reduced = useReducedMotion() ?? false;
  const isMobile = useIsMobile();

  const [lanes, setLanes] = useState<Lanes>({});
  const [activeId, setActiveId] = useState<Id<"players"> | null>(null);
  const [pulsingLane, setPulsingLane] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [addingLane, setAddingLane] = useState(false);
  const [newLaneName, setNewLaneName] = useState("");
  const dragging = useRef(false);

  const editable = !isMobile || editMode;

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
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  );

  const laneNames = laneOrder(Object.keys(lanes));
  const defaultFormation = (teams ?? [])[0]?.defaultFormation;

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

  function visibleIds(ids: Id<"players">[]): Id<"players">[] {
    if (!search.trim()) return ids;
    const q = search.trim().toLowerCase();
    return ids.filter((id) => playersById.get(id)?.name.toLowerCase().includes(q));
  }

  if (players === undefined) {
    return <p className="text-muted-foreground">{tCommon("loading")}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-headline-sm uppercase text-chalk">{t("boardTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("dragHint")}</p>
        </div>
        <div className="flex items-center gap-2">
          {defaultFormation && <Chip status="green">{defaultFormation}</Chip>}
          {isMobile && (
            <Button type="button" variant="secondary" size="sm" onClick={() => setEditMode((v) => !v)}>
              <Icon name="edit" size={16} /> {t("editLineup")}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="max-w-xs"
        />
        {addingLane ? (
          <div className="flex items-center gap-1">
            <Input
              autoFocus
              value={newLaneName}
              onChange={(e) => setNewLaneName(e.target.value)}
              placeholder={t("laneNamePlaceholder")}
              className="w-40"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newLaneName.trim()) {
                  setLanes((prev) => ({ ...prev, [newLaneName.trim()]: [] }));
                  setNewLaneName("");
                  setAddingLane(false);
                }
                if (e.key === "Escape") setAddingLane(false);
              }}
            />
          </div>
        ) : (
          <Button type="button" variant="secondary" size="sm" onClick={() => setAddingLane(true)}>
            {t("addLane")}
          </Button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap">
          {laneNames.map((lane) => (
            <Lane
              key={lane}
              group={lane}
              playerIds={visibleIds(lanes[lane] ?? [])}
              playersById={playersById}
              pulsing={pulsingLane === lane}
              editable={editable}
              t={t}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId && playersById.get(activeId) ? (
            <motion.div
              initial={{ scale: 1 }}
              animate={tokenLift(reduced)}
              transition={dropSettle(reduced)}
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
