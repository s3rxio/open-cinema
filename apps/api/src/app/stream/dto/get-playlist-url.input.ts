import { InputType, Field, ID } from "@nestjs/graphql";
import { IsString, IsOptional } from "class-validator";

@InputType()
export class GetPlaylistUrlInput {
  @Field(() => ID)
  @IsString()
  streamId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  quality?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  audioId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  subtitleId?: string;
}
