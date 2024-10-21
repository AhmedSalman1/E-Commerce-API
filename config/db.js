import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const DB = process.env.DB_URI.replace('<PASSWORD>', process.env.DB_PASSWORD);

export const dbConnection = () => {
  mongoose
    .connect(DB)
    .then(() => console.log('DB connection successful'))
    .catch((err) => console.log(`DB Error: ${err}`));
};
