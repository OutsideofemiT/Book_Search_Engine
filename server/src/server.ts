import express, { Application } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { RequestHandler } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

// MongoDB
import mongoose from 'mongoose';
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks';
mongoose.connect(mongoURI);

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});
mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connected successfully');
});

// Apollo Server
import { ApolloServer } from '@apollo/server';
import { expressMiddleware, ExpressContextFunctionArgument } from '@apollo/server/express4';
import typeDefs from './schemas/typeDefs.js';
import resolvers from './schemas/resolvers.js';

// 🔐 JWT Middleware
import { authMiddleware } from './utils/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app: Application = express();
const PORT = process.env.PORT || 3001;

// 🛡️ CORS for frontend communication
app.use(cors({
  origin: ['http://localhost:3000', 'https://book-search-engine-ygm6.onrender.com'],
  credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Define Apollo context type
type MyContext = {
  user?: any;
};

const apolloServer = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
});

await apolloServer.start();

app.use(
  '/graphql',
  expressMiddleware<MyContext>(apolloServer, {
    context: async ({ req }: ExpressContextFunctionArgument) => {
      const modifiedReq = authMiddleware({ req });
      return { user: modifiedReq.user };
    },
  }) as RequestHandler
);

// ✅ Health check route
app.get('/', (_, res) => {
  res.send('Server is running.');
});

// ✅ Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist', 'index.html'));
  });
}


app.listen(PORT, () => {
  console.log(`🌍 Now listening on http://localhost:${PORT}`);
});
