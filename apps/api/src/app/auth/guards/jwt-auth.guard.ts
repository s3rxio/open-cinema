import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { SHOULD_BYPASS_AUTH } from "../bypass-auth.decorator";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Request } from "express";
import { GraphQLContext } from "@open-cinema/core";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const shouldBypassAuth = this.reflector.getAllAndOverride<boolean>(
      SHOULD_BYPASS_AUTH,
      [context.getHandler(), context.getClass()]
    );

    if (shouldBypassAuth) {
      return true;
    }

    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext<GraphQLContext>().req;
  }
}
