import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Env } from '../config/env.js';

@Injectable()
export class SupabaseService {
  /**
   * Service-role client: bypasses RLS. Callers must scope every query by the
   * club_id resolved from the verified caller (see CoachGuard) — never from
   * request input.
   */
  readonly admin: SupabaseClient;

  constructor(private readonly config: ConfigService<Env, true>) {
    this.admin = createClient(
      this.config.get('SUPABASE_URL', { infer: true }),
      this.config.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true }),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }

  /** Verifies a caller's Supabase access token and returns the user id. */
  async getUserIdFromToken(accessToken: string): Promise<string | null> {
    const { data, error } = await this.admin.auth.getUser(accessToken);
    if (error || !data.user) return null;
    return data.user.id;
  }
}
