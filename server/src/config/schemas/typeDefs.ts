const typeDefs = `
  # The User type represents a user in your system.
  type User {
    _id: ID!
    username: String!
    email: String!
    # For security, you might not expose the password in queries.
    savedBooks: [Book]!
  }

  # The Book type describes a saved book.
  type Book {
    bookId: String!
    authors: [String!]!
    description: String
    title: String!
    image: String
    link: String
  }

  # Input type for registering a new user.
  input UserInput {
    username: String!
    email: String!
    password: String!
  }

  # Input type for saving a book.
  input BookInput {
    bookId: String!
    authors: [String!]!
    description: String
    title: String!
    image: String
    link: String
  }

  # Auth type that returns a token along with the user data.
  type Auth {
    token: ID!
    user: User
  }

  # Queries for retrieving user data.
  type Query {
    # Get the currently authenticated user.
    me: User
    # Get a user by ID or username.
    user(id: ID, username: String): User
  }

  # Mutations to handle user and book operations.
  type Mutation {
    # Register a new user.
    addUser(input: UserInput!): Auth
    # Log in an existing user.
    login(email: String!, password: String!): Auth
    # Save a book to the user's savedBooks list.
    saveBook(bookData: BookInput!): User
    # Remove a book from the user's savedBooks list.
    deleteBook(bookId: String!): User
  }
`;
export default typeDefs;