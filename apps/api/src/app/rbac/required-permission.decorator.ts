import { SetMetadata } from "@nestjs/common";
import { PermissionSlug } from "./permissions";

export const REQUIRED_PERMISSIONS_KEY = "required_permissions";

export const RequiredPermission = (...permissions: PermissionSlug[]) =>
  SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
