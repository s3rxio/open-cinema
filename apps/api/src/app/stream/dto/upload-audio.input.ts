import { InputType, Field } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsString, IsInt, Min, IsOptional, IsBoolean } from "class-validator";
import { GraphQLUpload, FileUpload } from "graphql-upload-ts";

@InputType()
export class UploadAudioInput {
  @Field()
  @IsString()
  streamId: string;

  @Field(() => GraphQLUpload)
  @Type(() => Object)
  @IsOptional()
  file?: Promise<FileUpload>;

  @Field()
  @IsString()
  slug: string;

  @Field()
  @IsString()
  displayName: string;

  @Field()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  orderNumer: number;

  @Field(() => Boolean, {
    defaultValue: false
  })
  @IsBoolean()
  @IsOptional()
  isDefault: boolean = false;
}
