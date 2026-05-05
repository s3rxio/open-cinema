/**
 * Конвертирует IPv4-адрес в числовое представление (32-битное беззнаковое число)
 * @param ip - IPv4 адрес в формате "x.x.x.x"
 * @returns Числовое представление IP-адреса
 * @throws Error если IP-адрес имеет неверный формат
 */
function ipToNumber(ip: string): number {
  const parts = ip.split(".");

  if (parts.length !== 4) {
    throw new Error(`Invalid IP address format: ${ip}`);
  }

  const octets = parts.map(part => {
    const num = parseInt(part, 10);
    if (isNaN(num) || num < 0 || num > 255) {
      throw new Error(`Invalid IP octet: ${part} in ${ip}`);
    }
    return num;
  });

  return (
    ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0
  );
}

/**
 * Проверяет, находится ли IP в CIDR
 * @param ip - IPv4 адрес в формате "x.x.x.x"
 * @param cidr - CIDR в формате "x.x.x.x/y"
 * @returns true если IP находится в CIDR, false в противном случае
 */
export function isIpInCidr(ip: string, cidr: string): boolean {
  const [networkPart, prefixLength] = cidr.split("/");

  if (!networkPart || !prefixLength) {
    return false;
  }

  const ipNum = ipToNumber(ip);
  const networkNum = ipToNumber(networkPart);
  const prefix = parseInt(prefixLength);

  if (isNaN(prefix) || prefix < 0 || prefix > 32) {
    return false;
  }

  // Создаем маску подсети
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;

  // Проверяем, что IP находится в той же подсети
  return (ipNum & mask) === (networkNum & mask);
}

/**
 * Проверяет, находится ли IP в списке CIDR
 */
export function isIpInCidrs(ip: string, cidrs: string[]): boolean {
  return cidrs.some(cidr => isIpInCidr(ip, cidr));
}
