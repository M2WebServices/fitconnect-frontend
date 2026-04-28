import { emitSuccess } from './appEvents.js';
import { gatewayRequest } from './graphqlClient.js';
import { requireAuthToken } from './serviceUtils.js';

const PROFILE_QUERY = `
  query ProfilePage {
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

const UPDATE_MY_PROFILE_MUTATION = `
  mutation UpdateMyProfile($email: String, $pseudo: String) {
    updateMyProfile(email: $email, pseudo: $pseudo) {
      id
      username
      email
    }
  }
`;

export async function fetchProfileData() {
  const token = requireAuthToken();

  const payload = await gatewayRequest(PROFILE_QUERY, {}, token);
  return {
    me: payload.me || null,
    myRanking: payload.myRanking || null,
    myGroups: payload.myGroups || [],
    myEvents: payload.myEvents || [],
  };
}

export async function updateMyProfile({ email, pseudo }) {
  const token = requireAuthToken();
  const payload = await gatewayRequest(
    UPDATE_MY_PROFILE_MUTATION,
    {
      email: email?.trim() || null,
      pseudo: pseudo?.trim() || null,
    },
    token
  );
  emitSuccess('Profil mis à jour.');
  return payload.updateMyProfile;
}
