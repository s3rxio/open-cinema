import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModuleOptions } from "@nestjs/jwt";
import { UserModule } from "../user/user.module";
import { RedisModule } from "../redis/redis.module";
import { WatchPartyGateway } from "./watch-party.gateway";
import { WatchPartyService } from "./watch-party.service";

@Module({
  imports: [
    RedisModule,
    UserModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get("jwt") as JwtModuleOptions,
      inject: [ConfigService]
    })
  ],
  providers: [WatchPartyService, WatchPartyGateway]
})
export class WatchPartyModule {}
