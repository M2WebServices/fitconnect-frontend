import { gatewayRequest } from './graphqlClient.js';
import { requireAuthToken } from './serviceUtils.js';

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
  const token = requireAuthToken();

  const data = await gatewayRequest(RANKING_QUERY, { limit }, token);
  return {
    leaderboard: data.leaderboard || [],
    myRanking: data.myRanking || null,
    me: data.me || null,
  };
}
