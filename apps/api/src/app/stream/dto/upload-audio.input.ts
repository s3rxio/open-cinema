import { InputType, Field } from "@nestjs/graphql";
import { IsString, IsInt, Min, IsOptional, IsBoolean } from "class-validator";
import { GraphQLUpload, FileUpload } from "graphql-upload-ts";

@InputType()
export class UploadAudioInput {
  @Field()
  @IsString()
  streamId: string;

  @Field(() => GraphQLUpload)
  @IsOptional()
  file?: Promise<FileUpload>;

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

  @Field(() => Boolean, {
    defaultValue: false
  })
  @IsBoolean()
  isDefault: boolean = false;
}
