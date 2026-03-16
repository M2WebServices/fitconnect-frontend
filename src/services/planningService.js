import { gatewayRequest } from './graphqlClient.js';
import { getAuthToken } from './authSession.js';

const PLANNING_QUERY = `
  query PlanningPage {
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

export async function fetchPlanningData() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Session introuvable. Merci de vous reconnecter.');
  }

  const payload = await gatewayRequest(PLANNING_QUERY, {}, token);
  const groupsById = new Map((payload.myGroups || []).map((group) => [group.id, group]));

  const events = (payload.myEvents || [])
    .map((event) => ({
      ...event,
      groupName: groupsById.get(event.groupId)?.name || 'Groupe inconnu',
    }))
    .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());

  return {
    events,
    groups: payload.myGroups || [],
  };
}
