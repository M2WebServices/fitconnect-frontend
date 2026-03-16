import { AUTH_URL, graphQLRequest } from './graphqlClient.js';

const SIGN_IN_MUTATION = `
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      token
      user {
        id
        email
        pseudo
      }
    }
  }
`;

const SIGN_UP_MUTATION = `
  mutation SignUp($email: String!, $pseudo: String!, $password: String!) {
    signUp(email: $email, pseudo: $pseudo, password: $password) {
      token
      user {
        id
        email
        pseudo
      }
    }
  }
`;

export async function signIn(email, password) {
  const data = await graphQLRequest(AUTH_URL, SIGN_IN_MUTATION, { email, password });
  return data.signIn;
}

export async function signUp(email, pseudo, password) {
  const data = await graphQLRequest(AUTH_URL, SIGN_UP_MUTATION, {
    email,
    pseudo,
    password,
  });
  return data.signUp;
}
