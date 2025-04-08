import User from '../../models/User.js';
import { AuthenticationError } from 'apollo-server-express';
import { signToken } from '../../services/auth.js'; // correct path based on your setup

export const resolvers = {
  Query: {
    // Get the currently logged-in user
    me: async (_: unknown, __: unknown, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('Not logged in');
      }
    
      try {
        const user = await User.findById(context.user.id).select('-__v -password');
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
    addUser: async (_: unknown, { input }: any) => {
      try {
        const user = await User.create(input);
        const token = signToken(user); // ✅ updated
        return { token, user };
      } catch (err) {
        console.error('Error in addUser:', err);
        throw new Error('Failed to create user');
      }
    },

    login: async (_: unknown, { email, password }: any) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          throw new AuthenticationError('No user found with this email');
        }

        const validPassword = await user.isCorrectPassword(password);

        if (!validPassword) {
          throw new AuthenticationError('Incorrect credentials');
        }

        const token = signToken(user); // ✅ updated
        return { token, user };
      } catch (err) {
        console.error('Error in login:', err);
        throw new AuthenticationError('Login failed');
      }
    },
  }
};

export default resolvers;
