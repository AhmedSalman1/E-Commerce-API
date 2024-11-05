import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// ✅
import app from './app.js';
import { dbConnection } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url); // Current file
const __dirname = path.dirname(__filename); // Current directory

dotenv.config({ path: path.join(__dirname, '../.env') });

const port = process.env.PORT || 5000;
const server = http.createServer(app);

dbConnection();

server.listen(port, () => {
  console.log(`Server running on port ${port} ✅`);
});

/*     Handle Promise Rejection (handle errors outside express)     */
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! 💥 Shutting down...');
  console.log(err.name, err.message);

  // When server is closed, shutdown app
  server.close(() => {
    process.exit(1);
  });
});
