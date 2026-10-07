import { cn } from "@/lib/utils";

/**
 * Material Symbols Outlined, self-hosted (see material-symbols/outlined.css,
 * imported once in the locale layout). The font renders a glyph via
 * ligature substitution when its text content is the symbol's name, e.g.
 * <Icon name="dashboard" /> — see https://fonts.google.com/icons for names.
 */
export function Icon({
  name,
  className,
  label,
  size = 24,
}: {
  name: string;
  className?: string;
  /** Accessible name. Omit for a purely decorative icon (default). */
  label?: string;
  size?: number;
}) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={{ fontSize: size }}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {name}
    </span>
  );
}
