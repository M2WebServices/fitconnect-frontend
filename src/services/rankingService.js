import { gatewayRequest } from './graphqlClient.js';
import { getAuthToken } from './authSession.js';

const RANKING_QUERY = `
  query RankingPage($limit: Int) {
    leaderboard(limit: $limit) {
      userId
      score
      rank
      user {
        id
        username
        email
      }
    }
    myRanking {
      userId
      score
      rank
    }
    me {
      id
      username
      email
    }
  }
`;

export async function fetchRankingData(limit = 20) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Session introuvable. Merci de vous reconnecter.');
  }

  const data = await gatewayRequest(RANKING_QUERY, { limit }, token);
  return {
    leaderboard: data.leaderboard || [],
    myRanking: data.myRanking || null,
    me: data.me || null,
  };
}
