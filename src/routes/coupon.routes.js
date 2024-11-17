import express from 'express';

import {
  getAllCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/coupon.controller.js';

import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.use(
  authController.protect,
  authController.restrictTo('admin', 'manager')
);

router.route('/').get(getAllCoupons).post(createCoupon);
router.route('/:id').get(getCoupon).patch(updateCoupon).delete(deleteCoupon);

export default router;
