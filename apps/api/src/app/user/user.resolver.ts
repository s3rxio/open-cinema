import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent
} from "@nestjs/graphql";
import { UserService } from "./user.service";
import { User } from "./entities/user.entity";
import { CreateUserInput } from "./dto/create-user.input";
import { UpdateUserInput } from "./dto/update-user.input";
import { PaginatedUsers } from "./dto/paginated-user.response";
import { PaginationArgs } from "@open-cinema/core";
import { UserMe } from "./user-me.decorator";
import { FavoriteService } from "../favorite/favorite.service";
import { Favorite } from "../favorite/entities/favorite.entity";
import { WatchHistoryService } from "../watch-history/watch-history.service";
import { WatchHistory } from "../watch-history/entities/watch-history.entity";
import { Permission, RequiredPermission } from "../rbac";

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly favoriteService: FavoriteService,
    private readonly watchHistoryService: WatchHistoryService
  ) {}

  @RequiredPermission(Permission.FavoritesRead)
  @ResolveField(() => [Favorite], { nullable: true })
  favorites(@Parent() user: User) {
    return this.favoriteService.findByUserId(user.id);
  }

  @RequiredPermission(Permission.WatchHistoryRead)
  @ResolveField(() => [WatchHistory], { nullable: true })
  watchHistory(@Parent() user: User) {
    return this.watchHistoryService.findByUserId(user.id);
  }

  @RequiredPermission(Permission.ProfileRead)
  @Query(() => User, { name: "me" })
  me(@UserMe() user: User) {
    return user;
  }

  @RequiredPermission(Permission.UsersCreate)
  @Mutation(() => User)
  createUser(@Args("createUserInput") createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @RequiredPermission(Permission.UsersRead)
  @Query(() => PaginatedUsers, { name: "users" })
  findAll(@Args() paginationArgs: PaginationArgs) {
    return this.userService.findAll(paginationArgs);
  }

  @RequiredPermission(Permission.UsersRead)
  @Query(() => User, { name: "user" })
  findOne(@Args("id") id: string) {
    return this.userService.findOne(id);
  }

  @RequiredPermission(Permission.UsersUpdate)
  @Mutation(() => User)
  async updateUser(@Args("updateUserInput") updateUserInput: UpdateUserInput) {
    return this.userService.update(updateUserInput.id, updateUserInput);
  }

  @RequiredPermission(Permission.UsersDelete)
  @Mutation(() => Boolean)
  async removeUser(@Args("id") id: string) {
    await this.userService.remove(id);
    return true;
  }
}
