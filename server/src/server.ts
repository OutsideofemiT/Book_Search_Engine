import express, { Application } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken'; // ✅ Add JWT for token verification
import dotenv from 'dotenv';
dotenv.config();

// MongoDB connection
import db from './config/connection.js';
import routes from './routes/index.js';

// Apollo Server v4
import { ApolloServer } from '@apollo/server';
import { expressMiddleware, ExpressContextFunctionArgument } from '@apollo/server/express4';

import typeDefs from './config/schemas/typeDefs.js';
import resolvers from './config/schemas/resolvers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Context interface
type MyContext = {
  user?: any;
};

// ✅ Apollo Server with JWT verification in context
const apolloServer = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
});

await apolloServer.start();

app.use(
  '/graphql',
  expressMiddleware<MyContext>(apolloServer, {
    context: async ({ req }: ExpressContextFunctionArgument) => {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.split(' ').pop(); // Remove "Bearer" if included

      if (!token) return { user: null };

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || '') as { data: any };
        return { user: decoded.data };
      } catch (err) {
        console.error('Invalid token');
        return { user: null };
      }
    },
  }) as RequestHandler
);

// Use your other routes
app.use(routes);

// Static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
  });
}

// DB start listener
db.once('open', () => {
  console.log('⏳ [Server] DB open—starting listener');
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on http://localhost:${PORT}`);
  });
});

