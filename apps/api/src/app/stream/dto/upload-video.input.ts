import { InputType, Field } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsString, IsOptional } from "class-validator";
import { GraphQLUpload, FileUpload } from "graphql-upload-ts";

@InputType()
export class UploadVideoInput {
  @Field()
  @IsString()
  streamId: string;

  @Field(() => GraphQLUpload)
  @Type(() => Object)
  @IsOptional()
  file: Promise<FileUpload>;
}
