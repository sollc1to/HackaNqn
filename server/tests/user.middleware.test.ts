import test from 'node:test';
import assert from 'node:assert/strict';

import { signUserToken } from '../modules/user/user.auth';
import { requireAuth, type AuthenticatedRequest } from '../modules/user/user.middleware';

function createResponseMock() {
  const res: { statusCode?: number; body?: unknown; status: (code: number) => typeof res; json: (body: unknown) => typeof res } = {
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.body = body;
      return this;
    },
  };

  return res;
}

test('requireAuth rejects requests without bearer token', () => {
  const req = { headers: {} } as AuthenticatedRequest;
  const res = createResponseMock();
  let nextCalled = false;

  requireAuth(req, res as never, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { msg: 'missing token' });
  assert.equal(nextCalled, false);
});

test('requireAuth rejects invalid bearer token', () => {
  const req = { headers: { authorization: 'Bearer invalid.token.value' } } as AuthenticatedRequest;
  const res = createResponseMock();
  let nextCalled = false;

  requireAuth(req, res as never, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { msg: 'invalid or expired token' });
  assert.equal(nextCalled, false);
});

test('requireAuth accepts a valid token and attaches payload', () => {
  process.env.JWT_SECRET = 'test-secret';

  const token = signUserToken({
    sub: 'user-123',
    email: 'test@example.com',
    role: 'normal',
  });

  const req = { headers: { authorization: `Bearer ${token}` } } as AuthenticatedRequest;
  const res = createResponseMock();
  let nextCalled = false;

  requireAuth(req, res as never, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, undefined);
  assert.equal(res.body, undefined);
  assert.equal(nextCalled, true);
  assert.equal(req.auth?.sub, 'user-123');
  assert.equal(req.auth?.email, 'test@example.com');
  assert.equal(req.auth?.role, 'normal');
});
