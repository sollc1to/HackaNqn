import type { NextFunction, Request, Response } from 'express';

import { verifyUserToken } from './user.auth';
import type { JwtPayload } from './user.interfaces';

export type AuthenticatedRequest = Request & {
  auth?: JwtPayload;
};

// protege rutas que requieren un token valido.
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // lee el header authorization.
  const authHeader = req.headers.authorization;
  // extrae el bearer token si existe.
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  // corta si no llego token.
  if (!token) {
    return res.status(401).json({ msg: 'missing token' });
  }

  // valida y decodifica el token.
  const payload = verifyUserToken(token);

  // corta si el token no es valido o ya vencio.
  if (!payload) {
    return res.status(401).json({ msg: 'invalid or expired token' });
  }

  // guarda el payload para usarlo en el controlador.
  req.auth = payload;
  return next();
}
