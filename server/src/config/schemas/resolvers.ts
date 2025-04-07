import User from '../../models/User.js';
import { AuthenticationError } from 'apollo-server-express';

export const resolvers = {
  Query: {
    // Get the currently logged-in user
    me: async (_: unknown, __: unknown, context: any) => {
      if (!context.token) {
        throw new AuthenticationError('Not logged in');
      }

      try {
        const user = await User.findById(context.token.id).select('-__v -password');
        return user;
      } catch (err) {
        console.error('Error fetching user in me query:', err);
        throw new Error('Failed to get user');
      }
    },

    // (Optional) Get all users
    users: async () => {
      return await User.find().select('-__v -password');
    },

    // (Optional) Get user by ID or username
    user: async (_: unknown, { id, username }: { id?: string; username?: string }) => {
      if (id) return await User.findById(id).select('-__v -password');
      if (username) return await User.findOne({ username }).select('-__v -password');
      throw new Error('You must provide an id or username');
    },
  },

  Mutation: {
    // ... your existing login, addUser, saveBook, deleteBook
  }
};

export default resolvers;
