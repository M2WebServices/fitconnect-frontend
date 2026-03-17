export const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:4100/';
export const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:4102/graphql';
import { emitToast, emitUnauthenticated } from './appEvents.js';

function getErrorDetails(payload) {
  const firstError = payload?.errors?.[0];
  return {
    code: firstError?.extensions?.code || '',
    message: firstError?.message || payload?.message || 'Une erreur est survenue',
  };
}

export async function graphQLRequest(url, query, variables = {}, token) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.errors?.length) {
    const { code, message } = getErrorDetails(payload);

    if (code === 'UNAUTHENTICATED') {
      emitUnauthenticated(message);
    }

    if (!code || code !== 'UNAUTHENTICATED') {
      emitToast(message, 'error');
    }

    throw new Error(message);
  }

  return payload.data;
}

export function gatewayRequest(query, variables = {}, token) {
  return graphQLRequest(GATEWAY_URL, query, variables, token);
}
