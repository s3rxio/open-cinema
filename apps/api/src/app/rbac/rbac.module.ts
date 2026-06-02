import { Global, Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RbacService } from "./rbac.service";
import { PermissionsGuard } from "./guards/permissions.guard";

@Global()
@Module({
  imports: [PrismaModule],
  providers: [RbacService, PermissionsGuard],
  exports: [RbacService, PermissionsGuard]
})
export class RbacModule {}
