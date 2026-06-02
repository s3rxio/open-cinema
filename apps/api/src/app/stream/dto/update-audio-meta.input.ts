import { InputType, Field, Int } from "@nestjs/graphql";
import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";

@InputType()
export class UpdateAudioMetaInput {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  displayName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  slug?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderNumer?: number;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
