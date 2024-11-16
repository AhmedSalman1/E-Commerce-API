import { check } from 'express-validator';
import { validatorMiddleware } from '../../middlewares/validatorMiddleware.js';
import { Review } from '../../models/review.model.js';

const idValidationChain = [
  check('id').isMongoId().withMessage('Invalid Review ID format!'),
];

export const getReviewValidator = [...idValidationChain, validatorMiddleware];

export const createReviewValidator = [
  check('review').optional(),

  check('rating')
    .notEmpty()
    .withMessage('Rating is required!')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5!'),

  check('user')
    .isMongoId()
    .withMessage('Invalid Review ID format!')
    .custom((val, { req }) => {
      if (req.body.user.toString() !== req.user._id.toString()) {
        throw new Error('You are not allowed to create this review!');
      }

      return true;
    }),

  check('product')
    .isMongoId()
    .withMessage('Invalid Review ID format!')
    .custom(async (val, { req }) => {
      const review = await Review.findOne({
        user: req.user._id,
        product: req.body.product,
      });

      if (review) {
        throw new Error('You have already reviewed this product!');
      }

      return true;
    }),

  validatorMiddleware,
];

export const updateReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Review ID format!')
    .custom(async (val, { req }) => {
      const review = await Review.findById(val);

      if (!review) {
        throw new Error(`Review with ID ${val} does not exist!`);
      }

      if (review.user._id.toString() !== req.user._id.toString()) {
        throw new Error('You are not allowed to update this review!');
      }

      return true;
    }),

  validatorMiddleware,
];

export const deleteReviewValidator = [
  check('id')
    .isMongoId()
    .withMessage('Invalid Review ID format!')
    .custom(async (val, { req }) => {
      if (req.user.role === 'user') {
        const review = await Review.findById(val);

        if (!review) {
          throw new Error(`Review with ID ${val} does not exist!`);
        }

        if (review.user._id.toString() !== req.user._id.toString()) {
          throw new Error('You are not allowed to delete this review!');
        }
      }

      return true;
    }),

  validatorMiddleware,
];
