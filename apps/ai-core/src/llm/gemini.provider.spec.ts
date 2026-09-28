import { describe, expect, it } from 'vitest';

import { toGeminiContents } from './gemini.provider.js';
import type { LlmMessage } from './llm.types.js';

describe('toGeminiContents', () => {
  it('maps user and assistant text to the right roles', () => {
    const messages: LlmMessage[] = [
      { role: 'user', text: 'hello' },
      { role: 'assistant', text: 'hi' },
    ];

    expect(toGeminiContents(messages)).toEqual([
      { role: 'user', parts: [{ text: 'hello' }] },
      { role: 'model', parts: [{ text: 'hi' }] },
    ]);
  });

  it('maps tool calls to functionCall parts on the model role', () => {
    const messages: LlmMessage[] = [
      {
        role: 'assistant_tool_calls',
        calls: [{ id: 'get_squad-0', name: 'get_squad', arguments: { team_id: 't1' } }],
      },
    ];

    expect(toGeminiContents(messages)).toEqual([
      {
        role: 'model',
        parts: [{ functionCall: { name: 'get_squad', args: { team_id: 't1' } } }],
      },
    ]);
  });

  it('wraps non-object tool results so functionResponse.response is always an object', () => {
    const messages: LlmMessage[] = [
      {
        role: 'tool_result',
        call: { id: 'x-0', name: 'x', arguments: {} },
        result: [1, 2, 3],
      },
    ];

    const [content] = toGeminiContents(messages);
    expect(content.parts[0].functionResponse?.response).toEqual({
      result: [1, 2, 3],
    });
  });

  it('passes object tool results through unwrapped', () => {
    const messages: LlmMessage[] = [
      {
        role: 'tool_result',
        call: { id: 'x-0', name: 'x', arguments: {} },
        result: { players: [] },
      },
    ];

    const [content] = toGeminiContents(messages);
    expect(content.parts[0].functionResponse?.response).toEqual({ players: [] });
  });
});
