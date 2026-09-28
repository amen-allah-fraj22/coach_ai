import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';

import { CurrentCoach } from '../auth/coach.decorator.js';
import type { CoachContext } from '../auth/coach-context.js';
import { CoachGuard } from '../auth/coach.guard.js';
import { askSchema } from './ask.dto.js';
import { AssistantService } from './assistant.service.js';

@Controller('assistant')
@UseGuards(CoachGuard)
export class AssistantController {
  constructor(private readonly assistant: AssistantService) {}

  @Post('ask')
  async ask(@CurrentCoach() coach: CoachContext, @Body() body: unknown) {
    const parsed = askSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues);
    }

    const { question, matchId } = parsed.data;
    return this.assistant.ask(coach, question, matchId ?? null);
  }
}
