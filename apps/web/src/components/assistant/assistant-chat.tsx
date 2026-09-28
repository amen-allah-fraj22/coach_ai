"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { askAssistant, type AskState } from "@/app/[locale]/(app)/assistant/actions";
import { MatchPlanCard } from "@/components/assistant/match-plan-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";

interface MatchOption {
  id: string;
  label: string;
}

const initialState: AskState = { error: null };

export function AssistantChat({ matches }: { matches: MatchOption[] }) {
  const t = useTranslations("assistant");
  const [state, formAction, pending] = useActionState(askAssistant, initialState);

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="question">{t("title")}</Label>
          <Textarea
            id="question"
            name="question"
            required
            rows={3}
            placeholder={t("placeholder")}
            defaultValue={state.question ?? ""}
          />
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

        {state.error && <p className="text-sm text-destructive">{state.error}</p>}

        <Button type="submit" disabled={pending} className="self-start">
          {pending ? t("thinking") : t("ask")}
        </Button>
      </form>

      {state.result && (
        <MatchPlanCard
          recommendation={state.result.recommendation}
          recommendationId={state.result.recommendationId}
          provider={state.result.provider}
        />
      )}
    </div>
  );
}
