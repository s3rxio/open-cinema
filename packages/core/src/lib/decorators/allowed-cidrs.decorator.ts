import { SetMetadata } from "@nestjs/common";

export const ALLOWED_CIDRS_KEY = "allowedCidrs";

/**
 * Декоратор для указания списка разрешенных CIDR диапазонов
 *
 * @param cidrs Массив CIDR нотаций (например, ["192.168.1.0/24", "10.0.0.0/8"])
 *
 * @example
 * ```typescript
 * // Использование на контроллере
 * @Controller('admin')
 * @UseGuards(CidrGuard)
 * export class AdminController {
 *   @Get('sensitive')
 *   @AllowedCidrs("192.168.1.0/24", "10.0.0.0/8")
 *   getSensitiveData() {
 *     return { data: "sensitive" };
 *   }
 * }
 * ```
 */
export const AllowedCidrs = (...cidrs: string[]) =>
  SetMetadata(ALLOWED_CIDRS_KEY, cidrs);
