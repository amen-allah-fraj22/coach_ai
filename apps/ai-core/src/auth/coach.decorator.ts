import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import { COACH_CONTEXT_KEY, type CoachContext } from './coach-context.js';

export const CurrentCoach = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CoachContext => {
    const request = context.switchToHttp().getRequest();
    return Reflect.get(request, COACH_CONTEXT_KEY) as CoachContext;
  },
);
