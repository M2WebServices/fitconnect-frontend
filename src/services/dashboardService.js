import { gatewayRequest } from './graphqlClient.js';
import { getAuthToken } from './authSession.js';

const DASHBOARD_QUERY = `
  query DashboardHome {
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

export async function fetchDashboardData() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Session introuvable.');
  }

  return gatewayRequest(DASHBOARD_QUERY, {}, token);
}
