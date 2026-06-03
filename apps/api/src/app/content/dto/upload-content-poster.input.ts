import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { GraphQLUpload, FileUpload } from "graphql-upload-ts";

@InputType()
export class UploadContentPosterInput {
  @Field()
  @IsString()
  contentId: string;

  @Field(() => GraphQLUpload)
  @Type(() => Object)
  @IsOptional()
  file: Promise<FileUpload>;
}
