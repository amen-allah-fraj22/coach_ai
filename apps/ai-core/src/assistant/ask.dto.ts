import { z } from 'zod';

export const askSchema = z.object({
  question: z.string().min(1, 'question is required').max(4000),
  matchId: z.string().uuid().nullable().optional(),
});

export type AskDto = z.infer<typeof askSchema>;
