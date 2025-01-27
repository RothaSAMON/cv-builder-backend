import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as serverless from 'serverless-http';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({ origin: process.env.CLIENT_ORGIN, credentials: true });
  app.setGlobalPrefix('/api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  // This line is to start listening on the local environment, not necessary for serverless
  // await app.listen(process.env.PORT || 3000);

  await app.listen(process.env.PORT);
  // Return the serverless handler function
  return serverless(app as serverless.Application);
}

// Export the handler function for serverless
export const handler = bootstrap();
