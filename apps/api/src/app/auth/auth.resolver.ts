import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { TokenPair } from "./entities/auth.entity";
import { LoginInput } from "./dto/login.input";
import { RefreshTokenInput } from "./dto/refresh-token.input";
import { BypassAuth } from "./bypass-auth.decorator";
import { RegisterInput } from "./dto/register.input";
import { ChangePasswordInput } from "./dto/change-password.input";
import { UserMe } from "../user/user-me.decorator";
import { User } from "../user/entities/user.entity";
import { Permission, RequiredPermission } from "../rbac";

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

  @BypassAuth(false)
  @RequiredPermission(Permission.ProfileUpdate)
  @Mutation(() => Boolean)
  changePassword(
    @UserMe() user: User,
    @Args("changePasswordInput") changePasswordInput: ChangePasswordInput
  ) {
    return this.authService.changePassword(user.id, changePasswordInput);
  }
}
