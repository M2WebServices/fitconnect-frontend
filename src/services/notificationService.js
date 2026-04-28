import { gatewayRequest } from './graphqlClient.js';
import { requireAuthToken } from './serviceUtils.js';

const CHAT_REALTIME_CONFIG_QUERY = `
  query ChatRealtimeConfig {
    chatRealtimeConfig {
      wsUrl
      events
      heartbeatSeconds
    }
  }
`;

const EVENT_NOTIFICATIONS = {
  WORKOUT_COMPLETED: { message: "Séance d'entraînement complétée !", type: 'success' },
  EVENT_CREATED: { message: 'Nouvel événement créé dans un de vos groupes.', type: 'info' },
};

export async function startNotificationListener(onNotification) {
  let ws = null;
  let heartbeatTimer = null;

  try {
    const token = requireAuthToken();
    const payload = await gatewayRequest(CHAT_REALTIME_CONFIG_QUERY, {}, token);
    const config = payload.chatRealtimeConfig;

    if (!config?.wsUrl) return () => {};

    ws = new WebSocket(config.wsUrl);

    ws.onopen = () => {
      heartbeatTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, (config.heartbeatSeconds || 30) * 1000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const notification = EVENT_NOTIFICATIONS[data.type];
        if (notification) {
          onNotification(notification.message, notification.type);
        }
      } catch {
        // message non-JSON (pong, etc.), ignoré
      }
    };

    ws.onerror = () => {};
    ws.onclose = () => clearInterval(heartbeatTimer);
  } catch {
    // chatRealtimeConfig indisponible, pas de WS
  }

  return () => {
    clearInterval(heartbeatTimer);
    if (ws && ws.readyState !== WebSocket.CLOSED) ws.close();
  };
}
