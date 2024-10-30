import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import catchAsyncError from 'express-async-handler';

import * as factory from './handlerFactory.js';
import { Category } from '../models/category.model.js';
import { uploadSingleImage } from '../middlewares/uploadImageMiddleware.js';

export const uploadCategoryImage = uploadSingleImage('image');

export const resizeCategoryImage = catchAsyncError(async (req, res, next) => {
  // console.log(req.file);
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/categories/${filename}`);

  // Save image name in DB
  req.body.image = filename;

  next();
});

export const getAllCategories = factory.getAll(Category);
export const getCategory = factory.getOne(Category);
export const createCategory = factory.createOne(Category);
export const updateCategory = factory.updateOne(Category);
export const deleteCategory = factory.deleteOne(Category);
