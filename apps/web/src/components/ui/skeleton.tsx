import { cn } from "@/lib/utils";

/** Not designed by Stitch (§8) — a plain pulsing block over the slate surface. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse bg-slate-grass", className)}
      {...props}
    />
  );
}

export { Skeleton };
