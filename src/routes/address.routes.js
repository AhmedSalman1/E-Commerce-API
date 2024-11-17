import express from 'express';

import {
  addAddress,
  removeAddress,
  getAddresses,
} from '../controllers/address.controller.js';

import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.use(authController.protect, authController.restrictTo('user'));

router.route('/').post(addAddress).get(getAddresses);

router.delete('/:addressId', removeAddress);

export default router;
