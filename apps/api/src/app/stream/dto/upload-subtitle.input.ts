import { InputType, Field } from "@nestjs/graphql";
import { IsString, IsInt, Min, IsOptional } from "class-validator";
import { GraphQLUpload, FileUpload } from "graphql-upload-ts";

@InputType()
export class UploadSubtitleInput {
  @Field()
  @IsString()
  streamId: string;

  @Field(() => GraphQLUpload)
  @IsOptional()
  file: Promise<FileUpload>;

  @Field()
  @IsString()
  slug: string;

  @Field()
  @IsString()
  displayName: string;

  @Field()
  @IsInt()
  @Min(0)
  orderNumer: number;
}
