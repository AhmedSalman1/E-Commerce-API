import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import { dbConnection } from './config/db.js';

dotenv.config();

dbConnection();

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/*                   ROUTES                   */
app.get('/', (req, res) => {
  res.send('WOW');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port} ✅`);
});
