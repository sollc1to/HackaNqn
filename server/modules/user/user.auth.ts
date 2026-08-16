import crypto from 'node:crypto';

import type { JwtPayload, UserRole } from './user.interfaces';

const jwtExpiresInSeconds = 60 * 60 * 24 * 7;
const jwtAlgorithm = 'HS256';

// este helper serializa el valor en base64 url.
function toBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url');
}

// este helper lee la clave solo cuando se necesita firmar o validar.
function getJwtSecret() {
  return process.env.JWT_SECRET ?? 'dev-secret';
}

// este helper genera un token jwt firmado con hmac sha256.
export function signUserToken(payload: { sub: string; email: string; role: UserRole }) {
  const header = { alg: jwtAlgorithm, typ: 'JWT' };
  const issuedAt = Math.floor(Date.now() / 1000);
  const tokenPayload: JwtPayload = {
    ...payload,
    iat: issuedAt,
    exp: issuedAt + jwtExpiresInSeconds,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(tokenPayload));
  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// este helper valida un token y devuelve su payload si sigue vigente.
export function verifyUserToken(token: string) {
  const [encodedHeader, encodedPayload, signature] = token.split('.');

  if (!encodedHeader || !encodedPayload || !signature) {
    return null;
  }

  let header: { alg?: string; typ?: string };

  try {
    header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8')) as {
      alg?: string;
      typ?: string;
    };
  } catch {
    return null;
  }

  if (header.alg !== jwtAlgorithm || header.typ !== 'JWT') {
    return null;
  }

  const expectedSignature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return null;
  }

  let payload: JwtPayload;

  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as JwtPayload;
  } catch {
    return null;
  }

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
