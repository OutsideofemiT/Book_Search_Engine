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

// ✅ Used by resolvers to create a signed JWT
export function signToken(user: UserPayload): string {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
  };

  return jwt.sign({ data: payload }, secret, { expiresIn });
}

// ✅ Used in Apollo context to attach decoded user
export const authenticateToken = ({ req }: any) => {
  let token = req.body.token || req.query.token || req.headers.authorization;

  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }

  if (!token) {
    return req;
  }

  try {
    const { data }: any = jwt.verify(token, secret, { maxAge: '2h' });
    req.user = data;
  } catch (err) {
    console.log('Invalid token');
  }

  return req;
};

// ✅ Custom GraphQL error for auth issues
export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, undefined, undefined, undefined, ['UNAUTHENTICATED']);
    Object.defineProperty(this, 'name', { value: 'AuthenticationError' });
  }
}
