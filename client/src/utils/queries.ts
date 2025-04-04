// queries.ts
import { gql } from '@apollo/client';
export const GET_ME = gql`
  query getMe {
    me {
      _id
      username
      email
      savedBooks {
        bookId
        title
        authors
      }
    }
  }
`;
