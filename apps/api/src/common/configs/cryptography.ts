import { registerAs } from "@nestjs/config";
import { JwtModuleOptions } from "@nestjs/jwt";

const CRYPTOGRAPHY_CONFIG_KEY = "crypto";

const cryptographyConfig = registerAs(
  CRYPTOGRAPHY_CONFIG_KEY,
  (): CryptographyConfig => ({
    salt: process.env.API_BCRYPT_SALT,
    saltRounds: Number(process.env.API_BCRYPT_SALT_ROUNDS),
    secret: process.env.API_SECRET
  })
);

export type CryptographyConfig = {
  secret: string;
  salt: string;
  saltRounds?: number;
};
export default cryptographyConfig;
