import express from 'express';
import { param, validationResult } from 'express-validator';

import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';

const router = express.Router();

router.route('/').get(getAllCategories).post(createCategory);
router
  .route('/:id')
  .get(
    param('id').isMongoId().withMessage('Invalid Category ID format!'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    getCategory
  )
  .patch(updateCategory)
  .delete(deleteCategory);

export default router;
