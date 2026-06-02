import { ObjectType, Field } from "@nestjs/graphql";
import { BaseEntity } from "@open-cinema/core";
import { UserModel } from "../../../../prisma/generated/models";
import { Favorite } from "../../favorite/entities/favorite.entity";
import { WatchHistory } from "../../watch-history/entities/watch-history.entity";

@ObjectType()
export class User
  extends BaseEntity
  implements Partial<Omit<UserModel, "password" | "refreshToken">>
{
  @Field()
  username: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  birthdate: Date | null;

  @Field(() => [Favorite], {
    nullable: true,
    description: "Favorites movies and series of the user"
  })
  favorites?: Favorite[] | null;

  @Field(() => [WatchHistory], {
    nullable: true,
    description: "Recently watched movies and episodes"
  })
  watchHistory?: WatchHistory[] | null;
}
