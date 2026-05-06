export interface AuthJwtPayload {
  userId: string;
}

export enum JwtToken {
  Access = "access",
  Refresh = "refresh"
}
