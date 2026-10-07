import type { Transition, Variants } from "motion/react";

/**
 * Named motion presets for the "Pitchside" design system. Timings and
 * easings come from design/stitch-prompts.md's motion table (also quoted in
 * docs/design-implementation-plan.md §2). Screens must use these — never a
 * hand-rolled one-off duration/easing.
 *
 * Every factory takes `reduced` (from `useReducedMotion()`) and collapses to
 * a near-instant, transform-free transition when true, per
 * docs/design-implementation-plan.md §1 ("every animation checks
 * useReducedMotion()").
 */

const INSTANT: Transition = { duration: 0.01 };

function transition(t: Transition, reduced: boolean): Transition {
  return reduced ? INSTANT : t;
}

/** Section/content entrances, tab content swaps. */
export function arcEnter(
  { index = 0, stagger = 0.08, direction = "vertical" as "vertical" | "horizontal" } = {},
  reduced = false,
): Variants {
  const axis = direction === "vertical" ? { y: 12 } : { x: direction === "horizontal" ? 24 : 0 };
  return {
    hidden: { opacity: 0, x: direction === "horizontal" ? 24 : 6, ...axis },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: transition(
        { duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: index * stagger },
        reduced,
      ),
    },
  };
}

/** Dashboard/landing team-sheet "paper" cards dropping in, each with its own tilt. */
export function paperDrop(
  { rotate = -2, index = 0, stagger = 0.08 } = {},
  reduced = false,
): Variants {
  return {
    hidden: { opacity: 0, y: -20, rotate: 0 },
    show: {
      opacity: 1,
      y: 0,
      rotate,
      transition: reduced
        ? INSTANT
        : { type: "spring", stiffness: 300, damping: 20, delay: index * stagger },
    },
  };
}

/** Drag start on the squad board: token lifts off the lane. */
export function tokenLift(reduced = false) {
  return {
    scale: reduced ? 1 : 1.04,
    rotate: reduced ? 0 : 3,
    transition: transition({ duration: 0.15, ease: "easeOut" }, reduced),
  };
}

/** Drag end on the squad board: token settles with a slight overshoot. */
export function dropSettle(reduced = false): Transition {
  return transition({ type: "spring", bounce: 0.08, duration: 0.4 }, reduced);
}

/** One-shot red outline pulse on the lane that just received a drop. */
export const dropSettleLanePulse: Variants = {
  idle: { boxShadow: "0 0 0 0px rgba(227, 64, 42, 0)" },
  pulse: {
    boxShadow: [
      "0 0 0 0px rgba(227, 64, 42, 0)",
      "0 0 0 2px rgba(227, 64, 42, 0.8)",
      "0 0 0 0px rgba(227, 64, 42, 0)",
    ],
    transition: { duration: 0.5 },
  },
};

/** Player token flip (front/back faces). Parent needs perspective: 1000px. */
export function flip3D(reduced = false): Variants {
  return {
    front: { rotateY: 0, transition: transition({ duration: 0.35 }, reduced) },
    back: { rotateY: 180, transition: transition({ duration: 0.35 }, reduced) },
  };
}

/**
 * SVG stroke draw-on, via pathLength. Use on a <motion.path> with
 * `strokeDasharray: 1` baked in. 300ms for small marks (formation circle,
 * checkmarks), up to ~1200ms for hero-sized pitch arrows.
 */
export function chalkDraw({ duration = 0.3, delay = 0 } = {}, reduced = false): Variants {
  return {
    hidden: { pathLength: 0 },
    show: {
      pathLength: 1,
      transition: transition({ duration, delay, ease: "easeInOut" }, reduced),
    },
  };
}

/** Accept/Modify/Reject and all "Stamp & …" submit buttons. */
export function stampPress(reduced = false) {
  return {
    scale: reduced ? [1] : [1, 0.92, 1.05, 1],
    transition: transition({ duration: 0.22, times: [0, 0.35, 0.7, 1] }, reduced),
  };
}

/** Ink-blot mark that fades in alongside stampPress. */
export const inkBlot: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { delay: 0.1, duration: 0.3 } },
};

/** Per-digit vertical roll for a single character (countdown, steppers). */
export function flipDigit(reduced = false): Variants {
  return {
    initial: { rotateX: reduced ? 0 : 90, opacity: 0 },
    animate: { rotateX: 0, opacity: 1, transition: transition({ duration: 0.25 }, reduced) },
    exit: { rotateX: reduced ? 0 : -90, opacity: 0, transition: transition({ duration: 0.25 }, reduced) },
  };
}

/** New rows appearing in a ticker/feed (matches list, match events). */
export function tickerIn({ index = 0, stagger = 0.05 } = {}, reduced = false): Variants {
  return {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduced
        ? INSTANT
        : { type: "spring", bounce: 0.3, duration: 0.4, delay: index * stagger },
    },
  };
}

/** Bottom sheets (mobile modals, match-add on mobile). */
export function sheetUp(reduced = false): Variants {
  return {
    hidden: { y: "100%" },
    show: {
      y: 0,
      transition: reduced ? INSTANT : { type: "spring", bounce: 0.15, duration: 0.4 },
    },
    exit: { y: "100%", transition: transition({ duration: 0.25 }, reduced) },
  };
}

/** Onboarding steps, team tab switches. direction: 1 = forward, -1 = back. */
export function pageTurn(direction: 1 | -1 = 1, reduced = false): Variants {
  const dx = 24 * direction;
  const skew = 2 * direction;
  return {
    initial: { opacity: 0, x: dx, skewY: reduced ? 0 : skew },
    animate: { opacity: 1, x: 0, skewY: 0, transition: transition({ duration: 0.3 }, reduced) },
    exit: {
      opacity: 0,
      x: -dx,
      skewY: reduced ? 0 : -skew,
      transition: transition({ duration: 0.3 }, reduced),
    },
  };
}

/**
 * Switching to/from Arabic: content fades and slides 12px toward the new
 * reading direction. `dir` is the direction being switched TO.
 */
export function localeFlip(dir: "ltr" | "rtl", reduced = false): Variants {
  const sign = dir === "rtl" ? -1 : 1;
  return {
    hidden: { opacity: 0, x: reduced ? 0 : 12 * sign },
    show: { opacity: 1, x: 0, transition: transition({ duration: 0.35 }, reduced) },
  };
}

/** Underline that grows before navigating away from a tapped mobile row. */
export function rowSweep(reduced = false): Variants {
  return {
    idle: { scaleX: 0 },
    active: { scaleX: 1, transition: transition({ duration: 0.18, ease: "easeOut" }, reduced) },
  };
}

/** CSS-driven continuous loops (no JS animation frame needed). Pair with the
 *  .animate-marching-ants / .animate-marquee utilities in globals.css. */
export const marchingAntsClassName = "animate-marching-ants";
export const marqueeClassName = "animate-marquee";
