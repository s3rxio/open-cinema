import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { GraphQLContext } from "@open-cinema/core";
import { User } from "../../user/entities/user.entity";

type UpdateUserArgs = {
  updateUserInput?: {
    id?: string;
    roleSlug?: string;
  };
};

@Injectable()
export class PreventSelfRoleChangeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext<GraphQLContext>().req;
    const currentUser = request.user as User | undefined;
    const { updateUserInput } = gqlContext.getArgs<UpdateUserArgs>();

    if (
      updateUserInput?.roleSlug !== undefined &&
      currentUser &&
      updateUserInput.id === currentUser.id
    ) {
      throw new ForbiddenException("You cannot change your own role");
    }

    return true;
  }
}
