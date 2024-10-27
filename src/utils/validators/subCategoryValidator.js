import slugify from 'slugify';
import { check } from 'express-validator';
import { validatorMiddleware } from '../../middlewares/validatorMiddleware.js';

const idValidationChain = [
  check('id').isMongoId().withMessage('Invalid SubCategory ID format!'),
];

export const getSubCategoryValidator = [
  ...idValidationChain,
  validatorMiddleware,
];

export const createSubCategoryValidator = [
  check('name')
    .notEmpty()
    .withMessage('SubCategory name is required!')
    .isLength({ min: 2, max: 30 })
    .withMessage('SubCategory name must be between 2 and 30 characters long!')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check('category')
    .notEmpty()
    .withMessage('subCategory must belong to category!')
    .isMongoId()
    .withMessage('Invalid Category ID format!'),

  validatorMiddleware,
];

export const updateSubCategoryValidator = [
  ...idValidationChain,
  check('name')
    .optional()
    .isLength({ min: 2 })
    .withMessage('SubCategory name must be at least 2 characters long!')
    .isLength({ max: 30 })
    .withMessage('SubCategory name must be at most 30 characters long!')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  validatorMiddleware,
];

export const deleteSubCategoryValidator = [
  ...idValidationChain,

  validatorMiddleware,
];
