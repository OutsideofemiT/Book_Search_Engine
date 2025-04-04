import express, { Application } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { RequestHandler } from 'express';


// MongoDB or other DB connection
import db from './config/connection.js';
import routes from './routes/index.js';

// Apollo Server v4 and the Express integration
import { ApolloServer } from '@apollo/server';
import { expressMiddleware, ExpressContextFunctionArgument } from '@apollo/server/express4';

// Your GraphQL typeDefs and resolvers
import typeDefs from './config/schemas/typeDefs.js';
import resolvers from './config/schemas/resolvers.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Define your context type
type MyContext = {
  token: string | undefined;
};

const apolloServer = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
});

// Start Apollo Server (using top-level await in ESM)
await apolloServer.start();

// Use expressMiddleware to integrate Apollo Server with Express.
// Note: We explicitly check if req.headers.authorization is an array.
app.use(
  '/graphql',
  expressMiddleware<MyContext>(apolloServer, {
    context: async ({ req }: ExpressContextFunctionArgument) => ({
      token: Array.isArray(req.headers.authorization)
        ? req.headers.authorization[0]
        : req.headers.authorization,
    }),
  }) as RequestHandler
);


// Use your other routes
app.use(routes);

// In production, serve static files from the client build folder
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
  });
}

// Start the server after DB is open
db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
  });
});
