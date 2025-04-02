/*	LOGIN_USER will execute the loginUser mutation set up using Apollo Server.
	ADD_USER will execute the addUser mutation.
	SAVE_BOOK will execute the saveBook mutation.
	REMOVE_BOOK will execute the removeBook mutation*/


	import { AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import BookInput from '../models/Book'; // Adjusted the path to point to the correct location of types
import bcrypt from 'bcryptjs';
import User from '../models/User'; // Replace with your actual user model
import { LoginArgs } from '../../../server/src/controllers/user-controller'; // Replace with your actual type definitions

const secret = process.env.JWT_SECRET || 'yoursecretkey';

export const resolvers = {
  Mutation: {

    loginUser: async (_: unknown, { username, email, password }: LoginArgs) => {
      // Find the user by username
      const user = await User.findOne({ username, email });
      if (!user) {
        throw new AuthenticationError("No user found with this username or email.");
      
      // Compare the provided password with the stored hashed password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new AuthenticationError("Incorrect password.");
      }
      
      // Generate a JWT token for the user
      const token = jwt.sign({ id: user._id, username: user.username }, secret, { expiresIn: '2h' });
      
      // Return the token and user data
      return { token, user };
      }
	},

	addUser: async (_: unknown, { username, email, password }: AddUserArgs) => {
		// Create the user
		const user = await User.create({ username, email, password });
		if (!user) {
		  throw new Error("User creation failed.");
		}
		
		// Generate a JWT token for the newly created user
		const token = jwt.sign({ id: user._id, username: user.username }, secret, { expiresIn: '2h' });
		
		// Return the token and user data
		return { token, user };
	  }
	},

	saveBook: async (
		{ bookData }: { bookData: BookInput }, // Ensure BookInput is defined or imported
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
	},
  };
  	removeBook: async (
		
	)




