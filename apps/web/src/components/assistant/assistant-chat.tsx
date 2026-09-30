"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { useTranslations } from "next-intl";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { Recommendation } from "@convex/aiRecommendation";
import { MatchPlanCard } from "@/components/assistant/match-plan-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";

interface MatchOption {
  id: string;
  label: string;
}

interface AskResult {
  recommendationId: Id<"aiRecommendations">;
  recommendation: Recommendation;
  provider: string;
}

export function AssistantChat({ matches }: { matches: MatchOption[] }) {
  const t = useTranslations("assistant");
  const ask = useAction(api.ai.ask);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskResult | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    const question = String(formData.get("question") ?? "").trim();
    if (!question) return;
    const matchId = String(formData.get("matchId") ?? "");

    setPending(true);
    try {
      const res = await ask({
        question,
        matchId: (matchId || undefined) as Id<"matches"> | undefined,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form action={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="question">{t("title")}</Label>
          <Textarea id="question" name="question" required rows={3} placeholder={t("placeholder")} />
        </div>

        {matches.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="matchId">{t("matchContext")}</Label>
            <SelectNative id="matchId" name="matchId" defaultValue="">
              <option value="">{t("noMatch")}</option>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.label}
                </option>
              ))}
            </SelectNative>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={pending} className="self-start">
          {pending ? t("thinking") : t("ask")}
        </Button>
      </form>

      {result && (
        <MatchPlanCard
          recommendation={result.recommendation}
          recommendationId={result.recommendationId}
          provider={result.provider}
        />
      )}
    </div>
  );
}
