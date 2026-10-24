"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { flipDigit } from "@/lib/motion";

const LENGTH = 6;

/** Six underlined digit boxes; each digit rolls in (flipDigit) as it's typed. */
export function CodeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: LENGTH }, (_, i) => value[i] ?? ""),
  );
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const reduced = useReducedMotion() ?? false;

  function commit(next: string[]) {
    setDigits(next);
    onChange(next.join(""));
  }

  function handleChange(i: number, raw: string) {
    const char = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = char;
    commit(next);
    if (char && i < LENGTH - 1) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array.from({ length: LENGTH }, (_, i) => pasted[i] ?? "");
    commit(next);
    refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  }

  return (
    <div className="flex justify-between gap-2" dir="ltr">
      {digits.map((digit, i) => (
        // The input stays visible and holds the caret; the typed digit is
        // drawn by the overlay so it can roll in without hiding empty boxes.
        <div key={i} className="relative h-12 w-10" style={{ perspective: 200 }}>
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1}`}
            maxLength={1}
            className="size-full border-0 border-b-2 border-hairline-24 bg-slate-grass/40 text-center font-display text-2xl text-transparent caret-chalk outline-none focus:border-chalk"
          />
          <AnimatePresence initial={false}>
            {digit && (
              <motion.span
                key={digit}
                aria-hidden
                variants={flipDigit(reduced)}
                initial="initial"
                animate="animate"
                exit="exit"
                className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-2xl tabular-nums text-chalk"
              >
                {digit}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
