export interface CoachContext {
  coachId: string;
  clubId: string;
  fullName: string;
  language: 'fr' | 'ar' | 'en';
  preferredFormation: string | null;
  playingStyle: string | null;
  riskTolerance: 'low' | 'medium' | 'high' | null;
}

/** Key the guard attaches the resolved context under on the request. */
export const COACH_CONTEXT_KEY = 'coachContext' as const;
