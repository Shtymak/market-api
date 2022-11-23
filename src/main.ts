import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

const PORT = process.env.PORT || 9999;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const logger = new Logger('bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('API Documentation')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  logger.debug(`Application listening on port: [${PORT}]`);
  logger.debug(`Full url: ${BASE_URL}`);
  logger.debug(`Docs: ${BASE_URL}/api/docs`);
  await app.listen(PORT);
}
bootstrap();
