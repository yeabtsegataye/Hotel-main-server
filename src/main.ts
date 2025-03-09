import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { CustomLogger } from './logging/logger.service';
import { NestExpressApplication } from '@nestjs/platform-express'; // Import NestExpressApplication
import { join } from 'path'; // Import path module for serving static files

async function bootstrap() {
  // Use NestExpressApplication for file uploads and static file serving
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(CustomLogger);
  app.useLogger(logger);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://hotel-main-dashboard.onrender.com',
      'https://landing-agay.onrender.com',
      'https://hotel-menu-s71q.onrender.com'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`Request ${req.method} ${req.path}`);
    next();
  });

  app.use(cookieParser());

  // Serve static files from the "CDN" folder
  app.useStaticAssets(join(__dirname, '..', 'CDN'), {
    prefix: '/cdn', // Optional: Add a prefix to the static files URL
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}

bootstrap();