import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { SupabaseService } from '../supabase/supabase.service.js';
import { COACH_CONTEXT_KEY, type CoachContext } from './coach-context.js';

/**
 * The trust boundary for this service.
 *
 * The caller presents the coach's Supabase access token; we verify it against
 * Supabase and derive club_id from the coaches table. club_id is never read
 * from the request body — if it were, any caller could address another club's
 * data, since this service holds a service-role key that bypasses RLS.
 */
@Injectable()
export class CoachGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const header = request.headers.authorization ?? '';
    const token = header.toLowerCase().startsWith('bearer ')
      ? header.slice(7).trim()
      : '';

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const userId = await this.supabase.getUserIdFromToken(token);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const { data: coach, error } = await this.supabase.admin
      .from('coaches')
      .select(
        'id, club_id, full_name, preferred_language, preferred_formation, playing_style, risk_tolerance',
      )
      .eq('id', userId)
      .maybeSingle();

    if (error || !coach) {
      throw new UnauthorizedException('No coach profile for this account');
    }

    const coachContext: CoachContext = {
      coachId: coach.id as string,
      clubId: coach.club_id as string,
      fullName: coach.full_name as string,
      language: coach.preferred_language as CoachContext['language'],
      preferredFormation: (coach.preferred_formation as string | null) ?? null,
      playingStyle: (coach.playing_style as string | null) ?? null,
      riskTolerance:
        (coach.risk_tolerance as CoachContext['riskTolerance']) ?? null,
    };

    Reflect.set(request, COACH_CONTEXT_KEY, coachContext);
    return true;
  }
}
