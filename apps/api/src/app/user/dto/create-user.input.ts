import { InputType, Field } from "@nestjs/graphql";
import {
  IsDate,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString
} from "class-validator";

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  password: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  birthdate?: Date;
}
