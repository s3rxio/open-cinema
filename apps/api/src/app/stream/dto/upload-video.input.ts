import { InputType, Field } from "@nestjs/graphql";
import { IsString, IsOptional } from "class-validator";
import { GraphQLUpload, FileUpload } from "graphql-upload-ts";

@InputType()
export class UploadVideoInput {
  @Field()
  @IsString()
  streamId: string;

  @Field(() => GraphQLUpload)
  @IsOptional()
  file: Promise<FileUpload>;
}
