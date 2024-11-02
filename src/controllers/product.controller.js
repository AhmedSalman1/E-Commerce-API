import sharp from 'sharp';
import catchAsyncError from 'express-async-handler';

import * as factory from './handlerFactory.js';
import { Product } from '../models/product.model.js';
import { uploadMultipleImages } from '../middlewares/uploadImageMiddleware.js';
import { s3Upload } from '../services/s3.service.js';

export const uploadProductImages = uploadMultipleImages([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

export const resizeProductImages = catchAsyncError(async (req, res, next) => {
  // console.log(req.files);
  // 1) Cover image
  if (req.files.imageCover) {
    const buffer = await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    const uploadResult = await s3Upload({
      originalname: `product-cover`,
      buffer,
    });

    // Save image name in DB
    req.body.imageCover = uploadResult.Location;
  }

  // 2) Images
  if (req.files.images) {
    const imageUploadPromises = req.files.images.map(async (img, idx) => {
      const imgBuffer = await sharp(img.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toBuffer();

      const uploadResult = await s3Upload({
        originalname: `product-${idx + 1}`,
        buffer: imgBuffer,
      });

      return uploadResult.Location;
    });

    req.body.images = await Promise.all(imageUploadPromises);
  }
  next();
});

export const getAllProducts = factory.getAll(Product);
export const getProduct = factory.getOne(Product);
export const createProduct = factory.createOne(Product);
export const updateProduct = factory.updateOne(Product);
export const deleteProduct = factory.deleteOne(Product);
