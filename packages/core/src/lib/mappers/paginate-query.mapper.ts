import { Type } from "@nestjs/common";
import { Field, Int, ObjectType } from "@nestjs/graphql";

export const PaginateQuery = <D = unknown>(dataRef: Type<D>) => {
  @ObjectType()
  class PaginateQueryDto {
    @Field(() => [dataRef])
    data: D[];

    @Field(() => Int, { description: "Total number of items available" })
    total: number;

    @Field({ description: "Cursor for the next page of items" })
    nextCursor?: string | null;

    @Field({ description: "Cursor for the previous page of items" })
    prevCursor?: string | null;
  }

  return PaginateQueryDto;
};
