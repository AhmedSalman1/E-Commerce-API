import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

let DB = process.env.DB_URI.replace('<PASSWORD>', process.env.DB_PASSWORD);

let [mongod, MongoInstance] = [null, false];

// Connection
export const mongoConnect = async () => {
  if (process.env.NODE_ENV === 'test') {
    mongod = await MongoMemoryServer.create({
      instance: { port: 27017 },
    });
    DB = mongod.getUri();
    MongoInstance = true;
  } else {
    if (!process.env.DB_URI || !process.env.DB_PASSWORD) {
      throw new Error(
        'Database connection failed: Missing DB environment variables: Please define DB_URI and DB_PASSWORD.'
      );
    }
  }

  await mongoose.connect(DB);
};

export const mongoDisconnect = async () => {
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
};

// Listeners
mongoose.connection.once('open', () => {
  console.log(
    `DB connected successfully to ${MongoInstance ? 'In-Memory Test Database' : 'Production MongoDB Atlas'}`
  );
});

mongoose.connection.on('error', (err) => {
  console.log(err);
});
