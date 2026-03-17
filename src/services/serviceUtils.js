import { getAuthToken } from './authSession.js';

export function requireAuthToken() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Session introuvable. Merci de vous reconnecter.');
  }
  return token;
}

export function toUserError(error, fallbackMessage) {
  return error?.message || fallbackMessage;
}
