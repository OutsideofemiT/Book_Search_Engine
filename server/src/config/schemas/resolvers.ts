import User from '../../models/User.js'; // Correct path to User model
//import { signToken } from '../../services/auth.js'; // Correct path to auth service
import { AuthenticationError } from 'apollo-server-express'; // No change needed
import jwt from 'jsonwebtoken'; // No change needed
import bcrypt from 'bcryptjs'; // No change needed

// Ensure the BookInput type is correctly imported from the Book model
import { BookInput } from '../../models/Book.js';

 // Ensure BookInput is exported as a type

interface LoginArgs {
  email: string;
  password: string;
}

interface AddUserArgs {
  username: string;
  email: string;
  password: string;
}

interface AddUserArgs {
  username: string;
}

interface SaveBookArgs {
  bookData: BookInput;
}

interface DeleteBookArgs {
  bookId: string;
}

const secret = process.env.JWT_SECRET || 'yoursecretkey';

export const resolvers = {
  Mutation: {
    // Rename loginUser to "login" if your schema uses that name.
    login: async (_: unknown, { email, password }: LoginArgs) => {
      // Query by email only:
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("No user found with this email.");
      }

      // Compare the provided password with the stored hashed password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new AuthenticationError("Incorrect password.");
      }

      const token = jwt.sign({ id: user._id, username: user.username }, secret, { expiresIn: '2h' });
      return { token, user };
    },

    // Rename addUser remains as is if schema is "addUser"
    addUser: async (_: unknown, { username, email, password }: AddUserArgs) => {
      // Create the user (ensure password is hashed via a pre-save hook or here)
      const user = await User.create({ username, email, password });
      if (!user) {
        throw new Error("User creation failed.");
      }

      const token = jwt.sign({ id: user._id, username: user.username }, secret, { expiresIn: '2h' });
      return { token, user };
    },

    // Use "saveBook" as defined in your schema
    saveBook: async (
      _: unknown,
      { bookData }: SaveBookArgs,
      context: any
    ) => {
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

    // Rename deleteBook to "removeBook" if your schema requires that.
    deleteBook: async (
      _: unknown,
      { bookId }: DeleteBookArgs,
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
export default resolvers;
