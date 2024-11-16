import express from 'express';
import {
  getProductValidator,
  createProductValidator,
  updateProductValidator,
  deleteProductValidator,
} from '../utils/validators/productValidator.js';

import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
} from '../controllers/product.controller.js';

import * as authController from '../controllers/auth.controller.js';

import reviewRouter from './review.routes.js';

const router = express.Router();

// Git /api/v1/products/:productId/reviews  →  nested route
router.use('/:productId/reviews', reviewRouter);

router
  .route('/')
  .get(getAllProducts)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct
  );
router
  .route('/:id')
  .get(getProductValidator, getProduct)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    deleteProductValidator,
    deleteProduct
  );

export default router;
