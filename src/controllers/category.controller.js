import slugify from 'slugify';
import catchAsyncError from 'express-async-handler';
import { Category } from '../models/category.model.js';
import { AppError } from '../utils/appError.js';
import { APIFeatures } from '../utils/apiFeatures.js';

export const getAllCategories = catchAsyncError(async (req, res) => {
  // Build query
  const totalDocuments = await Category.countDocuments();
  const features = new APIFeatures(Category.find(), req.query)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate(totalDocuments);

  // Execute query
  const { query, pagination } = features;
  const categories = await query;

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories,
    },
    pagination,
  });
});

export const getCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    return next(new AppError(`Category with ID ${id} not found`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});

export const createCategory = catchAsyncError(async (req, res) => {
  const { name } = req.body;

  const newCategory = await Category.create({
    name,
    slug: slugify(name),
  });

  res.status(201).json({
    status: 'success',
    data: {
      newCategory,
    },
  });
});

export const updateCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await Category.findByIdAndUpdate(
    id,
    { name, slug: slugify(name) },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!category) {
    return next(new AppError(`Category with ID ${id} not found`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});

export const deleteCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    return next(new AppError(`Category with ID ${id} not found`, 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
