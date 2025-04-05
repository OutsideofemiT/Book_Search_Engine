import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';

import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import type { User } from '../models/User';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';

const SavedBooks = () => {
  // Execute GET_ME query on load with useQuery
  const { loading, error, data } = useQuery(GET_ME);
  const userData: User | undefined = data?.me;

  // Set up the REMOVE_BOOK mutation with useMutation
  const [removeBookMutation] = useMutation(REMOVE_BOOK, {
    refetchQueries: [{ query: GET_ME }],
    onError: (err) => console.error(err),
  });

  // Handler to delete a book
  const handleDeleteBook = async (bookId: string) => {
    if (!Auth.loggedIn()) return false;
    try {
      await removeBookMutation({ variables: { bookId } });
      // Remove the book ID from localStorage upon success
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // Show loading or error state if needed
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
