import AsyncStorage from '@react-native-async-storage/async-storage';

import type { BackendUser } from './backend-api';

const tokenKey = 'nexo-solidario-token';
const userKey = 'nexo-solidario-user';
let memorySession: { token: string; user: BackendUser } | undefined;

function hasWebStorage() {
  return typeof globalThis !== 'undefined' && 'localStorage' in globalThis;
}

async function readValue(key: string) {
  if (hasWebStorage()) {
    return globalThis.localStorage.getItem(key) ?? undefined;
  }

  const value = await AsyncStorage.getItem(key);
  return value ?? undefined;
}

async function writeValue(key: string, value: string) {
  if (hasWebStorage()) {
    globalThis.localStorage.setItem(key, value);
    return;
  }

  await AsyncStorage.setItem(key, value);
}

async function removeValue(key: string) {
  if (hasWebStorage()) {
    globalThis.localStorage.removeItem(key);
    return;
  }

  await AsyncStorage.removeItem(key);
}

export async function saveAuthSession(token: string, user: BackendUser, persist = true) {
  memorySession = { token, user };
  if (!persist) return;
  await Promise.all([writeValue(tokenKey, token), writeValue(userKey, JSON.stringify(user))]);
}

export async function getStoredAuthToken() {
  if (memorySession) return memorySession.token;
  return await readValue(tokenKey);
}

export async function getStoredAuthUser() {
  if (memorySession) return memorySession.user;
  const raw = await readValue(userKey);
  if (!raw) return undefined;

  try {
    return JSON.parse(raw) as BackendUser;
  } catch {
    return undefined;
  }
}

export async function clearStoredAuthSession() {
  memorySession = undefined;
  await Promise.all([removeValue(tokenKey), removeValue(userKey)]);
}
