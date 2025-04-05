import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';

import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import type { User } from '../models/User';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';

const SavedBooks = () => {
  // Use the useQuery hook to fetch the current user's data
  const { loading, error, data, refetch } = useQuery(GET_ME);
  // The query returns an object with a `me` property; we'll call that userData.
  const userData: User | undefined = data?.me;

  // Set up the mutation hook for removing a book.
  const [removeBookMutation] = useMutation(REMOVE_BOOK, {
    // Optionally refetch GET_ME after mutation to update the cache:
    refetchQueries: [{ query: GET_ME }],
    onError: (err) => console.error(err),
  });

  // Handler to delete a book by its bookId.
  const handleDeleteBook = async (bookId: string) => {
    try {
      if (!Auth.loggedIn()) {
        return false;
      }
      // Execute the REMOVE_BOOK mutation.
      await removeBookMutation({ variables: { bookId } });
      // Optionally, if you're not using refetchQueries, you can call refetch() here:
      // await refetch();
      // Remove the bookId from localStorage.
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // Display loading or error states.
  if (loading) return <h2>LOADING...</h2>;
  if (error) return <h2>Error: {error.message}</h2>;
  if (!userData) return <h2>No user data found</h2>;

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className="pt-5">
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => (
            <Col key={book.bookId} md="4">
              <Card border="dark">
                {book.image && (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant="top"
                  />
                )}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button
                    className="btn-block btn-danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
