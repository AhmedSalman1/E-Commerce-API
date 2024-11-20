import express from 'express';

import {
  createCashOrder,
  getAllOrders,
  getOrder,
  filterObjForUser,
  updateOrderToPaid,
  updateOrderToDelivered,
  getCheckoutSession,
} from '../controllers/order.controller.js';

import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

router.use(authController.protect);

router.get(
  '/checkout-session/:cartId',
  authController.restrictTo('user'),
  getCheckoutSession
);

router
  .route('/')
  .post(authController.restrictTo('user'), createCashOrder)
  .get(
    authController.restrictTo('user', 'admin', 'manager'),
    filterObjForUser,
    getAllOrders
  )
  .delete();
router
  .route('/:id')
  .get(
    authController.restrictTo('user', 'admin', 'manager'),
    filterObjForUser,
    getOrder
  );

router.patch(
  '/:id/pay',
  authController.restrictTo('admin', 'manager'),
  updateOrderToPaid
);
router.patch(
  '/:id/deliver',
  authController.restrictTo('admin', 'manager'),
  updateOrderToDelivered
);

export default router;
