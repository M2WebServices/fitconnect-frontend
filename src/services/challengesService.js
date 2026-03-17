import { gatewayRequest } from './graphqlClient.js';
import { requireAuthToken } from './serviceUtils.js';

const CHALLENGES_QUERY = `
  query Challenges {
    challenges {
      id
      eventId
      groupId
      title
      createdAt
      pointsReward
    }
  }
`;

const CHALLENGE_PARTICIPANTS_QUERY = `
  query ChallengeParticipants($challengeId: ID!) {
    challengeParticipants(challengeId: $challengeId) {
      id
      challengeId
      userId
      joinedAt
      completed
      completedAt
      user {
        id
        username
        email
      }
    }
  }
`;

export async function fetchChallengesData() {
  const token = requireAuthToken();

  const payload = await gatewayRequest(CHALLENGES_QUERY, {}, token);
  const challenges = payload.challenges || [];

  const participantResults = await Promise.all(
    challenges.map(async (challenge) => {
      const result = await gatewayRequest(
        CHALLENGE_PARTICIPANTS_QUERY,
        { challengeId: challenge.id },
        token
      );

      return {
        challengeId: challenge.id,
        participants: result.challengeParticipants || [],
      };
    })
  );

  const participantsByChallengeId = new Map(
    participantResults.map((entry) => [entry.challengeId, entry.participants])
  );

  return challenges.map((challenge, index) => {
    const participants = participantsByChallengeId.get(challenge.id) || [];
    const completedCount = participants.filter((participant) => participant.completed).length;
    const progress = participants.length
      ? Math.round((completedCount / participants.length) * 100)
      : index === 0
        ? 65
        : index === 1
          ? 25
          : 100;

    const status =
      completedCount > 0 && completedCount === participants.length
        ? 'termine'
        : participants.length > 0
          ? 'en-cours'
          : 'a-venir';

    return {
      id: challenge.id,
      title: challenge.title,
      description: `Challenge lié au groupe ${challenge.groupId || 'inconnu'}${challenge.eventId ? ` • event ${challenge.eventId}` : ''}`,
      points: challenge.pointsReward || 0,
      participants: participants.length,
      progress,
      progressColor: progress >= 100 ? 'fill-green' : progress >= 50 ? 'fill-orange' : 'fill-red',
      status,
      action:
        status === 'termine'
          ? 'Voir les résultats'
          : status === 'en-cours'
            ? 'Continuer'
            : 'Bientôt disponible',
      actionClass:
        status === 'termine'
          ? 'btn-ev-muted'
          : status === 'en-cours'
            ? 'btn-ev-primary'
            : 'btn-ev-disabled',
      createdAt: challenge.createdAt,
      participantDetails: participants,
    };
  });
}
