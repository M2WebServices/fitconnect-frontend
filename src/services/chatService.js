import { gatewayRequest } from './graphqlClient.js';
import { requireAuthToken } from './serviceUtils.js';

const MY_GROUPS_QUERY = `
  query MyGroups {
    myGroups {
      id
      name
      description
      createdAt
    }
  }
`;

const ME_QUERY = `
  query Me {
    me {
      id
      username
      email
    }
  }
`;

const GROUP_MESSAGES_QUERY = `
  query GroupMessages($groupId: ID!, $limit: Int) {
    groupMessages(groupId: $groupId, limit: $limit) {
      id
      content
      senderId
      groupId
      createdAt
      sender {
        id
        username
        email
      }
    }
  }
`;

const CHAT_REALTIME_CONFIG_QUERY = `
  query ChatRealtimeConfig {
    chatRealtimeConfig {
      wsUrl
      events
      heartbeatSeconds
    }
  }
`;

const SEND_MESSAGE_MUTATION = `
  mutation SendMessage($groupId: ID!, $content: String!) {
    sendMessage(groupId: $groupId, content: $content) {
      id
      content
      senderId
      groupId
      createdAt
    }
  }
`;

const DELETE_MESSAGE_MUTATION = `
  mutation DeleteMessage($id: ID!) {
    deleteMessage(id: $id)
  }
`;

export async function fetchChatBootstrap() {
  const token = requireAuthToken();

  const [{ me }, { myGroups }] = await Promise.all([
    gatewayRequest(ME_QUERY, {}, token),
    gatewayRequest(MY_GROUPS_QUERY, {}, token),
  ]);

  const groups = myGroups || [];

  const previews = await Promise.all(
    groups.map(async (group) => {
      const payload = await gatewayRequest(
        GROUP_MESSAGES_QUERY,
        { groupId: group.id, limit: 1 },
        token
      );
      const last = payload.groupMessages?.[0];
      return {
        groupId: group.id,
        lastMessage: last?.content || '',
        lastCreatedAt: last?.createdAt || '',
      };
    })
  );

  const previewByGroupId = new Map(previews.map((item) => [item.groupId, item]));

  const conversations = groups.map((group) => {
    const preview = previewByGroupId.get(group.id);
    return {
      ...group,
      lastMessage: preview?.lastMessage || 'Aucun message pour le moment',
      lastCreatedAt: preview?.lastCreatedAt || '',
    };
  });

  return {
    me,
    conversations,
  };
}

export async function fetchGroupMessages(groupId, limit = 50) {
  const token = requireAuthToken();
  const payload = await gatewayRequest(
    GROUP_MESSAGES_QUERY,
    { groupId, limit },
    token
  );
  return payload.groupMessages || [];
}

export async function fetchChatRealtimeConfig() {
  const token = requireAuthToken();
  const payload = await gatewayRequest(CHAT_REALTIME_CONFIG_QUERY, {}, token);
  return payload.chatRealtimeConfig;
}

export async function sendGroupMessage(groupId, content) {
  const token = requireAuthToken();
  return gatewayRequest(
    SEND_MESSAGE_MUTATION,
    { groupId, content },
    token
  );
}

export async function deleteMessage(id) {
  const token = requireAuthToken();
  return gatewayRequest(DELETE_MESSAGE_MUTATION, { id }, token);
}
