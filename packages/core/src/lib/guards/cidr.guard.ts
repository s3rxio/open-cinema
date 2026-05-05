import { isIpInCidrs } from "../utils";
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { ALLOWED_CIDRS_KEY } from "../decorators/allowed-cidrs.decorator";

@Injectable()
export class CidrGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedCidrs = this.reflector.getAllAndOverride<string[]>(
      ALLOWED_CIDRS_KEY,
      [context.getHandler(), context.getClass()]
    );

    // Если декоратор не указан, разрешаем доступ
    if (!allowedCidrs || allowedCidrs.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.getClientIp(request);

    if (!clientIp) {
      throw new ForbiddenException("Can't determine client IP address");
    }

    const isAllowed = isIpInCidrs(clientIp, allowedCidrs);

    if (!isAllowed) {
      throw new ForbiddenException(
        `Forbidden. IP address ${clientIp} is not in the allowed ranges`
      );
    }

    return true;
  }

  /**
   * Извлекает реальный IP адрес клиента из запроса
   * Учитывает nginx с заголовками X-Forwarded-For, X-Real-IP
   */
  private getClientIp(request: Request): string | null {
    // Проверяем заголовок X-Forwarded-For (может содержать несколько IP через запятую)
    const forwardedFor = request.headers["x-forwarded-for"];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
      // Берем первый IP из списка (оригинальный клиент)
      const clientIp = ips.split(",")[0].trim();
      if (clientIp) {
        return clientIp;
      }
    }

    // Проверяем заголовок X-Real-IP
    const realIp = request.headers["x-real-ip"];
    if (realIp) {
      const ip = Array.isArray(realIp) ? realIp[0] : realIp;
      if (ip) {
        return ip.trim();
      }
    }

    return request.ip ?? null;
  }
}
