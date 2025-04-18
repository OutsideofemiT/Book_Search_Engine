const typeDefs = `
  """
  The User type represents a registered user.
  """
  type User {
    _id: ID!
    username: String!
    email: String!
    savedBooks: [Book!]!
  }

  """
  The Book type represents a saved book.
  """
  type Book {
    bookId: String!
    authors: [String!]!
    description: String
    title: String!
    image: String
    link: String
  }

  """
  Input type for registering a new user.
  """
  input UserInput {
    username: String!
    email: String!
    password: String!
  }

  """
  Input type for saving a book.
  """
  input BookInput {
    bookId: String!
    authors: [String!]!
    description: String
    title: String!
    image: String
    link: String
  }

  """
  Auth type for returning a token and user info.
  """
  type Auth {
    token: String!
    user: User
  }

  """
  Root query operations.
  """
  type Query {
    me: User
    user(id: ID, username: String): User
    users: [User]
  }

  """
  Root mutations for user and book operations.
  """
  type Mutation {
    addUser(input: UserInput!): Auth
    login(email: String!, password: String!): Auth
    saveBook(bookData: BookInput!): User
    removeBook(bookId: String!): User
  }
`;

export default typeDefs;
