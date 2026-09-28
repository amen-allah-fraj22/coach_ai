import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '../config/env.js';
import { GeminiProvider } from './gemini.provider.js';
import { LLM_PROVIDER, type LlmProvider } from './llm.types.js';

@Module({
  providers: [
    {
      provide: LLM_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): LlmProvider => {
        const provider = config.get('LLM_PROVIDER', { infer: true });

        switch (provider) {
          case 'gemini':
            return new GeminiProvider({
              apiKey: config.get('GEMINI_API_KEY', { infer: true }),
              model: config.get('GEMINI_MODEL', { infer: true }),
            });
          default:
            // Exhaustive today; the compiler will flag this branch when a
            // second provider is added to the LLM_PROVIDER enum.
            throw new Error(`Unsupported LLM_PROVIDER: ${String(provider)}`);
        }
      },
    },
  ],
  exports: [LLM_PROVIDER],
})
export class LlmModule {}
