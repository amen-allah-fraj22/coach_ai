"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { useTranslations } from "next-intl";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Recommendation } from "@convex/aiRecommendation";
import { MatchPlanCard } from "@/components/assistant/match-plan-card";
import { AiThinking } from "@/components/assistant/ai-thinking";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";

interface MatchOption {
  id: string;
  label: string;
}

interface PastRecommendation {
  id: string;
  headline: string;
  question: string;
  createdAt: number;
}

interface AskResult {
  recommendationId: Id<"aiRecommendations">;
  recommendation: Recommendation;
  provider: string;
}

export function AssistantChat({
  matches,
  defaultMatchId,
  defaultQuestion,
  pastRecommendations,
}: {
  matches: MatchOption[];
  defaultMatchId?: string;
  defaultQuestion?: string;
  pastRecommendations: PastRecommendation[];
}) {
  const t = useTranslations("assistant");
  const ask = useAction(api.ai.ask);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskResult | null>(null);
  const [question, setQuestion] = useState(defaultQuestion ?? "");
  const [mobileTab, setMobileTab] = useState("chat");

  const quickPrompts = [
    { icon: "swap_horiz", label: t("quickSubs") },
    { icon: "speed", label: t("quickPressing") },
    { icon: "sports", label: t("quickSetPieces") },
  ];

  async function onSubmit(formData: FormData) {
    setError(null);
    const q = String(formData.get("question") ?? "").trim();
    if (!q) return;
    const matchId = String(formData.get("matchId") ?? "");

    setPending(true);
    setMobileTab("plan");
    try {
      const res = await ask({
        question: q,
        matchId: (matchId || undefined) as Id<"matches"> | undefined,
      });
      setResult(res);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(/429|quota|rate.?limit/i.test(message) ? t("quotaError") : message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="md:hidden">
        <SegmentedTabs
          value={mobileTab}
          onChange={setMobileTab}
          tabs={[
            { value: "plan", label: t("matchPlanTab") },
            { value: "chat", label: t("touchlineChatTab") },
          ]}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_1.3fr]">
        <div className={`flex flex-col gap-4 ${mobileTab === "chat" ? "" : "hidden md:flex"}`}>
          <form action={onSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="question">{t("questionLabel")}</Label>
              <Textarea
                id="question"
                name="question"
                required
                rows={3}
                placeholder={t("placeholder")}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((p) => (
                <button key={p.label} type="button" onClick={() => setQuestion(p.label)}>
                  <Chip className="flex items-center gap-1">
                    <Icon name={p.icon} size={14} />
                    {p.label}
                  </Chip>
                </button>
              ))}
            </div>

            {matches.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="matchId">{t("matchContext")}</Label>
                <SelectNative id="matchId" name="matchId" defaultValue={defaultMatchId ?? ""}>
                  <option value="">{t("noMatch")}</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {match.label}
                    </option>
                  ))}
                </SelectNative>
              </div>
            )}

            {error && (
              <p className="border border-touchline-red bg-touchline-red/10 px-3 py-2 text-sm text-touchline-red">
                {error}
              </p>
            )}

            <Button type="submit" disabled={pending} className="self-start">
              {pending ? t("thinking") : t("ask")}
            </Button>
          </form>

          <div className="flex flex-col gap-2 border-t border-hairline-08 pt-4">
            <p className="text-label-tactical text-muted-foreground">{t("pastRecommendations")}</p>
            {pastRecommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noPastRecommendations")}</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {pastRecommendations.map((rec) => (
                  <li key={rec.id} className="border-b border-hairline-08 py-2 text-sm">
                    <p className="truncate text-chalk">{rec.headline}</p>
                    <p className="truncate text-xs text-muted-foreground">{rec.question}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={mobileTab === "plan" ? "" : "hidden md:block"}>
          {pending && <AiThinking label={t("thinking")} />}
          {!pending && result && (
            <MatchPlanCard
              recommendation={result.recommendation}
              recommendationId={result.recommendationId}
              provider={result.provider}
            />
          )}
          {!pending && !result && (
            <div className="flex min-h-40 items-center justify-center border border-dashed border-hairline-16 p-6 text-center text-sm text-muted-foreground">
              {t("emptyPlan")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
