// Provider-agnostic LLM contract + the Gemini implementation, ported from
// the former NestJS AI Core. This file is the only place that knows a
// vendor's wire format; swapping to OpenAI/Anthropic means adding another
// provider here and changing LLM_PROVIDER, with no change to the agent loop.
//
// Runs inside a Convex action (which may call fetch); no Node-only APIs.

export type JsonSchema = Record<string, unknown>;

export interface LlmToolDefinition {
  name: string;
  description: string;
  parameters: JsonSchema;
}

export interface LlmToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export type LlmMessage =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string }
  | { role: "assistant_tool_calls"; calls: LlmToolCall[] }
  | { role: "tool_result"; call: LlmToolCall; result: unknown };

export interface LlmChatRequest {
  system: string;
  messages: LlmMessage[];
  tools: LlmToolDefinition[];
  temperature?: number;
}

export type LlmChatResponse =
  | { kind: "text"; text: string }
  | { kind: "tool_calls"; calls: LlmToolCall[] };

export interface LlmProvider {
  readonly id: string;
  chat(request: LlmChatRequest): Promise<LlmChatResponse>;
}

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta";

interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args?: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
}

export class GeminiProvider implements LlmProvider {
  readonly id: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.id = `gemini:${model}`;
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

    const response = await fetch(
      `${GEMINI_BASE_URL}/models/${this.model}:generateContent`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": this.apiKey,
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `Gemini request failed (${response.status}): ${detail.slice(0, 500)}`,
      );
    }

    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: GeminiPart[] } }[];
      promptFeedback?: { blockReason?: string };
    };

    if (payload.promptFeedback?.blockReason) {
      throw new Error(
        `Gemini blocked the prompt: ${payload.promptFeedback.blockReason}`,
      );
    }

    const parts = payload.candidates?.[0]?.content?.parts ?? [];
    const calls: LlmToolCall[] = parts
      .filter(
        (p): p is GeminiPart & { functionCall: NonNullable<GeminiPart["functionCall"]> } =>
          Boolean(p.functionCall),
      )
      .map((p, index) => ({
        id: `${p.functionCall.name}-${index}`,
        name: p.functionCall.name,
        arguments: p.functionCall.args ?? {},
      }));

    if (calls.length > 0) return { kind: "tool_calls", calls };

    const text = parts.map((p) => p.text ?? "").join("").trim();
    return { kind: "text", text };
  }
}

export function toGeminiContents(messages: LlmMessage[]) {
  return messages.map((message) => {
    switch (message.role) {
      case "user":
        return { role: "user" as const, parts: [{ text: message.text }] };
      case "assistant":
        return { role: "model" as const, parts: [{ text: message.text }] };
      case "assistant_tool_calls":
        return {
          role: "model" as const,
          parts: message.calls.map((call) => ({
            functionCall: { name: call.name, args: call.arguments },
          })),
        };
      case "tool_result":
        return {
          role: "user" as const,
          parts: [
            {
              functionResponse: {
                name: message.call.name,
                response: wrapResponse(message.result),
              },
            },
          ],
        };
    }
  });
}

function wrapResponse(result: unknown): Record<string, unknown> {
  if (result !== null && typeof result === "object" && !Array.isArray(result)) {
    return result as Record<string, unknown>;
  }
  return { result };
}

/** Builds the configured provider from Convex env vars. */
export function getProvider(): LlmProvider {
  const provider = process.env.LLM_PROVIDER ?? "gemini";
  if (provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Run: npx convex env set GEMINI_API_KEY <key>",
      );
    }
    return new GeminiProvider(apiKey, process.env.GEMINI_MODEL ?? "gemini-2.5-flash");
  }
  throw new Error(`Unsupported LLM_PROVIDER: ${provider}`);
}
