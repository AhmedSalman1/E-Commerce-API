import slugify from 'slugify';
import catchAsyncError from 'express-async-handler';
import { SubCategory } from '../models/subcategory.model.js';
import { AppError } from '../utils/appError.js';
import { APIFeatures } from '../utils/apiFeatures.js';

export const setCategoryIdToBody = (req, res, next) => {
  // Nested route
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

export const getAllSubCategories = catchAsyncError(async (req, res) => {
  // Build query
  const totalDocuments = await SubCategory.countDocuments();
  const features = new APIFeatures(SubCategory.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate(totalDocuments);

  // Execute query
  const { query, pagination } = features;
  const subCategories = await query;

  res.status(200).json({
    status: 'success',
    results: subCategories.length,
    data: {
      subCategories,
    },
    pagination,
  });
});

export const getSubCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const subCategory = await SubCategory.findById(id);

  if (!subCategory) {
    return next(new AppError(`SubCategory with ID ${id} not found`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      subCategory,
    },
  });
});

export const createSubCategory = catchAsyncError(async (req, res, next) => {
  const { name, category } = req.body;

  const subCategory = await SubCategory.create({
    name,
    slug: slugify(name),
    category,
  });

  res.status(201).json({
    status: 'success',
    data: {
      subCategory,
    },
  });
});

export const updateSubCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name, category } = req.body;

  const subCategory = await SubCategory.findByIdAndUpdate(
    id,
    {
      name,
      slug: slugify(name),
      category,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!subCategory) {
    return next(new AppError(`SubCategory with ID ${id} not found`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      subCategory,
    },
  });
});

export const deleteSubCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const subCategory = await SubCategory.findByIdAndDelete(id);

  if (!subCategory) {
    return next(new AppError(`SubCategory with ID ${id} not found`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
