"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

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
        <motion.input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          inputMode="numeric"
          maxLength={1}
          animate={digit ? "animate" : "initial"}
          variants={flipDigit(reduced)}
          className="h-12 w-10 border-0 border-b-2 border-hairline-24 bg-transparent text-center font-display text-2xl tabular-nums text-chalk outline-none focus:border-chalk"
        />
      ))}
    </div>
  );
}
