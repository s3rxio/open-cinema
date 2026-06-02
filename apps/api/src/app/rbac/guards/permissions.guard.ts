import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Request } from "express";
import { GraphQLContext } from "@open-cinema/core";
import { SHOULD_BYPASS_AUTH } from "../../auth/bypass-auth.decorator";
import { REQUIRED_PERMISSIONS_KEY } from "../required-permission.decorator";
import { PermissionSlug } from "../permissions";
import { RbacService } from "../rbac.service";
import { User } from "../../user/entities/user.entity";

type RequestWithUser = Request & {
  user?: User;
  userPermissions?: Set<string>;
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const shouldBypassAuth = this.reflector.getAllAndOverride<boolean>(
      SHOULD_BYPASS_AUTH,
      [context.getHandler(), context.getClass()]
    );

    if (shouldBypassAuth) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionSlug[]
    >(REQUIRED_PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = this.getRequest(context);
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Authentication required");
    }

    if (!request.userPermissions) {
      request.userPermissions = await this.rbacService.getPermissionsForUser(
        user.id
      );
    }

    const allowed = this.rbacService.hasEveryPermission(
      request.userPermissions,
      requiredPermissions
    );

    if (!allowed) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }

  private getRequest(context: ExecutionContext): RequestWithUser {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext<GraphQLContext>().req as RequestWithUser;
  }
}
