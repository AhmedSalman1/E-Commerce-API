import express from 'express';
import {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} from '../utils/validators/categoryValidator.js';

import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeCategoryImage,
} from '../controllers/category.controller.js';

import * as authController from '../controllers/auth.controller.js';

import subCategoryRouter from './subcategory.routes.js';

const router = express.Router();

// Git /api/v1/categories/:categoryId/subcategories  →  nested route
router.use('/:categoryId/subcategories', subCategoryRouter);

router
  .route('/')
  .get(getAllCategories)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    uploadCategoryImage,
    resizeCategoryImage,
    createCategoryValidator,
    createCategory
  );
router
  .route('/:id')
  .get(getCategoryValidator, getCategory)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    uploadCategoryImage,
    resizeCategoryImage,
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    deleteCategoryValidator,
    deleteCategory
  );

export default router;
