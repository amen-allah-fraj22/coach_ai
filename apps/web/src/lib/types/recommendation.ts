// Mirrors apps/ai-core/src/assistant/recommendation.schema.ts. Kept in sync
// by hand for the MVP; a shared package is the obvious later refactor.

export interface Recommendation {
  headline: string;
  summary: string;
  formation?: string;
  starting_xi?: { player: string; role: string }[];
  attacking_plan?: string[];
  defensive_plan?: string[];
  pressing_plan?: string[];
  transition_plan?: string[];
  set_pieces?: string[];
  risks?: string[];
  alternatives?: { name: string; rationale: string }[];
  substitutions?: string[];
  training_focus?: string[];
  reasoning: string;
}

export interface AskResult {
  recommendationId: string | null;
  recommendation: Recommendation;
  provider: string;
}

export type FeedbackStatus = "accepted" | "modified" | "rejected";
