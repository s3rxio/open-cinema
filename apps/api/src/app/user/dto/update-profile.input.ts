import { Field, InputType } from "@nestjs/graphql";
import { IsDateString, IsEmail, IsOptional, IsString } from "class-validator";

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
  @IsDateString()
  birthdate?: Date | null;
}
