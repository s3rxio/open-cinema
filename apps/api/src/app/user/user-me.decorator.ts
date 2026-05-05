import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { GqlExecutionContext } from "@nestjs/graphql";
import { GraphQLContext } from "@open-cinema/core";

export const UserMe = createParamDecorator(
  (data: keyof User | null, context: ExecutionContext) => {
    const request =
      GqlExecutionContext.create(context).getContext<GraphQLContext>().req;

    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  }
);
