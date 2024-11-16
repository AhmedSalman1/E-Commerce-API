import { Review } from '../models/review.model.js';
import * as factory from './handlerFactory.js';

export const getReview = factory.getOne(Review);
export const getAllReviews = factory.getAll(Review);

export const setProductAndUserIdsToBody = (req, res, next) => {
  // Nested route
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

export const createReview = factory.createOne(Review);
export const updateReview = factory.updateOne(Review);
export const deleteReview = factory.deleteOne(Review);
