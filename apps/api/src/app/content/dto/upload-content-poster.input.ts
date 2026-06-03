import { Field, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsString } from "class-validator";
import { GraphQLUpload, FileUpload } from "graphql-upload-ts";

@InputType()
export class UploadContentPosterInput {
  @Field()
  @IsString()
  contentId: string;

  @Field(() => GraphQLUpload)
  @Type(() => Object)
  file: Promise<FileUpload>;
}
