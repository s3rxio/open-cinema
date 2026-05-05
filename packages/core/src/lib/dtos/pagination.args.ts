import { ArgsType, Field, Int } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, {
    defaultValue: 10,
    description: "Number of items to return"
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  first: number = 10;

  @Field({ nullable: true, description: "Cursor for pagination" })
  @Type(() => String)
  @IsOptional()
  @IsString()
  cursor?: string;
}
