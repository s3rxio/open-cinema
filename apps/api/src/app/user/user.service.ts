import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { CreateUserInput } from "./dto/create-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import { PaginatedUsers } from "./dto/paginated-user.response";
import { PaginationArgs } from "@open-cinema/core";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "./entities/user.entity";
import bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createUserInput.username },
          { email: createUserInput.email }
        ]
      },
      select: { id: true }
    });

    if (existingUser) {
      throw new NotFoundException(
        `User with username ${createUserInput.username} or email ${createUserInput.email} already exists`
      );
    }

    try {
      const salt = this.configService.getOrThrow<string>("crypto.salt");
      const hashedPassword = bcrypt.hashSync(createUserInput.password, salt);

      return this.prisma.user.create({
        data: {
          username: createUserInput.username,
          email: createUserInput.email,
          password: hashedPassword,
          birthdate: createUserInput.birthdate
        },
        omit: {
          password: true,
          refreshToken: true
        }
      });
    } catch (error) {
      this.logger.error(error);

      throw new InternalServerErrorException();
    }
  }

  async findAll(paginationArgs: PaginationArgs): Promise<PaginatedUsers> {
    const { first, cursor } = paginationArgs;
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      take: first,
      cursor: cursor ? { id: cursor } : undefined,
      omit: {
        password: true,
        refreshToken: true
      }
    });

    const nextCursor = users.length > 0 ? users[users.length - 1].id : null;

    return {
      data: users,
      total: await this.prisma.user.count(),
      nextCursor: nextCursor,
      prevCursor: cursor
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      omit: {
        password: true,
        refreshToken: true
      }
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: id },
      omit: {
        password: true,
        refreshToken: true
      }
    });
  }

  async update(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    const existingUser = await this.findOne(id);

    if (
      existingUser.username === updateUserInput.username ||
      existingUser.email === updateUserInput.email
    ) {
      throw new BadRequestException(
        `Username ${updateUserInput.username} or email ${updateUserInput.email} is already taken`
      );
    }

    if (updateUserInput.password) {
      const salt = this.configService.getOrThrow<string>("crypto.salt");

      updateUserInput.password = bcrypt.hashSync(
        updateUserInput.password,
        salt
      );
    }

    const usernameOrEmailTaken = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: updateUserInput.username },
          { email: updateUserInput.email }
        ]
      },
      select: { id: true }
    });

    if (usernameOrEmailTaken) {
      throw new BadRequestException(
        `Username ${updateUserInput.username} or email ${updateUserInput.email} is already taken`
      );
    }

    const user = await this.prisma.user.update({
      where: { id: id },
      data: {
        username: updateUserInput.username,
        email: updateUserInput.email,
        birthdate: updateUserInput.birthdate
      },
      omit: {
        password: true,
        refreshToken: true
      }
    });

    return user;
  }

  async remove(id: string): Promise<boolean> {
    await this.findOne(id);

    const deleted = await this.prisma.user.delete({
      where: { id: id }
    });

    return deleted ? true : false;
  }
}
