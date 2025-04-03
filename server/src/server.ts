import express from 'express';
import path from 'node:path';
import db from './config/connection.js';
import routes from './routes/index.js';

// add these lines to make __dirname work
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/dist as static assets
if (process.env.NODE_ENV === 'production') {
  // Serve static assets from the client build folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Fallback: serve index.html for any unknown routes
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
  });
}


app.use(routes);

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
