import { Logger } from '@nestjs/common';

import type {
  LlmChatRequest,
  LlmChatResponse,
  LlmMessage,
  LlmProvider,
  LlmToolCall,
} from './llm.types.js';

/**
 * Talks to Gemini's generateContent REST endpoint directly rather than
 * through an SDK: one fewer dependency to keep in step, and the v1beta
 * request shape is stable. Everything vendor-specific stops at this file.
 */

const DEFAULT_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args?: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

interface GeminiResponse {
  candidates?: {
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
}

export interface GeminiProviderOptions {
  apiKey: string;
  model: string;
  baseUrl?: string;
  /** Injectable for tests. */
  fetchImpl?: typeof fetch;
}

export class GeminiProvider implements LlmProvider {
  readonly id: string;

  private readonly logger = new Logger(GeminiProvider.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: GeminiProviderOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.id = `gemini:${options.model}`;
  }

  async chat(request: LlmChatRequest): Promise<LlmChatResponse> {
    const body: Record<string, unknown> = {
      systemInstruction: { parts: [{ text: request.system }] },
      contents: toGeminiContents(request.messages),
      generationConfig: { temperature: request.temperature ?? 0.4 },
    };

    if (request.tools.length > 0) {
      body.tools = [
        {
          functionDeclarations: request.tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          })),
        },
      ];
    }

    const response = await this.fetchImpl(
      `${this.baseUrl}/models/${this.model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(
        `Gemini request failed (${response.status}): ${detail.slice(0, 500)}`,
      );
    }

    const payload = (await response.json()) as GeminiResponse;

    if (payload.promptFeedback?.blockReason) {
      throw new Error(
        `Gemini blocked the prompt: ${payload.promptFeedback.blockReason}`,
      );
    }

    const parts = payload.candidates?.[0]?.content?.parts ?? [];

    const calls: LlmToolCall[] = parts
      .filter((part): part is GeminiPart & { functionCall: NonNullable<GeminiPart['functionCall']> } =>
        Boolean(part.functionCall),
      )
      .map((part, index) => ({
        // Gemini doesn't return call ids; the name+index pair is enough to
        // match a result back to its call within one exchange.
        id: `${part.functionCall.name}-${index}`,
        name: part.functionCall.name,
        arguments: part.functionCall.args ?? {},
      }));

    if (calls.length > 0) {
      return { kind: 'tool_calls', calls };
    }

    const text = parts
      .map((part) => part.text ?? '')
      .join('')
      .trim();

    if (!text) {
      this.logger.warn(
        `Gemini returned no text or tool calls (finishReason=${payload.candidates?.[0]?.finishReason})`,
      );
    }

    return { kind: 'text', text };
  }
}

export function toGeminiContents(messages: LlmMessage[]): GeminiContent[] {
  return messages.map((message): GeminiContent => {
    switch (message.role) {
      case 'user':
        return { role: 'user', parts: [{ text: message.text }] };
      case 'assistant':
        return { role: 'model', parts: [{ text: message.text }] };
      case 'assistant_tool_calls':
        return {
          role: 'model',
          parts: message.calls.map((call) => ({
            functionCall: { name: call.name, args: call.arguments },
          })),
        };
      case 'tool_result':
        return {
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: message.call.name,
                // The REST shape requires an object here, so primitive and
                // array results get wrapped.
                response: wrapResponse(message.result),
              },
            },
          ],
        };
    }
  });
}

function wrapResponse(result: unknown): Record<string, unknown> {
  if (result !== null && typeof result === 'object' && !Array.isArray(result)) {
    return result as Record<string, unknown>;
  }
  return { result };
}
