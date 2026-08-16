import crypto from 'node:crypto';

import type { JwtPayload, UserRole } from './user.interfaces';

const jwtExpiresInSeconds = 60 * 60 * 24 * 7;
const jwtAlgorithm = 'HS256';

// serializa un valor en base64 url.
function toBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url');
}

// lee la clave solo cuando se necesita firmar o validar.
function getJwtSecret() {
  return process.env.JWT_SECRET ?? 'dev-secret';
}

// genera un token jwt firmado con hmac sha256.
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

// valida un token y devuelve su payload si sigue vigente.
export function verifyUserToken(token: string) {
  const [encodedHeader, encodedPayload, signature] = token.split('.');

  // corta si el formato no es el esperado.
  if (!encodedHeader || !encodedPayload || !signature) {
    return null;
  }

  // decodifica y valida el encabezado del jwt.
  let header: { alg?: string; typ?: string };

  try {
    header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8')) as {
      alg?: string;
      typ?: string;
    };
  } catch {
    return null;
  }

  // rechaza tokens con algoritmo o tipo distintos.
  if (header.alg !== jwtAlgorithm || header.typ !== 'JWT') {
    return null;
  }

  // compara la firma de forma segura.
  const expectedSignature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  // rechaza firmas con longitudes distintas.
  const expectedBuffer = Buffer.from(expectedSignature);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return null;
  }

  // rechaza tokens con firma invalida.
  if (!crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return null;
  }

  // decodifica el payload del token.
  let payload: JwtPayload;

  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as JwtPayload;
  } catch {
    return null;
  }

  // rechaza tokens vencidos.
  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
