import { describe, expect, it, vi } from 'vitest';

import type { CoachContext } from '../auth/coach-context.js';
import type {
  LlmChatRequest,
  LlmChatResponse,
  LlmProvider,
} from '../llm/llm.types.js';
import type { SupabaseService } from '../supabase/supabase.service.js';
import { AssistantService } from './assistant.service.js';
import { SUBMIT_TOOL } from './tools/tool.types.js';

const coach: CoachContext = {
  coachId: 'coach-1',
  clubId: 'club-1',
  fullName: 'Test Coach',
  language: 'en',
  preferredFormation: '4-3-3',
  playingStyle: 'possession',
  riskTolerance: 'medium',
};

/**
 * A Supabase double. The players query builder is chainable through any
 * number of .eq()/.order() calls and is thenable, so it matches however the
 * real get_squad tool composes its query (club_id, optional team_id, two
 * orders) and actually resolves — rather than erroring and being swallowed.
 */
function fakeSupabase(capturedRows: Record<string, unknown>[]): SupabaseService {
  const players = [{ id: 'p1', name: 'Ahmed', position: 'CM' }];

  const playersQuery: Record<string, unknown> = {};
  for (const method of ['select', 'eq', 'order', 'in', 'ilike', 'limit']) {
    playersQuery[method] = () => playersQuery;
  }
  playersQuery.then = (
    resolve: (value: { data: unknown; error: null }) => unknown,
  ) => resolve({ data: players, error: null });

  const admin = {
    from(table: string) {
      if (table === 'players') {
        return playersQuery;
      }
      if (table === 'ai_recommendations') {
        return {
          insert: (row: Record<string, unknown>) => {
            capturedRows.push(row);
            return {
              select: () => ({
                single: () =>
                  Promise.resolve({ data: { id: 'rec-1' }, error: null }),
              }),
            };
          },
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  };
  return { admin } as unknown as SupabaseService;
}

/** Scripts provider turns in order; asserts it isn't called past the script. */
function scriptedProvider(
  turns: LlmChatResponse[],
  seen: LlmChatRequest[] = [],
): LlmProvider {
  let i = 0;
  return {
    id: 'fake:test',
    chat(request: LlmChatRequest): Promise<LlmChatResponse> {
      seen.push(request);
      if (i >= turns.length) throw new Error('provider called too many times');
      return Promise.resolve(turns[i++]);
    },
  };
}

describe('AssistantService.ask', () => {
  it('runs a data tool, feeds the result back, then persists the submitted recommendation', async () => {
    const captured: Record<string, unknown>[] = [];
    const seen: LlmChatRequest[] = [];
    const provider = scriptedProvider(
      [
        {
          kind: 'tool_calls',
          calls: [{ id: 'get_squad-0', name: 'get_squad', arguments: { team_id: 't1' } }],
        },
        {
          kind: 'tool_calls',
          calls: [
            {
              id: `${SUBMIT_TOOL}-0`,
              name: SUBMIT_TOOL,
              arguments: {
                headline: 'Start Ahmed',
                summary: 'He is the only fit midfielder.',
                reasoning: 'get_squad returned Ahmed at CM.',
              },
            },
          ],
        },
      ],
      seen,
    );

    const service = new AssistantService(provider, fakeSupabase(captured));
    const result = await service.ask(coach, 'Who starts in midfield?', null);

    expect(result.recommendationId).toBe('rec-1');
    expect(result.recommendation.headline).toBe('Start Ahmed');
    expect(result.provider).toBe('fake:test');
    // Persisted row is scoped to the coach's club, not to anything in input.
    expect(captured[0]).toMatchObject({ club_id: 'club-1', coach_id: 'coach-1' });

    // The second turn must carry the tool call and its result back to the
    // model — that round-trip is the whole point of the loop.
    const secondTurn = seen[1];
    expect(secondTurn.messages.some((m) => m.role === 'assistant_tool_calls')).toBe(
      true,
    );
    const toolResult = secondTurn.messages.find((m) => m.role === 'tool_result');
    expect(toolResult).toBeDefined();
    expect(JSON.stringify(toolResult)).toContain('Ahmed');
  });

  it('nudges the model to use the submit tool when it answers in prose', async () => {
    const captured: Record<string, unknown>[] = [];
    const chat = vi.fn<(r: LlmChatRequest) => Promise<LlmChatResponse>>();
    chat
      .mockResolvedValueOnce({ kind: 'text', text: 'Play 4-3-3.' })
      .mockResolvedValueOnce({
        kind: 'tool_calls',
        calls: [
          {
            id: `${SUBMIT_TOOL}-0`,
            name: SUBMIT_TOOL,
            arguments: {
              headline: 'Play 4-3-3',
              summary: 'Fits the squad.',
              reasoning: 'Coach philosophy is 4-3-3.',
            },
          },
        ],
      });

    const provider: LlmProvider = { id: 'fake:test', chat };
    const service = new AssistantService(provider, fakeSupabase(captured));
    const result = await service.ask(coach, 'How should we set up?', null);

    expect(result.recommendation.headline).toBe('Play 4-3-3');
    // Second call should carry the nudge asking for the structured tool.
    const secondReq = chat.mock.calls[1][0];
    const lastMsg = secondReq.messages.at(-1);
    expect(lastMsg?.role).toBe('user');
    expect(lastMsg && 'text' in lastMsg ? lastMsg.text : '').toContain(SUBMIT_TOOL);
  });
});
