import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('WOW');
});

app.listen(port, () => {
  console.log(`Server running on port ${port} ✅`);
});
