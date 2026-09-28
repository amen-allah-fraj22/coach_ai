import type { SupabaseClient } from '@supabase/supabase-js';

import type { CoachContext } from '../../auth/coach-context.js';
import type { JsonSchema } from '../../llm/llm.types.js';

export interface ToolContext {
  db: SupabaseClient;
  coach: CoachContext;
}

export interface AssistantTool {
  name: string;
  description: string;
  parameters: JsonSchema;
  /**
   * Returns plain JSON for the model. Implementations must filter by
   * ctx.coach.clubId — the db client here is service-role and bypasses RLS.
   */
  run(args: Record<string, unknown>, ctx: ToolContext): Promise<unknown>;
}

/** The terminal tool name; calling it ends the agent loop. */
export const SUBMIT_TOOL = 'submit_recommendation';

export function optionalString(
  args: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = args[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function optionalNumber(
  args: Record<string, unknown>,
  key: string,
): number | undefined {
  const value = args[key];
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export function stringArray(
  args: Record<string, unknown>,
  key: string,
): string[] {
  const value = args[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}
