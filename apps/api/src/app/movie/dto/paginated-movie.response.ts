import { ObjectType } from "@nestjs/graphql";
import { Movie } from "../entities/movie.entity";
import { PaginateQuery } from "@open-cinema/core";

@ObjectType()
export class PaginatedMovies extends PaginateQuery(Movie) {}
