import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { TokenPair } from "./entities/auth.entity";
import { LoginInput } from "./dto/login.input";
import { RefreshTokenInput } from "./dto/refresh-token.input";
import { BypassAuth } from "./bypass-auth.decorator";
import { RegisterInput } from "./dto/register.input";

@Resolver(() => TokenPair)
@BypassAuth()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => TokenPair)
  login(@Args("loginInput") loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }

  @Mutation(() => TokenPair)
  register(@Args("registerInput") registerInput: RegisterInput) {
    return this.authService.register(registerInput);
  }

  @Mutation(() => TokenPair)
  refreshToken(
    @Args("refreshTokenInput") refreshTokenInput: RefreshTokenInput
  ) {
    return this.authService.refreshToken(refreshTokenInput);
  }
}
