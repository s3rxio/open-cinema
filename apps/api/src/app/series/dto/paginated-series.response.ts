import { ObjectType } from "@nestjs/graphql";
import { Series } from "../entities/series.entity";
import { PaginateQuery } from "@open-cinema/core";

@ObjectType()
export class PaginatedSeries extends PaginateQuery(Series) {}
