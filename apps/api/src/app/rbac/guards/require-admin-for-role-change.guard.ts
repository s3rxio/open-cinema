import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { GraphQLContext } from "@open-cinema/core";
import { User } from "../../user/entities/user.entity";
import { RoleSlug } from "../permissions";
import { RbacService } from "../rbac.service";

type UserMutationArgs = {
  updateUserInput?: { roleSlug?: string };
  createUserInput?: { roleSlug?: string };
};

@Injectable()
export class RequireAdminForRoleChangeGuard implements CanActivate {
  constructor(private readonly rbacService: RbacService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<UserMutationArgs>();
    const roleSlug =
      args.updateUserInput?.roleSlug ?? args.createUserInput?.roleSlug;

    if (roleSlug === undefined) {
      return true;
    }

    const request = gqlContext.getContext<GraphQLContext>().req;
    const currentUser = request.user as User | undefined;

    if (!currentUser) {
      throw new ForbiddenException("Authentication required");
    }

    const isAdmin = await this.rbacService.userHasRole(
      currentUser.id,
      RoleSlug.Admin
    );

    if (!isAdmin) {
      throw new ForbiddenException("Only administrators can change user roles");
    }

    return true;
  }
}
