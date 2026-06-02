import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { FavoriteService } from "./favorite.service";
import { Favorite } from "./entities/favorite.entity";
import { CreateFavoriteInput } from "./dto/create-favorite.input";
import { UpdateFavoriteInput } from "./dto/update-favorite.input";
import { Permission, RequiredPermission } from "../rbac";

@Resolver(() => Favorite)
export class FavoriteResolver {
  constructor(private readonly favoriteService: FavoriteService) {}

  @RequiredPermission(Permission.FavoritesCreate)
  @Mutation(() => Favorite)
  createFavorite(
    @Args("createFavoriteInput") createFavoriteInput: CreateFavoriteInput
  ) {
    return this.favoriteService.create(createFavoriteInput);
  }

  @RequiredPermission(Permission.FavoritesRead)
  @Query(() => [Favorite], { name: "favorite" })
  findAll() {
    return this.favoriteService.findAll();
  }

  @RequiredPermission(Permission.FavoritesRead)
  @Query(() => Favorite, { name: "favorite" })
  findOne(@Args("id") id: string) {
    return this.favoriteService.findOne(id);
  }

  @RequiredPermission(Permission.FavoritesUpdate)
  @Mutation(() => Favorite)
  updateFavorite(
    @Args("updateFavoriteInput") updateFavoriteInput: UpdateFavoriteInput
  ) {
    return this.favoriteService.update(
      updateFavoriteInput.id,
      updateFavoriteInput
    );
  }

  @RequiredPermission(Permission.FavoritesDelete)
  @Mutation(() => Boolean)
  removeFavorite(@Args("id") id: string) {
    return this.favoriteService.remove(id);
  }
}
