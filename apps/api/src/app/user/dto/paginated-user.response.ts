import { ObjectType, OmitType } from "@nestjs/graphql";
import { User } from "../entities/user.entity";
import { PaginateQuery } from "@open-cinema/core";

@ObjectType()
export class PaginatedUsers extends PaginateQuery(
  OmitType(User, ["favorites", "watchHistory"])
) {}
