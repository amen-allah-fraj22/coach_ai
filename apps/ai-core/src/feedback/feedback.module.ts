import { Module } from '@nestjs/common';

import { SupabaseModule } from '../supabase/supabase.module.js';
import { FeedbackController } from './feedback.controller.js';

@Module({
  imports: [SupabaseModule],
  controllers: [FeedbackController],
})
export class FeedbackModule {}
