import catchAsyncError from 'express-async-handler';
import Stripe from 'stripe';

import * as factory from './handlerFactory.js';
import { Order } from '../models/order.model.js';
import { Cart } from '../models/cart.model.js';
import { Product } from '../models/product.model.js';
import { AppError } from '../utils/appError.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

/*                   STRIPE                   */
export const getCheckoutSession = catchAsyncError(async (req, res, next) => {
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

  // 3) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'egp',
          unit_amount: totalPrice * 100,
          product_data: {
            name: req.user.name,
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/orders`,
    cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    customer_email: req.user.email,
    client_reference_id: cart._id,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4) Send session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

export const webhookCheckout = catchAsyncError(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    console.log('Create Order here...');
  }
});
