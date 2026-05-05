import { InputType } from "@nestjs/graphql";
import { CreateUserInput } from "../../user/dto/create-user.input";

@InputType()
export class RegisterInput extends CreateUserInput {}
