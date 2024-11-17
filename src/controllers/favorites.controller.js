import catchAsyncError from 'express-async-handler';

import { User } from '../models/user.model.js';

export const addProductToFavorites = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { favorites: req.body.productId },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Product added to favorites successfully',
    data: user.favorites,
  });
});

export const removeProductFromFavorites = catchAsyncError(
  async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { favorites: req.params.productId },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Product removed successfully from your favorites',
      data: user.favorites,
    });
  }
);

export const getFavorites = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('favorites');

  res.status(200).json({
    status: 'success',
    result: user.favorites.length,
    data: user.favorites,
  });
});
