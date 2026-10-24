// Coach playing styles, stored as these codes in coaches.playingStyle.
// Shared by the UI picker and the AI prompt; UI labels live in messages/*.json
// under "playingStyles".
export const PLAYING_STYLES = [
  "possession",
  "counter_attack",
  "high_press",
  "direct",
  "wing_play",
  "low_block",
  "balanced",
] as const;

export type PlayingStyle = (typeof PLAYING_STYLES)[number];

const AI_DESCRIPTIONS: Record<PlayingStyle, string> = {
  possession: "possession play: patient build-up, keep the ball and control the tempo",
  counter_attack: "counter-attacking: stay compact without the ball, then break forward fast on turnovers",
  high_press: "high press: win the ball high up the pitch and counter-press immediately after losing it",
  direct: "direct play: move the ball forward early, with long balls into the forwards",
  wing_play: "wing play: attack through width, with crosses and overlapping full-backs",
  low_block: "low block: defend deep and compact, protect the box, and counter when possible",
  balanced: "balanced: no fixed identity, adapt the approach to each opponent",
};

export function isPlayingStyle(value: string | undefined | null): value is PlayingStyle {
  return !!value && (PLAYING_STYLES as readonly string[]).includes(value);
}

/** Plain-English description for the AI. Free text saved before the list existed passes through. */
export function describePlayingStyle(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  return isPlayingStyle(value) ? AI_DESCRIPTIONS[value] : value;
}
