import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { validateEnv } from "../common/configs/env.config";
import jwtConfig from "../common/configs/jwt.config";
import tokenConfig from "../common/configs/token.config";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriverConfig } from "@nestjs/apollo";
import gqlConfig from "../common/configs/graphql";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { UserModule } from "./user/user.module";
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [jwtConfig, tokenConfig, gqlConfig],
      envFilePath: [
        ".env.local",
        ".env",
        `.env.${process.env.NODE_ENV}.local`,
        `.env.${process.env.NODE_ENV}`
      ],
      validate: validateEnv
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get("jwt") as JwtModuleOptions,
      inject: [ConfigService]
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [ConfigModule],
      driver: gqlConfig().driver,
      useFactory: (configService: ConfigService) =>
        configService.get("graphql") as ApolloDriverConfig,
      inject: [ConfigService]
    }),
    UserModule,
    PrismaModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    }
  ]
})
export class AppModule {}
