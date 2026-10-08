"use client";

import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

/** Submit button that morphs into a spinning-ball loader while pending. */
export function AuthSubmitButton({
  pending,
  label,
  disabled,
  onClick,
  type = "submit",
}: {
  pending: boolean;
  label: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "submit" | "button";
}) {
  return (
    <Button
      type={type}
      variant="primary"
      size="full"
      disabled={pending || disabled}
      onClick={onClick}
      className="group"
    >
      {pending ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        >
          <Icon name="sports_soccer" size={18} />
        </motion.span>
      ) : (
        <>
          {label}{" "}
          <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </>
      )}
    </Button>
  );
}
