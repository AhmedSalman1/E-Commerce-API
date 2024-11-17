import catchAsyncError from 'express-async-handler';

import { User } from '../models/user.model.js';

export const addAddress = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Address added successfully',
    data: user.addresses,
  });
});

export const removeAddress = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Address removed successfully',
    data: user.addresses,
  });
});

export const getAddresses = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('addresses');

  res.status(200).json({
    status: 'success',
    result: user.addresses.length,
    data: user.addresses,
  });
});
