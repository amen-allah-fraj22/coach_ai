"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  AskResult,
  FeedbackStatus,
} from "@/lib/types/recommendation";

const AI_CORE_URL = process.env.AI_CORE_URL ?? "http://localhost:3001";

export type AskState = {
  error: string | null;
  result?: AskResult | null;
  question?: string;
};

/**
 * Forwards the coach's question to the AI Core service. The user's Supabase
 * access token is passed as a bearer token; the AI Core verifies it and
 * derives club_id itself, so nothing about which club is trusted from here.
 */
export async function askAssistant(
  _prevState: AskState,
  formData: FormData,
): Promise<AskState> {
  const question = String(formData.get("question") ?? "").trim();
  const matchId = String(formData.get("matchId") ?? "") || null;

  if (!question) {
    return { error: "Please enter a question." };
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Your session has expired. Please log in again." };
  }

  try {
    const response = await fetch(`${AI_CORE_URL}/assistant/ask`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ question, matchId }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return {
        error: `The assistant could not answer (${response.status}). ${detail.slice(0, 200)}`,
      };
    }

    const result = (await response.json()) as AskResult;
    return { error: null, result, question };
  } catch {
    return {
      error:
        "Could not reach the AI service. Make sure the AI Core is running (pnpm dev:ai-core).",
    };
  }
}

export async function sendFeedback(
  recommendationId: string,
  status: FeedbackStatus,
  comment?: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { ok: false, error: "Session expired." };
  }

  try {
    const response = await fetch(`${AI_CORE_URL}/feedback`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ recommendationId, status, comment }),
    });

    if (!response.ok) {
      return { ok: false, error: `Feedback failed (${response.status}).` };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reach the AI service." };
  }
}
