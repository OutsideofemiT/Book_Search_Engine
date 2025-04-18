import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { bookSchema } from './Book.js';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    savedBooks: [bookSchema],
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Password validation method
userSchema.methods.isCorrectPassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

// Virtual to count saved books
userSchema.virtual('bookCount').get(function () {
  return this.savedBooks.length;
});

const User = model('User', userSchema);

export default User;
