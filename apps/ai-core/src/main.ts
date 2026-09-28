import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // The Next.js web app (a different origin in dev) is the only browser
  // client; widen this list when deployment origins are known.
  app.enableCors({
    origin: (process.env.WEB_ORIGIN ?? 'http://localhost:3000').split(','),
    methods: ['POST', 'GET'],
    allowedHeaders: ['content-type', 'authorization'],
  });

  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
