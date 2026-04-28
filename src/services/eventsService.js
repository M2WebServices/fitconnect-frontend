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

const MY_EVENTS_QUERY = `
  query MyEvents {
    myEvents {
      id
      title
      description
      date
      groupId
    }
  }
`;

const GROUP_EVENTS_QUERY = `
  query GroupEvents($groupId: ID!) {
    groupEvents(groupId: $groupId) {
      id
      title
      description
      date
      groupId
    }
  }
`;

const CREATE_EVENT_MUTATION = `
  mutation CreateEvent(
    $groupId: ID!
    $title: String!
    $description: String
    $date: String!
  ) {
    createEvent(
      groupId: $groupId
      title: $title
      description: $description
      date: $date
    ) {
      id
      title
      description
      date
      groupId
    }
  }
`;

const EVENT_QUERY = `
  query Event($id: ID!) {
    event(id: $id) {
      id
      title
      description
      date
      groupId
      group {
        id
        name
      }
    }
  }
`;

const EVENT_PARTICIPANTS_QUERY = `
  query EventParticipants($eventId: ID!) {
    eventParticipants(eventId: $eventId) {
      userId
      joinedAt
      user {
        id
        username
        email
      }
    }
  }
`;

const UPDATE_EVENT_MUTATION = `
  mutation UpdateEvent($id: ID!, $title: String, $description: String, $date: String) {
    updateEvent(id: $id, title: $title, description: $description, date: $date) {
      id
      title
      description
      date
      groupId
    }
  }
`;

const DELETE_EVENT_MUTATION = `
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

const JOIN_EVENT_MUTATION = `
  mutation JoinEvent($eventId: ID!) {
    joinEvent(eventId: $eventId)
  }
`;

function mergeUniqueEvents(events) {
  const map = new Map();
  events.forEach((event) => {
    if (!map.has(event.id)) {
      map.set(event.id, event);
    }
  });
  return Array.from(map.values());
}

function addComputedFields(events, myEventIds, groupsById) {
  const now = new Date();

  return events.map((event) => {
    const eventDate = event.date ? new Date(event.date) : null;
    const isPast = eventDate && !Number.isNaN(eventDate.getTime()) ? eventDate < now : false;

    let status = 'open';
    if (isPast) {
      status = 'past';
    } else if (myEventIds.has(event.id)) {
      status = 'registered';
    }

    return {
      ...event,
      status,
      groupName: groupsById.get(event.groupId)?.name || 'Groupe non defini',
    };
  });
}

export async function fetchEventsPageData() {
  const token = requireAuthToken();

  const [{ myGroups }, { myEvents }] = await Promise.all([
    gatewayRequest(MY_GROUPS_QUERY, {}, token),
    gatewayRequest(MY_EVENTS_QUERY, {}, token),
  ]);

  const groups = myGroups || [];
  const groupsById = new Map(groups.map((group) => [group.id, group]));

  const groupEventResults = await Promise.all(
    groups.map((group) => gatewayRequest(GROUP_EVENTS_QUERY, { groupId: group.id }, token))
  );

  const groupEvents = groupEventResults.flatMap((result) => result.groupEvents || []);
  const mergedEvents = mergeUniqueEvents([...(myEvents || []), ...groupEvents]);
  const myEventIds = new Set((myEvents || []).map((event) => event.id));

  const events = addComputedFields(mergedEvents, myEventIds, groupsById).sort(
    (a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
  );

  return {
    groups,
    events,
  };
}

export async function fetchEventById(id) {
  const token = requireAuthToken();
  const payload = await gatewayRequest(EVENT_QUERY, { id }, token);
  return payload.event;
}

export async function fetchEventParticipants(eventId) {
  const token = requireAuthToken();
  const payload = await gatewayRequest(EVENT_PARTICIPANTS_QUERY, { eventId }, token);
  return payload.eventParticipants || [];
}

export async function createEvent({ groupId, title, description, dateIso }) {
  const token = requireAuthToken();

  const payload = await gatewayRequest(
    CREATE_EVENT_MUTATION,
    {
      groupId,
      title,
      description,
      date: dateIso,
    },
    token
  );

  emitSuccess('Événement créé avec succès.');
  return payload.createEvent;
}

export async function updateEvent(id, { title, description, dateIso }) {
  const token = requireAuthToken();
  const payload = await gatewayRequest(UPDATE_EVENT_MUTATION, {
    id,
    title: title?.trim() || null,
    description: description?.trim() || null,
    date: dateIso || null,
  }, token);
  return payload.updateEvent;
}

export async function deleteEvent(id) {
  const token = requireAuthToken();
  const result = await gatewayRequest(DELETE_EVENT_MUTATION, { id }, token);
  emitSuccess('Événement supprimé.');
  return result;
}

export async function joinEvent(eventId) {
  const token = requireAuthToken();
  const result = await gatewayRequest(JOIN_EVENT_MUTATION, { eventId }, token);
  emitSuccess('Inscription confirmée.');
  return result;
}
