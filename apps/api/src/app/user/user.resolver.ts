import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { PaginatedUsers } from './dto/paginated-user.response';
import { PaginationArgs } from '@open-cinema/core';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  createUser(@Args("createUserInput") createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Query(() => PaginatedUsers, { name: "users" })
  findAll(@Args() paginationArgs: PaginationArgs) {
    return this.userService.findAll(paginationArgs);
  }

  @Query(() => User, { name: "user" })
  findOne(@Args("id") id: string) {
    return this.userService.findOne(id);
  }

  @Mutation(() => User)
  async updateUser(@Args("updateUserInput") updateUserInput: UpdateUserInput) {    
    return this.userService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => Boolean)
  async removeUser(@Args("id") id: string): Promise<boolean> {
    await this.userService.remove(id);
    return true;
  }
}
