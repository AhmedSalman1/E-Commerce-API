import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../src/models/product.model.js';

dotenv.config({ path: '../.env' });

const DB = process.env.DB_URI.replace('<PASSWORD>', process.env.DB_PASSWORD);

export const dbConnection = () => {
  mongoose.connect(DB).then(() => console.log('DB connection successful'));
};

// connect to DB
dbConnection();

// Read data
const products = JSON.parse(fs.readFileSync('./products.json'));

// Insert data into DB
const insertData = async () => {
  try {
    await Product.create(products);
    console.log('Data Inserted Successfully');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log('Data Destroyed Successfully');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// node import-dev-data.js (-i, -d)
if (process.argv[2] === '-i') {
  insertData();
} else if (process.argv[2] === '-d') {
  destroyData();
}
