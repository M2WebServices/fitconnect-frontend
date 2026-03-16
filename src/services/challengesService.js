import { gatewayRequest } from './graphqlClient.js';
import { getAuthToken } from './authSession.js';

const CHALLENGES_FALLBACK_QUERY = `
  query ChallengesFallback {
    myRanking {
      userId
      score
      rank
    }
    myEvents {
      id
      title
      description
      date
      groupId
    }
    myGroups {
      id
      name
      description
      createdAt
    }
  }
`;

export async function fetchChallengesFallbackData() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Session introuvable. Merci de vous reconnecter.');
  }

  const payload = await gatewayRequest(CHALLENGES_FALLBACK_QUERY, {}, token);

  return {
    myRanking: payload.myRanking || null,
    myEvents: payload.myEvents || [],
    myGroups: payload.myGroups || [],
  };
}
