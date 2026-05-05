import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LoginInput } from "./dto/login.input";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { TokenPair } from "./entities/auth.entity";
import { AuthJwtPayload } from "./auth.types";
import { RefreshTokenInput } from "./dto/refresh-token.input";
import bcrypt from "bcrypt";
import { RegisterInput } from "./dto/register.input";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService
  ) {}

  private generateAccessToken(userId: string): string {
    return this.jwtService.sign(
      { userId },
      {
        expiresIn: this.configService.getOrThrow("token.access.expiresIn")
      }
    );
  }

  private generateRefreshToken(userId: string): string {
    return this.jwtService.sign(
      { userId },
      {
        expiresIn: this.configService.getOrThrow("token.refresh.expiresIn")
      }
    );
  }

  private async generateTokens(userId: string): Promise<TokenPair> {
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken }
    });

    return { accessToken, refreshToken };
  }

  async validateUser(login: string, password: string) {
    const user = await this.prismaService.user.findFirst({
      where: { OR: [{ username: login }, { email: login }] }
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return { id: user.id };
  }

  async login(loginInput: LoginInput): Promise<TokenPair> {
    const user = await this.validateUser(loginInput.login, loginInput.password);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    return {
      accessToken,
      refreshToken
    };
  }

  async register(registerInput: RegisterInput): Promise<TokenPair> {
    const user = await this.userService.create(registerInput);
    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    return {
      accessToken,
      refreshToken
    };
  }

  async refreshToken(refreshTokenInput: RefreshTokenInput): Promise<TokenPair> {
    try {
      const payload = this.jwtService.verify<AuthJwtPayload>(
        refreshTokenInput.refreshToken,
        {
          secret: this.configService.get<string>("jwt.secret")
        }
      );

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          refreshToken: true
        }
      });

      if (!user || user.refreshToken !== refreshTokenInput.refreshToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const { accessToken, refreshToken } = await this.generateTokens(user.id);

      return {
        accessToken,
        refreshToken
      };
    } catch (error) {
      this.logger.error("Failed to refresh token", error);
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
