import { check } from 'express-validator';
import { validatorMiddleware } from '../../middlewares/validatorMiddleware.js';

const idValidationChain = [
  check('id').isMongoId().withMessage('Invalid Category ID format!'),
];

export const getCategoryValidator = [...idValidationChain, validatorMiddleware];

export const createCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('Category name is required!')
    .isLength({ min: 3 })
    .withMessage('Category name must be at least 3 characters long!')
    .isLength({ max: 30 })
    .withMessage('Category name must be at most 30 characters long!'),

  validatorMiddleware,
];

export const updateCategoryValidator = [
  ...idValidationChain,
  check('name')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Category name must be at least 3 characters long!')
    .isLength({ max: 30 })
    .withMessage('Category name must be at most 30 characters long!'),

  validatorMiddleware,
];

export const deleteCategoryValidator = [
  ...idValidationChain,

  validatorMiddleware,
];
