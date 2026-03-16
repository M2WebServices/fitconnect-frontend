import { gatewayRequest } from './graphqlClient.js';
import { getAuthToken } from './authSession.js';

const PROFILE_QUERY = `
  query ProfilePage {
    me {
      id
      username
      email
    }
    myRanking {
      userId
      score
      rank
    }
    myGroups {
      id
      name
      description
      createdAt
    }
    myEvents {
      id
      title
      description
      date
      groupId
    }
  }
`;

export async function fetchProfileData() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Session introuvable. Merci de vous reconnecter.');
  }

  const payload = await gatewayRequest(PROFILE_QUERY, {}, token);
  return {
    me: payload.me || null,
    myRanking: payload.myRanking || null,
    myGroups: payload.myGroups || [],
    myEvents: payload.myEvents || [],
  };
}
