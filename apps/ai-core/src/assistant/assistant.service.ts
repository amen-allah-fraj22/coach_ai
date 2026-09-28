import { Inject, Injectable, Logger } from '@nestjs/common';

import type { CoachContext } from '../auth/coach-context.js';
import {
  LLM_PROVIDER,
  type LlmMessage,
  type LlmProvider,
  type LlmToolCall,
  type LlmToolDefinition,
} from '../llm/llm.types.js';
import { SupabaseService } from '../supabase/supabase.service.js';
import { buildSystemPrompt } from './prompt.js';
import { recommendationSchema, type Recommendation } from './recommendation.schema.js';
import { footballTools } from './tools/football.tools.js';
import { SUBMIT_TOOL, type AssistantTool, type ToolContext } from './tools/tool.types.js';

export interface AskResult {
  recommendationId: string | null;
  recommendation: Recommendation;
  provider: string;
}

/** Hard ceiling on tool-call rounds, so a confused model can't loop forever. */
const MAX_STEPS = 8;

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);
  private readonly tools: Map<string, AssistantTool>;
  private readonly toolDefinitions: LlmToolDefinition[];

  constructor(
    @Inject(LLM_PROVIDER) private readonly llm: LlmProvider,
    private readonly supabase: SupabaseService,
  ) {
    this.tools = new Map(footballTools.map((tool) => [tool.name, tool]));

    this.toolDefinitions = [
      ...footballTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      })),
      {
        name: SUBMIT_TOOL,
        description:
          'Deliver the final answer to the coach. Call this exactly once, when you have gathered enough data. Do not answer in plain text.',
        parameters: recommendationSchema,
      },
    ];
  }

  async ask(
    coach: CoachContext,
    question: string,
    matchId: string | null,
  ): Promise<AskResult> {
    const toolCtx: ToolContext = { db: this.supabase.admin, coach };
    const messages: LlmMessage[] = [{ role: 'user', text: question }];
    const system = buildSystemPrompt(coach);

    for (let step = 0; step < MAX_STEPS; step += 1) {
      const response = await this.llm.chat({
        system,
        messages,
        tools: this.toolDefinitions,
        temperature: 0.4,
      });

      if (response.kind === 'text') {
        // The model answered in prose instead of submitting. Nudge it once
        // by folding the text back in and asking for the structured call.
        messages.push({ role: 'assistant', text: response.text });
        messages.push({
          role: 'user',
          text: `Deliver this via the ${SUBMIT_TOOL} tool, not as plain text.`,
        });
        continue;
      }

      const submitCall = response.calls.find((c) => c.name === SUBMIT_TOOL);
      if (submitCall) {
        const recommendation = submitCall.arguments as unknown as Recommendation;
        const recommendationId = await this.persist(
          coach,
          question,
          matchId,
          recommendation,
        );
        return { recommendationId, recommendation, provider: this.llm.id };
      }

      // Otherwise: data tool calls. Record them, run them, feed results back.
      messages.push({ role: 'assistant_tool_calls', calls: response.calls });

      for (const call of response.calls) {
        const result = await this.runTool(call, toolCtx);
        messages.push({ role: 'tool_result', call, result });
      }
    }

    throw new Error(
      `Assistant did not produce a recommendation within ${MAX_STEPS} steps`,
    );
  }

  private async runTool(
    call: LlmToolCall,
    ctx: ToolContext,
  ): Promise<unknown> {
    const tool = this.tools.get(call.name);
    if (!tool) {
      return { error: `Unknown tool: ${call.name}` };
    }

    try {
      return await tool.run(call.arguments, ctx);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Tool ${call.name} failed: ${message}`);
      // Hand the error to the model rather than aborting — it can adjust
      // (wrong id, missing arg) and try another call.
      return { error: message };
    }
  }

  private async persist(
    coach: CoachContext,
    question: string,
    matchId: string | null,
    recommendation: Recommendation,
  ): Promise<string | null> {
    const { data, error } = await this.supabase.admin
      .from('ai_recommendations')
      .insert({
        club_id: coach.clubId,
        coach_id: coach.coachId,
        match_id: matchId,
        recommendation_type: 'match_plan',
        question,
        language: coach.language,
        recommendation,
        reasoning_context: { provider: this.llm.id },
      })
      .select('id')
      .single();

    if (error) {
      // A storage failure shouldn't lose the coach's answer; return it
      // unsaved and log, so the feedback loop is the only thing degraded.
      this.logger.error(`Failed to persist recommendation: ${error.message}`);
      return null;
    }

    return data.id as string;
  }
}
