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
} from '../controllers/subcategory.controller.js';

// access params from other(parent) routers
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllSubCategories)
  .post(createSubCategoryValidator, createSubCategory);
router
  .route('/:id')
  .get(getSubCategoryValidator, getSubCategory)
  .patch(updateSubCategoryValidator, updateSubCategory)
  .delete(deleteSubCategoryValidator, deleteSubCategory);

export default router;
