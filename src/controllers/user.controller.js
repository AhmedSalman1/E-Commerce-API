import sharp from 'sharp';
import catchAsyncError from 'express-async-handler';

import * as factory from './handlerFactory.js';
import { User } from '../models/user.model.js';
import { uploadSingleImage } from '../middlewares/uploadImageMiddleware.js';
import { s3Upload } from '../services/s3.service.js';
import { AppError } from '../utils/appError.js';

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

export const changePassword = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).select('+password');

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
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
    {
      new: true,
      runValidators: true,
    }
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
