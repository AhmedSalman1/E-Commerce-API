import catchAsyncError from 'express-async-handler';

import * as factory from './handlerFactory.js';
import { Order } from '../models/order.model.js';
import { Cart } from '../models/cart.model.js';
import { Product } from '../models/product.model.js';
import { AppError } from '../utils/appError.js';

export const createCashOrder = catchAsyncError(async (req, res, next) => {
  // 1) Get user cart
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  // 2) Get order price depend on cart price (check if coupon applied)
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalPrice;

  const totalPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create order with cash payment
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalPrice,
  });

  // 4) After create order, decrement product quantity, increment sold
  if (order) {
    const bulkOpt = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: item.quantity } },
      },
    }));

    await Product.bulkWrite(bulkOpt, {});

    // 5) Clear cart
    await Cart.findOneAndDelete({ user: req.user._id });
  }

  res.status(201).json({
    status: 'success',
    data: order,
  });
});

export const filterObjForUser = (req, res, next) => {
  if (req.user.role === 'user') req.filterObj = { user: req.user._id };
  next();
};

export const getAllOrders = factory.getAll(Order);

export const getOrder = factory.getOne(Order);

export const updateOrderToPaid = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: 'success',
    data: updatedOrder,
  });
});

export const updateOrderToDelivered = catchAsyncError(
  async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.status(200).json({
      status: 'success',
      data: updatedOrder,
    });
  }
);
