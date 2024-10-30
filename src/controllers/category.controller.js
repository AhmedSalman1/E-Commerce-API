import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/appError.js';
import * as factory from './handlerFactory.js';
import { Category } from '../models/category.model.js';

// Disk Storage
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/categories');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `category-${uuidv4()}-${Date.now()}.${ext}`);
  },
});

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

export const getAllCategories = factory.getAll(Category);
export const getCategory = factory.getOne(Category);
export const createCategory = factory.createOne(Category);
export const updateCategory = factory.updateOne(Category);
export const deleteCategory = factory.deleteOne(Category);
