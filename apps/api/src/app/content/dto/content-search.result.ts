import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Content } from "../content.entity";

@ObjectType()
export class ContentSearchResult {
  @Field(() => [Content])
  items: Content[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  hasMore: boolean;
}
