import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { SHOULD_BYPASS_AUTH } from "../bypass-auth.decorator";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Request } from "express";
import { GraphQLContext } from "@open-cinema/core";
import { isObservable, lastValueFrom } from "rxjs";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const shouldBypassAuth = this.reflector.getAllAndOverride<boolean>(
      SHOULD_BYPASS_AUTH,
      [context.getHandler(), context.getClass()]
    );

    if (shouldBypassAuth) {
      try {
        return await this.resolveCanActivate(context);
      } catch {
        return true;
      }
    }

    return this.resolveCanActivate(context);
  }

  private async resolveCanActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const result = super.canActivate(context);

    if (typeof result === "boolean") {
      return result;
    }

    if (isObservable(result)) {
      return lastValueFrom(result);
    }

    return result;
  }

  getRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext<GraphQLContext>().req;
  }
}
