import type { NextFunction, Request, Response } from 'express';

import { verifyUserToken } from './user.auth';
import type { JwtPayload } from './user.interfaces';

export type AuthenticatedRequest = Request & {
  auth?: JwtPayload;
};

// este middleware protege rutas que requieren un token valido.
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ msg: 'missing token' });
  }

  const payload = verifyUserToken(token);

  if (!payload) {
    return res.status(401).json({ msg: 'invalid or expired token' });
  }

  req.auth = payload;
  return next();
}
