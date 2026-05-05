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
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import cryptographyConfig from "../common/configs/cryptography";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [jwtConfig, tokenConfig, gqlConfig, cryptographyConfig],
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
    PrismaModule,
    UserModule,
    AuthModule
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
