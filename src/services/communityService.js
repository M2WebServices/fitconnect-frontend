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

const GROUP_QUERY = `
  query Group($id: ID!) {
    group(id: $id) {
      id
      name
      description
      createdAt
      members {
        id
        username
        email
      }
    }
  }
`;

const SEARCH_GROUPS_QUERY = `
  query SearchGroups($query: String!) {
    searchGroups(query: $query) {
      id
      name
      description
      createdAt
    }
  }
`;

const CREATE_GROUP_MUTATION = `
  mutation CreateGroup($name: String!, $description: String) {
    createGroup(name: $name, description: $description) {
      id
      name
      description
      createdAt
    }
  }
`;

const JOIN_GROUP_MUTATION = `
  mutation JoinGroup($groupId: ID!) {
    joinGroup(groupId: $groupId)
  }
`;

export async function fetchMyGroups() {
  const token = requireAuthToken();
  const payload = await gatewayRequest(MY_GROUPS_QUERY, {}, token);
  return payload.myGroups || [];
}

export async function fetchGroupById(id) {
  const token = requireAuthToken();
  const payload = await gatewayRequest(GROUP_QUERY, { id }, token);
  return payload.group;
}

export async function searchGroups(query) {
  const token = requireAuthToken();
  if (!query.trim()) return [];
  const payload = await gatewayRequest(SEARCH_GROUPS_QUERY, { query: query.trim() }, token);
  return payload.searchGroups || [];
}

export async function createGroup(name, description) {
  const token = requireAuthToken();
  const payload = await gatewayRequest(
    CREATE_GROUP_MUTATION,
    { name: name.trim(), description: description?.trim() || null },
    token
  );
  return payload.createGroup;
}

export async function joinGroup(groupId) {
  const token = requireAuthToken();
  return gatewayRequest(JOIN_GROUP_MUTATION, { groupId }, token);
}
