import { gatewayRequest } from './graphqlClient.js';
import { requireAuthToken } from './serviceUtils.js';

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
  const token = requireAuthToken();

  const payload = await gatewayRequest(PROFILE_QUERY, {}, token);
  return {
    me: payload.me || null,
    myRanking: payload.myRanking || null,
    myGroups: payload.myGroups || [],
    myEvents: payload.myEvents || [],
  };
}
