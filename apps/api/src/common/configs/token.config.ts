import { registerAs } from "@nestjs/config";

/* Думаю лучше названать как auth config, а не token. Что считаете? */
const TOKEN_CONFIG_KEY = "token";

const tokenConfig = registerAs(
  TOKEN_CONFIG_KEY,
  (): TokenConfig => ({
    access: {
      expiresIn: process.env.API_TOKEN_ACCESS_LIFETIME || "15m"
    },
    refresh: {
      expiresIn: process.env.API_TOKEN_REFRESH_LIFETIME || "7d"
    }
  })
);

export enum Token {
  Access = "access",
  Refresh = "refresh"
}
export type TokenConfig = Record<
  Token,
  {
    secret?: string;
    expiresIn: string;
  }
>;
export default tokenConfig;
