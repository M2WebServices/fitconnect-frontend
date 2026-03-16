import { gatewayRequest } from './graphqlClient.js';
import { getAuthToken } from './authSession.js';

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

function getTokenOrThrow() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Session introuvable. Merci de vous reconnecter.');
  }
  return token;
}

export async function fetchChatBootstrap() {
  const token = getTokenOrThrow();

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
  const token = getTokenOrThrow();
  const payload = await gatewayRequest(
    GROUP_MESSAGES_QUERY,
    { groupId, limit },
    token
  );
  return payload.groupMessages || [];
}

export async function sendGroupMessage(groupId, content) {
  const token = getTokenOrThrow();
  return gatewayRequest(
    SEND_MESSAGE_MUTATION,
    { groupId, content },
    token
  );
}
