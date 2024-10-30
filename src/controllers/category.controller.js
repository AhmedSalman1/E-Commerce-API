import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import catchAsyncError from 'express-async-handler';

import { AppError } from '../utils/appError.js';
import * as factory from './handlerFactory.js';
import { Category } from '../models/category.model.js';

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadCategoryImage = upload.single('image');

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
