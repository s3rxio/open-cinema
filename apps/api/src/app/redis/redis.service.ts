import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;

  constructor(configService: ConfigService) {
    const password = configService.get<string>("API_REDIS_PASSWORD");
    this.client = new Redis({
      host: configService.get<string>("API_REDIS_HOST", "localhost"),
      port: configService.get<number>("API_REDIS_PORT", 6379),
      ...(password ? { password } : {})
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
