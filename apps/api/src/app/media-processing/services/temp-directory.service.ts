import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { mkdir } from "fs/promises";
import { join } from "path";

@Injectable()
export class TempDirectoryService implements OnModuleInit {
  private readonly logger = new Logger(TempDirectoryService.name);

  constructor(private readonly configService: ConfigService) {}

  getRoot(): string {
    return this.configService.getOrThrow<string>("media.tmpDir");
  }

  async onModuleInit(): Promise<void> {
    const root = this.getRoot();
    await mkdir(root, { recursive: true });
    this.logger.log(`Media temp directory: ${root}`);
  }

  async create(...segments: string[]): Promise<string> {
    const dir = join(this.getRoot(), ...segments);
    await mkdir(dir, { recursive: true });
    return dir;
  }
}
