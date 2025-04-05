import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/graphql`
    : '/graphql',
  cache: new InMemoryCache(),
});

export default client;
