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

export const createUser = factory.createOne(User);
export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
