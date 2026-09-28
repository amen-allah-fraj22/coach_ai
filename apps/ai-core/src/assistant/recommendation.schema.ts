import type { JsonSchema } from '../llm/llm.types.js';

/**
 * The shape of an answer. Most fields are optional so the same schema covers
 * a full match plan and a narrower question ("which midfielder starts?").
 */
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

const stringList = (description: string): JsonSchema => ({
  type: 'array',
  items: { type: 'string' },
  description,
});

/**
 * Structured output is collected as a tool call rather than via a JSON
 * response-format setting: Gemini can't combine a response schema with
 * function calling in one request, and reusing the tool mechanism means the
 * shape is enforced the same way on any provider.
 */
export const recommendationSchema: JsonSchema = {
  type: 'object',
  properties: {
    headline: {
      type: 'string',
      description: 'One line naming the decision or plan, e.g. "Attack the space behind their left-back".',
    },
    summary: {
      type: 'string',
      description: 'Two to four sentences a coach can read at a glance.',
    },
    formation: { type: 'string', description: 'Recommended formation, e.g. "4-3-3".' },
    starting_xi: {
      type: 'array',
      description: 'Suggested starting eleven. Only real players returned by get_squad.',
      items: {
        type: 'object',
        properties: {
          player: { type: 'string', description: "The player's name." },
          role: { type: 'string', description: 'Position and role in this plan.' },
        },
        required: ['player', 'role'],
      },
    },
    attacking_plan: stringList('Concrete attacking principles.'),
    defensive_plan: stringList('Concrete defensive principles.'),
    pressing_plan: stringList('Pressing triggers and intensity.'),
    transition_plan: stringList('Behaviour on winning and losing the ball.'),
    set_pieces: stringList('Set-piece instructions.'),
    risks: stringList('What could go wrong with this plan.'),
    alternatives: {
      type: 'array',
      description: 'Other approaches the coach could take instead.',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          rationale: { type: 'string' },
        },
        required: ['name', 'rationale'],
      },
    },
    substitutions: stringList('Substitution scenarios tied to game states.'),
    training_focus: stringList('What to train this week off the back of this.'),
    reasoning: {
      type: 'string',
      description:
        'Why this follows from the squad, opponent and match data retrieved. Cite the specific data points used.',
    },
  },
  required: ['headline', 'summary', 'reasoning'],
};
