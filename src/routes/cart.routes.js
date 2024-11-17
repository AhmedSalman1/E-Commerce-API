import express from 'express';

import {
  addProductToCart,
  getCart,
  removeItemFromCart,
  clearCart,
} from '../controllers/cart.controller.js';

import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.use(authController.protect, authController.restrictTo('user'));

router.route('/').get(getCart).post(addProductToCart).delete(clearCart);
router.route('/:itemId').patch(removeItemFromCart);

export default router;
