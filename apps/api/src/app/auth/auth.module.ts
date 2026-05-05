import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthResolver } from "./auth.resolver";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { UserModule } from "../user/user.module";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LocalAuthGuard } from "./guards/local-auth.guard";

@Module({
  imports: [
    PrismaModule,
    UserModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get("jwt") as JwtModuleOptions,
      inject: [ConfigService]
    })
  ],
  providers: [
    AuthResolver,
    AuthService,
    JwtStrategy,
    LocalStrategy,
    LocalAuthGuard
  ]
})
export class AuthModule {}
