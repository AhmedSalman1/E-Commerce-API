import express from 'express';
import {
  createBrandValidator,
  deleteBrandValidator,
  getBrandValidator,
  updateBrandValidator,
} from '../utils/validators/brandValidator.js';

import {
  getAllBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  resizeBrandImage,
} from '../controllers/brand.controller.js';

import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router
  .route('/')
  .get(getAllBrands)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    uploadBrandImage,
    resizeBrandImage,
    createBrandValidator,
    createBrand
  );
router
  .route('/:id')
  .get(getBrandValidator, getBrand)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    uploadBrandImage,
    resizeBrandImage,
    updateBrandValidator,
    updateBrand
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    deleteBrandValidator,
    deleteBrand
  );

export default router;
