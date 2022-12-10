import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const logger = new Logger('bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const PORT = configService.get<number>('port');
  const BASE_URL = `${configService.get<string>('baseUrl')}:${PORT}`;
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('API Documentation')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  await app.listen(PORT);
  logger.debug(`Application listening on port: [${PORT}]`);
  logger.debug(`Full url: ${BASE_URL}`);
  logger.debug(`Docs: ${BASE_URL}/api/docs`);
  logger.debug(`Redis: ${configService.get<string>('redis.url')}`);
  // telegramService.subscribe();
}
bootstrap();
