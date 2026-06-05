import { InputType, Field } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsIn,
  IsOptional,
  IsString
} from "class-validator";
import { RoleSlug, RoleSlugType } from "../../rbac/permissions";

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
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  birthdate?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(Object.values(RoleSlug))
  roleSlug?: RoleSlugType;
}
