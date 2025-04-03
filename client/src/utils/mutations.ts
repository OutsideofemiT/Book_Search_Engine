import { AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User'; // Replace with your actual user model
// Import your type definitions for the arguments; ensure these types are defined correctly.
// Define LoginArgs and AddUserArgs locally or import them from a shared location within the rootDir
interface LoginArgs {
  email: string;
  password: string;
}

interface AddUserArgs {
  username: string;
  email: string;
  password: string;
}
// Import the BookInput type (adjust the path if needed)
import { BookInput } from '../models/Book';

const secret = process.env.JWT_SECRET || 'yoursecretkey';

export const resolvers = {
  Mutation: {
    loginUser: async (_: unknown, { email, password }: LoginArgs) => {
      const user = await User.findOne({ email, password});
      if (!user) {
        throw new AuthenticationError("No user found with this username or email.");
      }

      // Compare the provided password with the stored hashed password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new AuthenticationError("Incorrect password.");
      }

      const token = jwt.sign({ id: user._id, username: user.username }, secret, { expiresIn: '2h' });
      return { token, user };
    },

    addUser: async (_: unknown, { username, email, password }: AddUserArgs) => {
      // Create the user
      const user = await User.create({ username, email, password });
      if (!user) {
        throw new Error("User creation failed.");
      }

      // Generate a JWT token for the newly created user
      const token = jwt.sign({ id: user._id, username: user.username }, secret, { expiresIn: '2h' });
      return { token, user };
    },

    saveBook: async (
      _: unknown,
      { bookData }: { bookData: BookInput },
      context: any
    ) => {
      // Ensure the user is authenticated
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to save a book.');
      }

      try {
        // Use $addToSet to add the book to savedBooks to avoid duplicates
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

    deleteBook: async (
      _: unknown,
      { bookId }: { bookId: string },
      context: any
    ) => {
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
