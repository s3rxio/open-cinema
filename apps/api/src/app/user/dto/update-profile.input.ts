import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsDate, IsEmail, IsOptional, IsString } from "class-validator";

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  username?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthdate?: Date | null;
}
