import { ObjectType } from "@nestjs/graphql";
import { Content } from "../../content/content.entity";
import { MovieModel } from "../../../../prisma/generated/models";

@ObjectType()
export class Movie extends Content implements Partial<MovieModel> {}
