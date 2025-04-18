import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.JWT_SECRET_KEY || 'mysecretkey';
const expiresIn = '2h';

interface UserPayload {
  _id: any;
  username: string;
  email: string;
}

// ✅ Used to sign a new token on login/signup
export function signToken(user: UserPayload): string {
  const payload = {
    _id: user._id,
    username: user.username,
    email: user.email,
  };

  return jwt.sign({ data: payload }, secret, { expiresIn });
}

// ✅ Used in Apollo context function
export function authMiddleware({ req }: { req: any }) {
  let token = req.headers.authorization || '';

  if (token && token.startsWith('Bearer ')) {
    token = token.split(' ').pop()?.trim() || '';
  }

  if (!token) return req;

  try {
    const { data } = jwt.verify(token, secret) as { data: any };
    req.user = data;
  } catch (err) {
    console.warn('❌ Invalid token');
  }

  return req;
}

// ✅ Custom Apollo-style error
export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    });
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
}

