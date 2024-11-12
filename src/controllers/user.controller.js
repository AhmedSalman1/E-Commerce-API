import sharp from 'sharp';
import catchAsyncError from 'express-async-handler';

import * as factory from './handlerFactory.js';
import { User } from '../models/user.model.js';
import { uploadSingleImage } from '../middlewares/uploadImageMiddleware.js';
import { s3Upload } from '../services/s3.service.js';
import { AppError } from '../utils/appError.js';
import { createToken } from '../utils/createToken.js';

export const uploadUserImage = uploadSingleImage('photo');

export const resizeUserImage = catchAsyncError(async (req, res, next) => {
  // console.log(req.file);
  if (!req.file) return next();

  try {
    const buffer = await sharp(req.file.buffer)
      .resize(400, 400)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const uploadResult = await s3Upload({
      originalname: `user`,
      buffer,
    });

    // Save photo name in DB
    req.body.photo = uploadResult.Location;
    next();
  } catch (err) {
    return next(new AppError(`Error uploading photo to S3`, 500));
  }
});

export const createUser = factory.createOne(User);
export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const updateUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
      photo: req.body.photo,
      role: req.body.role,
    },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return next(new AppError(`${User.modelName} with ID ${id} not found`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});
export const deleteUser = factory.deleteOne(User);

export const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

export const updateMe = catchAsyncError(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
      photo: req.body.photo,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const updateMyPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  const token = createToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

export const deleteMe = catchAsyncError(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
  });
});
