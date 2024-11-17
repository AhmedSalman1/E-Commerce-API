import catchAsyncError from 'express-async-handler';

import { Cart } from '../models/cart.model.js';
import { Product } from '../models/product.model.js';
import { AppError } from '../utils/appError.js';

const CalculateTotalPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => (totalPrice += item.price * item.quantity));

  cart.totalPrice = totalPrice;
  return totalPrice;
};

export const addProductToCart = catchAsyncError(async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await Product.findById(productId);

  // Get the cart of the user
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    // product exist in cart, update quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;

      cart.cartItems[productIndex] = cartItem;
    } else {
      // product not exist in cart, push to cartItems
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }

  CalculateTotalPrice(cart);
  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Product added to cart successfully',
    data: cart,
  });
});

export const getCart = catchAsyncError(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  res.status(200).json({
    status: 'success',
    numberOfItems: cart.cartItems.length,
    data: cart,
  });
});

export const removeItemFromCart = catchAsyncError(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true, runValidators: true }
  );

  CalculateTotalPrice(cart);
  await cart.save();

  res.status(200).json({
    status: 'success',
    numberOfItems: cart.cartItems.length,
    data: cart,
  });
});

export const clearCart = catchAsyncError(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
