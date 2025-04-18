import { Schema } from 'mongoose';

// Mongoose subdocument schema for savedBooks
export const bookSchema = new Schema({
  bookId: {
    type: String,
    required: true,
  },
  authors: [
    {
      type: String,
    },
  ],
  description: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  link: {
    type: String,
  },
});

// Optional: GraphQL-friendly TypeScript type for input use
export type BookInput = {
  bookId: string;
  authors: string[];
  description?: string;
  title: string;
  image?: string;
  link?: string;
};
