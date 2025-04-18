import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row
} from 'react-bootstrap';
import { useMutation } from '@apollo/client';

import Auth from '../utils/auth';
import { searchGoogleBooks } from '../utils/API'; // removed saveBook since we'll use the mutation hook instead
import { getSavedBookIds } from '../utils/localStorage';
import type { Book } from '../types/Book';
import type { GoogleAPIBook } from '../types/GoogleAPIBook';
import { SAVE_BOOK } from '../utils/mutations';


const SearchBooks = () => {
  // State for holding returned Google API data
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  // State for the search field data
  const [searchInput, setSearchInput] = useState('');
  // State to hold saved book ID values
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  // Use Apollo's useMutation hook for the SAVE_BOOK mutation
  const [saveBookMutation] = useMutation(SAVE_BOOK);


  // Method to search for books on form submit
  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error('something went wrong!');
      }

      const { items } = await response.json();

      const bookData = items.map((book: GoogleAPIBook) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail?.replace(/^http:/, 'https:') || '',
        link: book.volumeInfo.infoLink?.replace(/^http:/, 'https:') || '',
      }));
      

      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
    return undefined;
  };

  // Function to handle saving a book to our database
  const handleSaveBook = async (bookId: string) => {
    // Find the book in `searchedBooks` state by matching id
    const bookToSave: Book = searchedBooks.find((book) => book.bookId === bookId)!;
  
    // Get token from Auth
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) return false;
  
    try {
      const { bookId, authors, title, description, image, link } = bookToSave;
  
      const bookInput = { bookId, authors, title, description, image, link };
  
      console.log('📦 Sending to mutation:', bookInput);
  
      // Execute the SAVE_BOOK mutation with only the necessary fields
      await saveBookMutation({
        variables: { bookData: bookInput },
        context: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      });
  
      // Update saved book IDs
      setSavedBookIds([...savedBookIds, bookId]);
  
      console.log('✅ Book saved successfully:', bookId);
      return true;
    } catch (err) {
      console.error('❌ Error saving book:', err);
      return false;
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            return (
              <Col md="4" key={book.bookId}>
                <Card border='dark'>
                  {book.image ? (
                    <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors.join(', ')}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {Auth.loggedIn() && (
                      <Button
                        disabled={savedBookIds?.some((savedBookId: string) => savedBookId === book.bookId)}
                        className='btn-block btn-info'
                        onClick={() => handleSaveBook(book.bookId)}>
                        {savedBookIds?.some((savedBookId: string) => savedBookId === book.bookId)
                          ? 'This book has already been saved!'
                          : 'Save this Book!'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
