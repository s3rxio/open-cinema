import { Global, Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RbacService } from "./rbac.service";
import { PermissionsGuard } from "./guards/permissions.guard";
import { PreventSelfRoleChangeGuard } from "./guards/prevent-self-role-change.guard";
import { RequireAdminGuard } from "./guards/require-admin.guard";
import { RequireAdminForRoleChangeGuard } from "./guards/require-admin-for-role-change.guard";

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    RbacService,
    PermissionsGuard,
    PreventSelfRoleChangeGuard,
    RequireAdminGuard,
    RequireAdminForRoleChangeGuard
  ],
  exports: [
    RbacService,
    PermissionsGuard,
    PreventSelfRoleChangeGuard,
    RequireAdminGuard,
    RequireAdminForRoleChangeGuard
  ]
})
export class RbacModule {}
