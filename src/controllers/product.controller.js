import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import catchAsyncError from 'express-async-handler';

import * as factory from './handlerFactory.js';
import { Product } from '../models/product.model.js';
import { uploadMultipleImages } from '../middlewares/uploadImageMiddleware.js';

export const uploadProductImages = uploadMultipleImages([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

export const resizeProductImages = catchAsyncError(async (req, res, next) => {
  // console.log(req.files);

  // 1) Cover image
  if (req.files.imageCover) {
    const imageCoverFilename = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/products/${imageCoverFilename}`);

    // Save image name in DB
    req.body.imageCover = imageCoverFilename;
  }

  // 2) Images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, idx) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${idx + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/products/${imageName}`);

        // Save image name in DB
        req.body.images.push(imageName);
      })
    );
  }
  next();
});

export const getAllProducts = factory.getAll(Product);
export const getProduct = factory.getOne(Product);
export const createProduct = factory.createOne(Product);
export const updateProduct = factory.updateOne(Product);
export const deleteProduct = factory.deleteOne(Product);
