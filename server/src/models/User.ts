import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Define the Book subdocument schema
const bookSchema = new Schema(
  {
    bookId: { type: String, required: true },
    authors: [String],
    description: String,
    title: { type: String, required: true },
    image: String,
    link: String,
  },
  { _id: false } // Prevent Mongo from auto-generating _id for subdocs
);

// Extend the Mongoose Document with custom user fields and methods
export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  savedBooks: typeof bookSchema[];
  isCorrectPassword(password: string): Promise<boolean>;
}

// User schema definition
const userSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    match: [/.+@.+\..+/, 'Must use a valid email address'],
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  savedBooks: [bookSchema],
});

// Pre-save middleware to hash password if modified
userSchema.pre<UserDocument>('save', async function (next) {
  if (this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Method to compare input password with hashed password
userSchema.methods.isCorrectPassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

// Export the User model
const User = model<UserDocument>('User', userSchema);
export default User;
