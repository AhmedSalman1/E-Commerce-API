import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import catchAsyncError from 'express-async-handler';

import * as factory from './handlerFactory.js';
import { Brand } from '../models/brand.model.js';
import { uploadSingleImage } from '../middlewares/uploadImageMiddleware.js';

export const uploadBrandImage = uploadSingleImage('image');

export const resizeBrandImage = catchAsyncError(async (req, res, next) => {
  // console.log(req.file);
  if (!req.file) return next();

  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(400, 400)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/brands/${filename}`);

  // Save image name in DB
  req.body.image = filename;

  next();
});

export const getAllBrands = factory.getAll(Brand);
export const getBrand = factory.getOne(Brand);
export const createBrand = factory.createOne(Brand);
export const updateBrand = factory.updateOne(Brand);
export const deleteBrand = factory.deleteOne(Brand);
