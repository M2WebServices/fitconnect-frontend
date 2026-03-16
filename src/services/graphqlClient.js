export const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:4100/';
export const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:4102/graphql';

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
    const message =
      payload?.errors?.[0]?.message || payload?.message || 'Une erreur est survenue';
    throw new Error(message);
  }

  return payload.data;
}

export function gatewayRequest(query, variables = {}, token) {
  return graphQLRequest(GATEWAY_URL, query, variables, token);
}
