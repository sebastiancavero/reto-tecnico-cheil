import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, stopAtFirstError: true }));
  app.use((req: any, res: any, next: any) => {
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      next();
    } else {
      express.json()(req, res, () => {
        express.urlencoded({ extended: true })(req, res, next);
      });
    }
  });
  app.enableCors({
    origin: ['http://localhost:3001', 'http://18.117.220.164:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
