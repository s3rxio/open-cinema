import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { validateEnv } from "../common/configs/env.config";
import jwtConfig from "../common/configs/jwt.config";
import tokenConfig from "../common/configs/token.config";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriverConfig } from "@nestjs/apollo";
import gqlConfig from "../common/configs/graphql";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { MovieModule } from "./movie/movie.module";
import { SeriesModule } from "./series/series.module";
import { EpisodeModule } from "./episode/episode.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import cryptographyConfig from "../common/configs/cryptography";
import { ContentModule } from "./content/content.module";
import s3Config from "../common/configs/s3.config";
import { S3Module, S3ModuleOptions } from "nestjs-s3";
import { BullModule, BullRootModuleOptions } from "@nestjs/bull";
import { StreamModule } from "./stream/stream.module";
import { MediaProcessingModule } from "./media-processing/media-processing.module";
import { StorageModule } from "./storage/storage.module";
import bullConfig from "../common/configs/bull.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        jwtConfig,
        tokenConfig,
        gqlConfig,
        cryptographyConfig,
        s3Config,
        bullConfig
      ],
      envFilePath: [
        ".env.local",
        ".env",
        `.env.${process.env.NODE_ENV}.local`,
        `.env.${process.env.NODE_ENV}`
      ],
      validate: validateEnv
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [ConfigModule],
      driver: gqlConfig().driver,
      useFactory: (configService: ConfigService) =>
        configService.get("graphql") as ApolloDriverConfig,
      inject: [ConfigService]
    }),
    S3Module.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get("s3") as S3ModuleOptions,
      inject: [ConfigService]
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get("bull") as BullRootModuleOptions,
      inject: [ConfigService]
    }),
    PrismaModule,
    StorageModule,
    UserModule,
    AuthModule,
    MovieModule,
    SeriesModule,
    EpisodeModule,
    ContentModule,
    StreamModule,
    MediaProcessingModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ]
})
export class AppModule {}
