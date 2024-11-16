import express from 'express';
import {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} from '../utils/validators/reviewValidator.js';

import {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  setProductAndUserIdsToBody,
} from '../controllers/review.controller.js';

import * as authController from '../controllers/auth.controller.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    setProductAndUserIdsToBody,
    createReviewValidator,
    createReview
  );
router
  .route('/:id')
  .get(getReviewValidator, getReview)
  .patch(
    authController.protect,
    authController.restrictTo('user'),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authController.protect,
    authController.restrictTo('user', 'manager', 'admin'),
    deleteReviewValidator,
    deleteReview
  );

export default router;
