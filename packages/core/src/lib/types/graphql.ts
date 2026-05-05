import { Request } from "express";

export interface GraphQLContext {
  req: Request;
}
