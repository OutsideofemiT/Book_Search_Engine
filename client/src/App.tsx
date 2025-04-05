import './App.css';
import { Outlet } from 'react-router-dom';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import Navbar from './components/Navbar';

const client = new ApolloClient({
  uri: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/graphql`
    : '/graphql',
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;
