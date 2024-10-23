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
} from '../controllers/category.controller.js';

const router = express.Router();

router
  .route('/')
  .get(getAllCategories)
  .post(createCategoryValidator, createCategory);
router
  .route('/:id')
  .get(getCategoryValidator, getCategory)
  .patch(updateCategoryValidator, updateCategory)
  .delete(deleteCategoryValidator, deleteCategory);

export default router;
