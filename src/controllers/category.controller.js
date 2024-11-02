import sharp from 'sharp';
import catchAsyncError from 'express-async-handler';

import * as factory from './handlerFactory.js';
import { Category } from '../models/category.model.js';
import { uploadSingleImage } from '../middlewares/uploadImageMiddleware.js';
import { s3Upload } from '../services/s3.service.js';
import { AppError } from '../utils/appError.js';

export const uploadCategoryImage = uploadSingleImage('image');

export const resizeCategoryImage = catchAsyncError(async (req, res, next) => {
  // console.log(req.file);
  if (!req.file) return next();

  try {
    const buffer = await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const uploadResult = await s3Upload({
      originalname: `category`,
      buffer,
    });

    // console.log(uploadResult);
    req.body.image = uploadResult.Location;
    next();
  } catch (err) {
    return next(new AppError(`Error uploading image to S3`, 500));
  }
});

export const getAllCategories = factory.getAll(Category);
export const getCategory = factory.getOne(Category);
export const createCategory = factory.createOne(Category);
export const updateCategory = factory.updateOne(Category);
export const deleteCategory = factory.deleteOne(Category);
