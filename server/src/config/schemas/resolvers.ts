import User from '../../models/User';
import { signToken, AuthenticationError } from '../../services/auth'
import Thought from '../../models/Thought';

// Define types for the arguments
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

interface ThoughtArgs {
  thoughtId: string;
}

interface AddThoughtArgs {
  input: {
    thoughtText: string;
    thoughtAuthor: string;
  };
}

interface AddCommentArgs {
  thoughtId: string;
  commentText: string;
}

interface RemoveCommentArgs {
  thoughtId: string;
  commentId: string;
}

const resolvers = {
  Query: {
    users: async () => {
      return await User.find().populate('thoughts');
    },
    user: async (_parent: any, { username }: UserArgs) => {
      return await User.findOne({ username }).populate('thoughts');
    },
    thoughts: async () => {
      return await Thought.find().sort({ createdAt: -1 });
    },
    thought: async (_parent: any, { thoughtId }: ThoughtArgs) => {
      return await Thought.findOne({ _id: thoughtId });
    },
    me: async (_parent: any, _args: unknown, context: any) => {
      if (context.user) {
        return await User.findOne({ _id: context.user._id }).populate('thoughts');
      }
      throw new AuthenticationError('Could not authenticate user.');
    },
  },
  Mutation: {
    addUser: async (_parent: any, { input }: AddUserArgs) => {
      const user = await User.create({ ...input });
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
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
    addThought: async (_parent: any, { input }: AddThoughtArgs, context: any) => {
      if (context.user) {
        const thought = await Thought.create({ ...input });
        await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { thoughts: thought._id } }
        );
        return thought;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    addComment: async (_parent: any, { thoughtId, commentText }: AddCommentArgs, context: any) => {
      if (context.user) {
        return await Thought.findOneAndUpdate(
          { _id: thoughtId },
          {
            $addToSet: {
              comments: { commentText, commentAuthor: context.user.username },
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    removeThought: async (_parent: any, { thoughtId }: ThoughtArgs, context: any) => {
      if (context.user) {
        const thought = await Thought.findOneAndDelete({
          _id: thoughtId,
          thoughtAuthor: context.user.username,
        });
        if (!thought) {
          throw new AuthenticationError('Unable to delete thought.');
        }
        await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { thoughts: thought._id } }
        );
        return thought;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    removeComment: async (_parent: any, { thoughtId, commentId }: RemoveCommentArgs, context: any) => {
      if (context.user) {
        return await Thought.findOneAndUpdate(
          { _id: thoughtId },
          {
            $pull: {
              comments: {
                _id: commentId,
                commentAuthor: context.user.username,
              },
            },
          },
          { new: true }
        );
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

export default resolvers;