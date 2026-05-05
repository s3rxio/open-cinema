import { SetMetadata } from "@nestjs/common";

export const SHOULD_BYPASS_AUTH = "shouldBypassAuth";
export const BypassAuth = (value: boolean = true) =>
  SetMetadata(SHOULD_BYPASS_AUTH, value);
