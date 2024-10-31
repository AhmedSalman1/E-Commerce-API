import multer from 'multer';
import { AppError } from '../utils/appError.js';

const multerOptions = () => {
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

  return upload;
};

export const uploadSingleImage = (fieldName) =>
  multerOptions().single(fieldName);

export const uploadMultipleImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);
