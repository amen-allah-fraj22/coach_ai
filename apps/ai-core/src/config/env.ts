import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),

  SUPABASE_URL: z.string().min(1, 'SUPABASE_URL is required'),
  // Service role: this service is trusted backend code. It bypasses RLS, so
  // every query in src/assistant/tools/ must scope by club_id explicitly —
  // the club_id comes from the verified caller, never from request input.
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  LLM_PROVIDER: z.enum(['gemini']).default('gemini'),
  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n  ');
    throw new Error(`Invalid environment configuration:\n  ${issues}`);
  }

  if (parsed.data.LLM_PROVIDER === 'gemini' && !parsed.data.GEMINI_API_KEY) {
    throw new Error(
      'LLM_PROVIDER=gemini requires GEMINI_API_KEY to be set (see .env.example)',
    );
  }

  return parsed.data;
}
