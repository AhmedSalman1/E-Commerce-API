import express from 'express';

import {
  addProductToCart,
  getCart,
  removeItemFromCart,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
} from '../controllers/cart.controller.js';

import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.use(authController.protect, authController.restrictTo('user'));

router.route('/').get(getCart).post(addProductToCart).delete(clearCart);
router.patch('/applyCoupon', applyCoupon);
router
  .route('/:itemId')
  .patch(updateCartItemQuantity)
  .delete(removeItemFromCart);

export default router;
