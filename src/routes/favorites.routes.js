import express from 'express';

import {
  addProductToFavorites,
  removeProductFromFavorites,
  getFavorites,
} from '../controllers/favorites.controller.js';

import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.use(authController.protect, authController.restrictTo('user'));

router.route('/').post(addProductToFavorites).get(getFavorites);

router.delete('/:productId', removeProductFromFavorites);

export default router;
