import express from 'express';
import {
  createSubCategoryValidator,
  deleteSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryValidator,
} from '../utils/validators/subCategoryValidator.js';

import {
  createSubCategory,
  deleteSubCategory,
  getAllSubCategories,
  getSubCategory,
  updateSubCategory,
  setCategoryIdToBody,
} from '../controllers/subcategory.controller.js';

import * as authController from '../controllers/auth.controller.js';

// access params from other(parent) routers
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllSubCategories)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    setCategoryIdToBody,
    createSubCategoryValidator,
    createSubCategory
  );
router
  .route('/:id')
  .get(getSubCategoryValidator, getSubCategory)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    updateSubCategoryValidator,
    updateSubCategory
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    deleteSubCategoryValidator,
    deleteSubCategory
  );

export default router;
