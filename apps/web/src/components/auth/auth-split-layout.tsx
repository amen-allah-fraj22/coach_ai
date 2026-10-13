import { getTranslations } from "next-intl/server";

import { routing, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";

function BallTrajectoryIllustration() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className="w-full max-w-xs opacity-80">
      <path
        d="M10 80 Q 30 20 50 50 T 90 20"
        stroke="var(--chalk)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
        fill="none"
      />
      <circle cx="10" cy="80" r="2.5" fill="var(--pitch-green)" />
      <circle cx="50" cy="50" r="2.5" fill="var(--chalk)" />
      <circle cx="90" cy="20" r="2.5" fill="var(--touchline-red)" />
    </svg>
  );
}

export async function AuthSplitLayout({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const tApp = await getTranslations("app");

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <div className="flex flex-col items-center justify-center gap-6 border-b border-hairline-08 bg-night-pitch px-6 py-8 text-center md:w-1/2 md:border-b-0 md:border-e md:py-0">
        <span className="font-display text-2xl uppercase tracking-tight text-chalk">
          {tApp("name")}
        </span>
        <div className="hidden md:block">
          <BallTrajectoryIllustration />
        </div>
        <div className="hidden gap-3 text-xs md:flex">
          {routing.locales.map((loc) => (
            <Link
              key={loc}
              href="/login"
              locale={loc}
              className={
                loc === locale
                  ? "font-semibold text-chalk underline underline-offset-4"
                  : "text-muted-foreground hover:text-chalk"
              }
            >
              {loc.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-10 md:w-1/2">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
