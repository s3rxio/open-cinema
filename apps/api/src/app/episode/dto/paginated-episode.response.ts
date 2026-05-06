import { ObjectType } from "@nestjs/graphql";
import { Episode } from "../entities/episode.entity";
import { PaginateQuery } from "@open-cinema/core";

@ObjectType()
export class PaginatedEpisodes extends PaginateQuery(Episode) {}
