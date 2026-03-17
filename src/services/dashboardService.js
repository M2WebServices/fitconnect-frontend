import { gatewayRequest } from './graphqlClient.js';
import { requireAuthToken } from './serviceUtils.js';

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
  const token = requireAuthToken();

  return gatewayRequest(DASHBOARD_QUERY, {}, token);
}
