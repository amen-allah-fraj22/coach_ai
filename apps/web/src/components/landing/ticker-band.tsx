import { useTranslations } from "next-intl";

import { marqueeClassName } from "@/lib/motion";

export function TickerBand() {
  const t = useTranslations("home.ticker");
  const items = t.raw("items") as string[];
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden border-b border-hairline-08 bg-slate-grass py-2">
      <div className={`flex w-max gap-10 whitespace-nowrap text-label-tactical text-muted-foreground ${marqueeClassName}`}>
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            <span>{item}</span>
            <span aria-hidden className="text-pitch-green">
              •
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
