import { Module } from '@nestjs/common';

import { LlmModule } from '../llm/llm.module.js';
import { SupabaseModule } from '../supabase/supabase.module.js';
import { AssistantController } from './assistant.controller.js';
import { AssistantService } from './assistant.service.js';

@Module({
  imports: [LlmModule, SupabaseModule],
  controllers: [AssistantController],
  providers: [AssistantService],
})
export class AssistantModule {}
