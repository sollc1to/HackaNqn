import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

import { signUserToken, verifyUserToken } from '../modules/user/user.auth';

function buildToken(payload: Record<string, unknown>, secret = 'dev-secret') {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

test('signUserToken and verifyUserToken round-trip a valid payload', () => {
  process.env.JWT_SECRET = 'test-secret';

  const token = signUserToken({
    sub: 'user-123',
    email: 'test@example.com',
    role: 'normal',
  });

  const parts = token.split('.');
  assert.equal(parts.length, 3);

  const payload = verifyUserToken(token);
  assert.ok(payload);
  assert.equal(payload?.sub, 'user-123');
  assert.equal(payload?.email, 'test@example.com');
  assert.equal(payload?.role, 'normal');
  assert.ok(payload && payload.exp > payload.iat);
});

test('verifyUserToken rejects tampered tokens', () => {
  process.env.JWT_SECRET = 'test-secret';

  const token = signUserToken({
    sub: 'user-123',
    email: 'test@example.com',
    role: 'normal',
  });

  const [header, body] = token.split('.');
  const tamperedBody = Buffer.from(JSON.stringify({
    sub: 'user-123',
    email: 'attacker@example.com',
    role: 'normal',
    iat: 1,
    exp: 9999999999,
  })).toString('base64url');

  const tamperedToken = `${header}.${tamperedBody}.${body}`;
  assert.equal(verifyUserToken(tamperedToken), null);
});

test('verifyUserToken rejects expired tokens', () => {
  process.env.JWT_SECRET = 'test-secret';

  const token = buildToken({
    sub: 'user-123',
    email: 'test@example.com',
    role: 'normal',
    iat: 1000,
    exp: 1001,
  }, 'test-secret');

  assert.equal(verifyUserToken(token), null);
});
