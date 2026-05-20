/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { graphqlUploadExpress } from "graphql-upload-ts";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.API_PORT || 3001;
  const host = process.env.API_HOST || "localhost";
  const url = process.env.API_URL || `http://${host}:${port}`;

  app.enableCors({
    origin: "*",
    credentials: true
  });
  app.setGlobalPrefix("/api");
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true
    })
  );

  // 20 G
  app.use(
    graphqlUploadExpress({ maxFileSize: 10 * 1000 * 1000 * 1000, maxFiles: 10 })
  );

  await app.listen(port, host);
  Logger.log(`🚀 Application is running on: ${url}`);
}

bootstrap();
