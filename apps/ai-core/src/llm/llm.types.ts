/**
 * Provider-agnostic LLM contract.
 *
 * Nothing outside src/llm/ may import a vendor SDK or mention a vendor's
 * wire format: swapping Gemini for OpenAI/Anthropic must mean adding one
 * file here and changing LLM_PROVIDER, never touching the orchestrator or
 * the tools. (Cahier des charges, Section 6: "LLM portability".)
 */

/** A JSON Schema object describing a tool's arguments. */
export type JsonSchema = Record<string, unknown>;

export interface LlmToolDefinition {
  name: string;
  description: string;
  parameters: JsonSchema;
}

export interface LlmToolCall {
  /** Opaque per-call id; providers that don't supply one get a generated id. */
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export type LlmMessage =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string }
  | { role: 'assistant_tool_calls'; calls: LlmToolCall[] }
  | { role: 'tool_result'; call: LlmToolCall; result: unknown };

export interface LlmChatRequest {
  system: string;
  messages: LlmMessage[];
  tools: LlmToolDefinition[];
  temperature?: number;
}

export type LlmChatResponse =
  | { kind: 'text'; text: string }
  | { kind: 'tool_calls'; calls: LlmToolCall[] };

export interface LlmProvider {
  /** Identifier recorded alongside stored recommendations. */
  readonly id: string;
  chat(request: LlmChatRequest): Promise<LlmChatResponse>;
}

export const LLM_PROVIDER = Symbol('LLM_PROVIDER');
