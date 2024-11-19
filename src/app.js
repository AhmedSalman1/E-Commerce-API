import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import compression from 'compression';

import { AppError } from './utils/appError.js';
import { globalErrorHandler } from './middlewares/errorHandler.js';

import categoryRouter from './routes/category.routes.js';
import subCategoryRouter from './routes/subcategory.routes.js';
import brandRouter from './routes/brand.routes.js';
import productRouter from './routes/product.routes.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import reviewRouter from './routes/review.routes.js';
import favoritesRouter from './routes/favorites.routes.js';
import addressRouter from './routes/address.routes.js';
import couponRouter from './routes/coupon.routes.js';
import cartRouter from './routes/cart.routes.js';
import orderRouter from './routes/order.routes.js';

const app = express();

app.use(cors());
app.options('*', cors());

app.use(compression());

app.use(express.json());
app.use(express.static('public'));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Nestify E-Commerce API' });
});

/*                   ROUTES                   */
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/subcategories', subCategoryRouter);
app.use('/api/v1/brands', brandRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/favorites', favoritesRouter);
app.use('/api/v1/addresses', addressRouter);
app.use('/api/v1/coupons', couponRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);

// ignore all MWs → jump to globalErrorHandler MW
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

/*           Global ErrorHandler MW           */
app.use(globalErrorHandler);

export default app;
