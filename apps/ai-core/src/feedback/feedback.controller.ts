import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';

import { CurrentCoach } from '../auth/coach.decorator.js';
import type { CoachContext } from '../auth/coach-context.js';
import { CoachGuard } from '../auth/coach.guard.js';
import { SupabaseService } from '../supabase/supabase.service.js';

const feedbackSchema = z.object({
  recommendationId: z.string().uuid(),
  status: z.enum(['accepted', 'modified', 'rejected']),
  comment: z.string().max(2000).optional(),
  outcome: z.string().max(2000).optional(),
});

@Controller('feedback')
@UseGuards(CoachGuard)
export class FeedbackController {
  constructor(private readonly supabase: SupabaseService) {}

  @Post()
  async record(@CurrentCoach() coach: CoachContext, @Body() body: unknown) {
    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }

    const { recommendationId, status, comment, outcome } = parsed.data;

    // Confirm the recommendation belongs to this club before writing, so a
    // coach can only leave feedback on their own club's recommendations.
    const { data: rec } = await this.supabase.admin
      .from('ai_recommendations')
      .select('id')
      .eq('id', recommendationId)
      .eq('club_id', coach.clubId)
      .maybeSingle();

    if (!rec) {
      throw new BadRequestException('Recommendation not found for this club');
    }

    const { error } = await this.supabase.admin.from('coach_feedback').upsert(
      {
        club_id: coach.clubId,
        recommendation_id: recommendationId,
        coach_id: coach.coachId,
        status,
        comment: comment ?? null,
        outcome: outcome ?? null,
      },
      { onConflict: 'recommendation_id' },
    );

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { ok: true };
  }
}
