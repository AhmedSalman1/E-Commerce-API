import slugify from 'slugify';
import { check } from 'express-validator';
import { validatorMiddleware } from '../../middlewares/validatorMiddleware.js';
import { User } from '../../models/user.model.js';

const idValidationChain = [
  check('id').isMongoId().withMessage('Invalid User ID format!'),
];

export const createUserValidator = [
  check('name')
    .notEmpty()
    .withMessage('User name is required!')
    .isLength({ min: 3 })
    .withMessage('User name too short!')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check('email')
    .notEmpty()
    .withMessage('Email is required!')
    .isEmail()
    .withMessage('Invalid email format!')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('Email already in use!'));
        }
      })
    ),

  check('password')
    .notEmpty()
    .withMessage('Password is required!')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long!')
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error('Passwords do not match!');
      }
      return true;
    }),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('Password confirmation is required!'),

  check('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Invalid phone number format!'),

  validatorMiddleware,
];

export const getUserValidator = [...idValidationChain, validatorMiddleware];

export const updateUserValidator = [
  ...idValidationChain,
  check('name')
    .optional()
    .isLength({ min: 3 })
    .withMessage('User name must be at least 3 characters long!')
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  validatorMiddleware,
];

export const deleteUserValidator = [...idValidationChain, validatorMiddleware];
