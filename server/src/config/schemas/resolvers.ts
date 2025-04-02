import User from '../../models/User';
import { signToken } from '../../services/auth';
import { AuthenticationError } from 'apollo-server-express';

interface AddUserArgs {
  input: {
    username: string;
    email: string;
    password: string;
  };
}

interface LoginUserArgs {
  email: string;
  password: string;
}

interface UserArgs {
  username: string;
}

interface SaveBookArgs {
  bookData: {
    bookId: string;
    authors: string[];
    description?: string;
    title: string;
    image?: string;
    link?: string;
  };
}

interface DeleteBookArgs {
  bookId: string;
}

const resolvers = {
  Query: {
    // Get the currently authenticated user.
    me: async (_parent: any, _args: any, context: any) => {
      if (context.user) {
        return await User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('Could not authenticate user.');
    },
    // Get a user by username.
    user: async (_parent: any, { username }: UserArgs) => {
      return await User.findOne({ username });
    },
    // Optionally, get all users.
    users: async () => {
      return await User.find();
    },
  },
  Mutation: {
    // Create a new user and sign a token.
    addUser: async (_parent: any, { input }: AddUserArgs) => {
      const user = await User.create({ ...input });
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    // Log in an existing user.
    login: async (_parent: any, { email, password }: LoginUserArgs) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('Could not authenticate user.');
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('Could not authenticate user.');
      }
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    // Save a book to the authenticated user's savedBooks array.
    saveBook: async (_parent: any, { bookData }: SaveBookArgs, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to save a book.');
      }
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        );
        if (!updatedUser) {
          throw new Error("Book not saved.");
        }
        return updatedUser;
      } catch (err) {
        console.error(err);
        throw new Error('An error occurred while saving the book.');
      }
    },
    // Remove a book from the authenticated user's savedBooks array.
    deleteBook: async (_parent: any, { bookId }: DeleteBookArgs, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to delete a book.');
      }
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true, runValidators: true }
        );
        if (!updatedUser) {
          throw new Error("Book not deleted.");
        }
        return updatedUser;
      } catch (err) {
        console.error(err);
        throw new Error('An error occurred while deleting the book.');
      }
    },
  },
};

export default resolvers;
