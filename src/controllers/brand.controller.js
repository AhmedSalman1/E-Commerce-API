import sharp from 'sharp';
import catchAsyncError from 'express-async-handler';

import * as factory from './handlerFactory.js';
import { Brand } from '../models/brand.model.js';
import { uploadSingleImage } from '../middlewares/uploadImageMiddleware.js';
import { s3Upload } from '../services/s3.service.js';
import { AppError } from '../utils/appError.js';

export const uploadBrandImage = uploadSingleImage('image');

export const resizeBrandImage = catchAsyncError(async (req, res, next) => {
  // console.log(req.file);
  if (!req.file) return next();

  try {
    const buffer = await sharp(req.file.buffer)
      .resize(400, 400)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const uploadResult = await s3Upload({
      originalname: `brand`,
      buffer,
    });

    // Save image name in DB
    req.body.image = uploadResult.Location;
    next();
  } catch (err) {
    return next(new AppError(`Error uploading image to S3`, 500));
  }
});

export const getAllBrands = factory.getAll(Brand);
export const getBrand = factory.getOne(Brand);
export const createBrand = factory.createOne(Brand);
export const updateBrand = factory.updateOne(Brand);
export const deleteBrand = factory.deleteOne(Brand);
