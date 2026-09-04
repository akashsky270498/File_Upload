import { Request } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import { JwtPayload } from '../utils/jwt';

export interface AuthenticatedRequest<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = Record<string, unknown>,
  ReqQuery = Query
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: JwtPayload;
  file?: Express.Multer.File;
  body: ReqBody;
  params: P;
  query: ReqQuery;
  cookies: Record<string, string>;
}
