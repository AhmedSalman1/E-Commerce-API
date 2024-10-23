import { check } from 'express-validator';
import { validatorMiddleware } from '../../middlewares/validatorMiddleware.js';

const idValidationChain = [
  check('id').isMongoId().withMessage('Invalid Brand ID format!'),
];

export const getBrandValidator = [...idValidationChain, validatorMiddleware];

export const createBrandValidator = [
  check('name')
    .notEmpty()
    .withMessage('Brand name is required!')
    .isLength({ min: 2 })
    .withMessage('Brand name must be at least 2 characters long!')
    .isLength({ max: 30 })
    .withMessage('Brand name must be at most 30 characters long!'),

  validatorMiddleware,
];

export const updateBrandValidator = [
  ...idValidationChain,
  check('name')
    .optional()
    .isLength({ min: 3 })
    .withMessage('Brand name must be at least 3 characters long!')
    .isLength({ max: 30 })
    .withMessage('Brand name must be at most 30 characters long!'),

  validatorMiddleware,
];

export const deleteBrandValidator = [...idValidationChain, validatorMiddleware];
