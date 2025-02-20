import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { CustomLogger } from './logging/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(CustomLogger);
  app.useLogger(logger);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: ['http://localhost:5173','http://localhost:5174','https://hotel-main-dashboard.onrender.com','https://landing-agay.onrender.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`Request ${req.method} ${req.path}`);
    next();
  });

  app.use(cookieParser());
  const port = process.env.PORT || 3000; 
  await app.listen(port);
  console.log(`Server running on port ${port}`);

}

bootstrap();
