/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { BadRequestException, Logger, ValidationPipe } from "@nestjs/common";
import { ValidationError } from "class-validator";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { graphqlUploadExpress } from "graphql-upload-ts";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.API_PORT || 5000;
  const host = process.env.API_HOST || "localhost";
  const url = process.env.API_URL || `http://${host}:${port}`;

  app.enableCors({
    origin: true,
    credentials: true
  });
  app.setGlobalPrefix("/api");
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) =>
        new BadRequestException(formatValidationErrors(errors))
    })
  );

  // 20 G
  app.use(
    graphqlUploadExpress({ maxFileSize: 10 * 1000 * 1000 * 1000, maxFiles: 2 })
  );

  await app.listen(port, host);
  Logger.log(`🚀 Application is running on: ${url}`);
}

function formatValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }

    if (error.children?.length) {
      messages.push(...formatValidationErrors(error.children));
    }
  }

  return messages.length > 0 ? messages : ["Validation failed"];
}

bootstrap();
