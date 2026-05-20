import { plainToInstance } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync
} from "class-validator";

enum NodeEnv {
  Development = "development",
  Production = "production"
}

export class EnvironmentVariables {
  /* RUNTIME */
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv;

  /* API */
  @IsString()
  @IsOptional()
  API_HOST = "localhost";

  @IsNumber()
  @Min(0)
  @Max(65535)
  API_PORT: number;

  @IsString()
  @IsOptional()
  API_URL: string;

  /* CRYPTOGRAPHY */
  @IsString()
  API_SECRET: string;

  @IsString()
  API_BCRYPT_SALT: string;

  @IsString()
  @IsOptional()
  API_BCRYPT_SALT_ROUNDS: string;

  /* DATABASE */
  @IsString()
  API_DB_URL: string;

  /* REDIS */
  @IsString()
  API_REDIS_HOST: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  API_REDIS_PORT: number;

  @IsString()
  API_REDIS_PASSWORD: string;

  /* JWT */
  @IsString()
  API_JWT_SECRET: string;

  /* TOKEN */
  @IsString()
  API_TOKEN_ACCESS_LIFETIME: string;

  @IsString()
  API_TOKEN_REFRESH_LIFETIME: string;

  /* S3 */
  @IsString()
  @IsOptional()
  API_S3_ENDPOINT: string;

  @IsString()
  @IsOptional()
  API_S3_REGION: string;

  @IsString()
  @IsOptional()
  API_S3_BUCKET: string;

  @IsString()
  @IsOptional()
  API_S3_ACCESS_KEY_ID: string;

  @IsString()
  @IsOptional()
  API_S3_SECRET_ACCESS_KEY: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
