// Reads the design tokens straight from src/app/globals.css and checks WCAG
// contrast for the colour pairs the UI actually uses, in both themes.
// Run: pnpm contrast   (exit 1 on any unexpected failure)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const css = readFileSync(
  fileURLToPath(new URL("../src/app/globals.css", import.meta.url)),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, "");

function block(selector) {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("\n}", open);
  const vars = {};
  for (const [, name, value] of css.slice(open, close).matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    vars[name] = value.trim();
  }
  return vars;
}

const THEMES = {
  light: block(':root,\n[data-theme="light"]'),
  dark: { ...block(':root,\n[data-theme="light"]'), ...block('\n[data-theme="dark"] {') },
};

function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const rgba = value.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\s*\)$/i);
  if (rgba) return { r: +rgba[1], g: +rgba[2], b: +rgba[3], a: rgba[4] === undefined ? 1 : +rgba[4] };
  throw new Error(`cannot parse colour: ${value}`);
}

function resolve(theme, name) {
  let value = THEMES[theme][name];
  if (value === undefined) throw new Error(`${theme}: ${name} is not defined`);
  for (let i = 0; i < 10 && value.startsWith("var("); i++) {
    value = THEMES[theme][value.slice(4, -1).trim()];
  }
  return parseColor(value);
}

const over = (fg, bg) => ({
  r: fg.a * fg.r + (1 - fg.a) * bg.r,
  g: fg.a * fg.g + (1 - fg.a) * bg.g,
  b: fg.a * fg.b + (1 - fg.a) * bg.b,
});
const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
function ratio(theme, fgName, bgName) {
  const bg = resolve(theme, bgName);
  const fg = over(resolve(theme, fgName), bg);
  const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

// [foreground token, background token, minimum ratio, what it is, theme override]
// Paper surfaces use the light scope in both themes, hence the override.
const PAIRS = [
  ["--foreground", "--background", 4.5, "Body text on canvas"],
  ["--card-foreground", "--card", 4.5, "Body text on card"],
  ["--muted-foreground", "--background", 4.5, "Muted text on canvas"],
  ["--muted-foreground", "--card", 4.5, "Muted text on card"],
  ["--green-ink", "--background", 4.5, "Green text on canvas"],
  ["--red-ink", "--background", 4.5, "Red text on canvas"],
  ["--red-ink", "--card", 4.5, "Red text on card"],
  ["--primary-foreground", "--primary", 4.5, "Primary button label"],
  ["--on-accent", "--pitch-green", 4.5, "Label on Pitch Green fill"],
  ["--on-accent", "--touchline-red", 3.0, "Label on Touchline Red fill (bold UI text)"],
  ["--input", "--background", 3.0, "Input border vs canvas (UI)"],
  ["--control", "--card", 3.0, "Checkbox / radio border (UI)"],
  ["--pitch-green", "--background", 4.5, "Pitch Green as text on canvas"],
  ["--paper-foreground", "--paper", 4.5, "Paper ink on paper", "light"],
  ["--muted-foreground", "--paper", 4.5, "Muted text on paper", "light"],
  ["--input", "--paper", 3.0, "Input border on paper (UI)", "light"],
  ["--red-ink", "--paper", 4.5, "Red text on paper", "light"],
];

// Existing dark-theme gaps that predate the light theme. Reported, not fatal.
const KNOWN = new Set([
  "dark|Red text on canvas",
  "dark|Red text on card",
  "dark|Input border vs canvas (UI)",
  "dark|Checkbox / radio border (UI)",
  "dark|Pitch Green as text on canvas",
]);

let unexpected = 0;
for (const theme of ["light", "dark"]) {
  console.log(`\n${theme.toUpperCase()}`);
  for (const [fg, bg, min, label, override] of PAIRS) {
    const t = override ?? theme;
    if (override && theme === "dark" && label.includes("on paper")) {
      // evaluated once, under the light scope; skip the duplicate row
      continue;
    }
    const r = ratio(t, fg, bg);
    const ok = r >= min;
    const known = !ok && KNOWN.has(`${theme}|${label}`);
    if (!ok && !known) unexpected++;
    const tag = ok ? "pass" : known ? "known" : "FAIL";
    console.log(`  ${tag.padEnd(5)} ${r.toFixed(2).padStart(5)}  (min ${min})  ${label}`);
  }
}

console.log(unexpected ? `\n${unexpected} unexpected failure(s)` : "\nAll pairs pass (known dark gaps listed above).");
process.exit(unexpected ? 1 : 0);
