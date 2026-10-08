"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { flipDigit } from "@/lib/motion";

function subscribe(callback: () => void) {
  const id = setInterval(callback, 1000);
  return () => clearInterval(id);
}
function getSnapshot() {
  return Date.now();
}
function getServerSnapshot() {
  return 0;
}

function FlipUnit({ value, label }: { value: number; label: string }) {
  const reduced = useReducedMotion() ?? false;
  const text = String(Math.max(0, value)).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex" style={{ perspective: 400 }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            variants={flipDigit(reduced)}
            initial="initial"
            animate="animate"
            exit="exit"
            className="font-display text-headline-md tabular-nums text-chalk"
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-label-mono text-muted-foreground">{label}</span>
    </div>
  );
}

/** Countdown to kickoff, each unit rolling in (flipDigit) as it changes. */
export function Countdown({
  target,
  labels,
}: {
  target: Date;
  labels: { days: string; hours: string; minutes: string; seconds: string };
}) {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (now === 0) return null;

  const diff = Math.max(0, target.getTime() - now);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="flex gap-4">
      <FlipUnit value={days} label={labels.days} />
      <FlipUnit value={hours} label={labels.hours} />
      <FlipUnit value={minutes} label={labels.minutes} />
      <FlipUnit value={seconds} label={labels.seconds} />
    </div>
  );
}
