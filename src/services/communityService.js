import { emitSuccess } from './appEvents.js';
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

const LEAVE_GROUP_MUTATION = `
  mutation LeaveGroup($groupId: ID!) {
    leaveGroup(groupId: $groupId)
  }
`;

const UPDATE_GROUP_MUTATION = `
  mutation UpdateGroup($id: ID!, $name: String, $description: String) {
    updateGroup(id: $id, name: $name, description: $description) {
      id
      name
      description
      createdAt
    }
  }
`;

const DELETE_GROUP_MUTATION = `
  mutation DeleteGroup($id: ID!) {
    deleteGroup(id: $id)
  }
`;

const ADD_GROUP_MEMBER_MUTATION = `
  mutation AddGroupMember($groupId: ID!, $userId: ID!, $role: String) {
    addGroupMember(groupId: $groupId, userId: $userId, role: $role)
  }
`;

const REMOVE_GROUP_MEMBER_MUTATION = `
  mutation RemoveGroupMember($groupId: ID!, $userId: ID!) {
    removeGroupMember(groupId: $groupId, userId: $userId)
  }
`;

function normalizeGroup(raw) {
  if (!raw || typeof raw !== 'object') return null;

  // Direct group shape.
  if (raw.id && raw.name) {
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description || '',
      createdAt: raw.createdAt || null,
    };
  }

  // Membership-like shape where group is nested.
  if (raw.group && raw.group.id && raw.group.name) {
    return {
      id: raw.group.id,
      name: raw.group.name,
      description: raw.group.description || '',
      createdAt: raw.group.createdAt || null,
    };
  }

  return null;
}

function normalizeGroupList(rawList) {
  const candidates = Array.isArray(rawList)
    ? rawList
    : Array.isArray(rawList?.nodes)
      ? rawList.nodes
      : Array.isArray(rawList?.items)
        ? rawList.items
        : [];

  const map = new Map();
  candidates.forEach((entry) => {
    const group = normalizeGroup(entry);
    if (group && group.id) {
      map.set(group.id, group);
    }
  });

  return Array.from(map.values());
}

export async function fetchMyGroups() {
  const token = requireAuthToken();
  const payload = await gatewayRequest(MY_GROUPS_QUERY, {}, token);
  return normalizeGroupList(payload.myGroups);
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
  return normalizeGroupList(payload.searchGroups);
}

export async function createGroup(name, description) {
  const token = requireAuthToken();
  const payload = await gatewayRequest(
    CREATE_GROUP_MUTATION,
    { name: name.trim(), description: description?.trim() || null },
    token
  );
  emitSuccess('Groupe créé avec succès.');
  return payload.createGroup;
}

export async function joinGroup(groupId) {
  const token = requireAuthToken();
  const result = await gatewayRequest(JOIN_GROUP_MUTATION, { groupId }, token);
  emitSuccess('Groupe rejoint.');
  return result;
}

export async function leaveGroup(groupId) {
  const token = requireAuthToken();
  const result = await gatewayRequest(LEAVE_GROUP_MUTATION, { groupId }, token);
  emitSuccess('Vous avez quitté le groupe.');
  return result;
}

export async function updateGroup(id, name, description) {
  const token = requireAuthToken();
  const payload = await gatewayRequest(
    UPDATE_GROUP_MUTATION,
    {
      id,
      name: typeof name === 'string' ? name.trim() || null : null,
      description: typeof description === 'string' ? description.trim() || null : null,
    },
    token
  );
  return payload.updateGroup;
}

export async function deleteGroup(id) {
  const token = requireAuthToken();
  return gatewayRequest(DELETE_GROUP_MUTATION, { id }, token);
}

export async function addGroupMember(groupId, userId, role = 'MEMBER') {
  const token = requireAuthToken();
  return gatewayRequest(
    ADD_GROUP_MEMBER_MUTATION,
    { groupId, userId: userId.trim(), role },
    token
  );
}

export async function removeGroupMember(groupId, userId) {
  const token = requireAuthToken();
  return gatewayRequest(REMOVE_GROUP_MEMBER_MUTATION, { groupId, userId }, token);
}
