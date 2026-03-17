import { gatewayRequest } from './graphqlClient.js';
import { requireAuthToken } from './serviceUtils.js';

const PLANNING_QUERY = `
  query PlanningPage {
    myWorkoutSessions(limit: 100) {
      workoutSessionId
      userId
      completedAt
      durationMinutes
      caloriesBurned
      eventId
      groupId
      user {
        id
        username
        email
      }
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

const COMPLETE_WORKOUT_MUTATION = `
  mutation CompleteWorkoutSession(
    $workoutSessionId: ID!
    $completedAt: String
    $durationMinutes: Int
    $caloriesBurned: Int
    $eventId: ID
    $groupId: ID
  ) {
    completeWorkoutSession(
      workoutSessionId: $workoutSessionId
      completedAt: $completedAt
      durationMinutes: $durationMinutes
      caloriesBurned: $caloriesBurned
      eventId: $eventId
      groupId: $groupId
    ) {
      workoutSessionId
      userId
      completedAt
      durationMinutes
      caloriesBurned
      eventId
      groupId
    }
  }
`;

export async function fetchPlanningData() {
  const token = requireAuthToken();

  const payload = await gatewayRequest(PLANNING_QUERY, {}, token);
  const eventsById = new Map((payload.myEvents || []).map((event) => [event.id, event]));
  const groupsById = new Map((payload.myGroups || []).map((group) => [group.id, group]));

  const workouts = (payload.myWorkoutSessions || [])
    .map((workout) => ({
      ...workout,
      eventTitle: eventsById.get(workout.eventId)?.title || `Session ${workout.workoutSessionId}`,
      groupName: groupsById.get(workout.groupId)?.name || 'Groupe inconnu',
    }))
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());

  return {
    workouts,
    events: payload.myEvents || [],
    groups: payload.myGroups || [],
  };
}

export async function completeWorkoutSession(input) {
  const token = requireAuthToken();
  const payload = await gatewayRequest(COMPLETE_WORKOUT_MUTATION, input, token);
  return payload.completeWorkoutSession;
}
