import { Field, ObjectType, OmitType } from "@nestjs/graphql";
import { Content } from "../../content/content.entity";
import { MovieModel } from "../../../../prisma/generated/models";

@ObjectType()
export class Movie
  extends OmitType(Content, ["type"] as const)
  implements Partial<MovieModel>
{
  @Field({ nullable: true })
  streamId: string | null;
}
