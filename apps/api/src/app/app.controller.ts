import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { BypassAuth } from "./auth/bypass-auth.decorator";

@BypassAuth()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }
}
