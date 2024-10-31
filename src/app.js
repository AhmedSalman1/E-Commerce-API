import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';

import { dbConnection } from '../config/db.js';
import { AppError } from './utils/appError.js';
import { globalErrorHandler } from './middlewares/errorHandler.js';

import categoryRouter from './routes/category.routes.js';
import subCategoryRouter from './routes/subcategory.routes.js';
import brandRouter from './routes/brand.routes.js';
import productRouter from './routes/product.routes.js';

dotenv.config();

dbConnection();

const app = express();

app.use(express.json());
app.use(express.static('public'));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/*                   ROUTES                   */
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/subcategories', subCategoryRouter);
app.use('/api/v1/brands', brandRouter);
app.use('/api/v1/products', productRouter);

// ignore all MWs → jump to globalErrorHandler MW
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

/*           Global ErrorHandler MW           */
app.use(globalErrorHandler);

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
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
